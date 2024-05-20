import type { TreeNode } from 'to-path-tree'
import type {
  ArrayExpressionVariableValue,
  CallExpressionVariableValue,
  IdentifierVariableValue,
  ObjectExpressionVariableValue,
  PrimitiveVariableValue,
  ResolveVariableDeclaration,
  ScanExportResult,
  ScanImportResult,
  ScanVariableDeclarationResult,
} from '..'
import { getExportByName, getImportByName } from '..'
import type { TreeNodeData, TreeNodeItem } from '.'
import { loop, rangeLoop } from '@/utils'

function findTheEntry(node: TreeNodeItem) {
  if (node.isEntry)
    return node
  return node.parent.items.find(item => item.isEntry) ?? null
}

function findTheParentEntry(node: TreeNode<TreeNodeData>) {
  return node.items.find(item => item.isEntry) ?? null
}

function findSibling(node: TreeNodeItem, name: string) {
  return node.parent.items.find(item => item.filename === name) ?? null
}

function findChildren(node: TreeNode<TreeNodeData>, name: string) {
  return node.items.find(item => item.filename === name) ?? null
}

const IS_NOT_PATH_REG = /^(?!\.\/|\.).*/

export function isNotPath(path: string) {
  return IS_NOT_PATH_REG.test(path)
}

function getParentPaths(path: string) {
  const parentPaths = path.split('/').filter(item => item === '..')
  return parentPaths.length
}

function processParentPath(path: string, node: TreeNodeItem) {
  const parentLength = getParentPaths(path)
  if (parentLength === 0)
    return null
  let result: TreeNode<TreeNodeData> | null = null
  rangeLoop(parentLength, () => {
    result = result ? result.parent! : node.parent
  })
  return result
}

const LAST_IMPORT_REG = /\/([^/]+)$/

function getLastImport(path: string) {
  return LAST_IMPORT_REG.exec(path)?.[1] ?? null
}

function buildImportFileResult(node: TreeNodeItem | null) {
  return {
    type: 'importFile' as const,
    node,
  }
}

// ../foo/bar
export function getTargetNodeByPath(path: string, node: TreeNodeItem): ReturnType<typeof buildImportFileResult> | null | { type: 'importModule', importModule: string } {
  if (path === '.')
    return buildImportFileResult(findTheEntry(node))
  if (path === '..')
    return buildImportFileResult(findTheParentEntry(node.parent))
  if (isNotPath(path)) {
    return {
      type: 'importModule',
      importModule: path,
    }
  }
  // ./foo or ./../foo
  if (path.startsWith('./')) {
    path = path.slice(2)
    if (isNotPath(path))
      return buildImportFileResult(findSibling(node, path))
    if (path.startsWith('../')) {
      const resultNode = processParentPath(path, node)
      if (!resultNode)
        return null
      const importName = getLastImport(path)
      if (!importName)
        return null
      return buildImportFileResult(findChildren(resultNode, importName))
    }
  }
  // ../foo or ../../foo
  if (path.startsWith('../')) {
    const resultNode = processParentPath(path, node)
    if (!resultNode)
      return null
    const importName = getLastImport(path)
    if (!importName)
      return null
    return buildImportFileResult(findChildren(resultNode, importName))
  }
  return null
}

export interface AnalyzePrimitive extends PrimitiveVariableValue {
}

export interface AnalyzeIdentifier extends IdentifierVariableValue {
  fromImport: ScanImportResult | null
  fromExport: ScanExportResult | null
  importFile: string | null
}

export interface AnalyzeCallExpression extends CallExpressionVariableValue {
  calleeFrom: ScanImportResult | null
}

export interface AnalyzeArrayExpression extends ArrayExpressionVariableValue {
  values: AnalyzeResultType[]
}

export interface AnalyzeObjectExpression extends ObjectExpressionVariableValue {
  values: AnalyzeResultType[]
}

export type AnalyzeResultType = AnalyzePrimitive | AnalyzeIdentifier | AnalyzeCallExpression | AnalyzeArrayExpression | AnalyzeObjectExpression

export interface AnalyzeConfig {
  importFrom: string[]
}

export class Analyzer {
  #node: TreeNodeItem
  #scanData: TreeNodeData['scan']
  #analyzeResult: Map<
    ScanVariableDeclarationResult,
    AnalyzeResultType
  > = new Map()

  #analyzeConfig?: {
    importFrom: string[]
  }

  constructor(node: TreeNodeItem, stmts: TreeNodeData['scan'], config?: AnalyzeConfig) {
    this.#node = node
    this.#scanData = stmts
    this.#analyzeConfig = config
  }

  #getScanResult(init: ResolveVariableDeclaration) {
    if (!init)
      return null
    if (init.type === 'Identifier') {
      const result = this.findImportLocation(init.id)
      if (!result)
        return null
      if (result.type === 'importModule') {
        return {
          importType: 'module',
          type: init.type,
          importModule: result.importModule,
          id: init.id,
        }
      }
      else {
        return {
          importType: 'file',
          type: init.type,
          fromImport: result?.fromImport ?? null,
          fromExport: result?.fromExport ?? null,
          importFile: result?.importFile ?? null,
          id: init.id,
        }
      }
    }
    else if (init.type === 'ArrayExpression') {
      const values = init.value.map(item => this.#getScanResult(item)) as AnalyzeResultType[]
      return {
        ...init,
        values,
      }
    }
    else if (init.type === 'ObjectExpression') {
      const values = Object.entries(init.value).reduce((result, [key, value]) => {
        result[key] = this.#getScanResult(value)
        return result
      }, {} as AnalyzeObjectExpression['value'])
      return {
        ...init,
        values,
      }
    }
    else if (init.type === 'CallExpression') {
      const importFrom = this.#analyzeConfig?.importFrom
      if (importFrom && !importFrom.includes(init.callee))
        return null
      const calleeFrom = this.findImportByIdentifyName(init.callee)
      return {
        ...init,
        calleeFrom,
      }
    }
    else {
      return init
    }
  }

  analyze() {
    loop(this.#scanData.variables, (v) => {
      const result = this.#getScanResult(v.init)
      if (result)
        this.#analyzeResult.set(v, result as AnalyzeResultType)
    })
  }

  findImportLocation(name: string) {
    const importFrom = this.#analyzeConfig?.importFrom
    // 1. find all import statements
    const imports = this.#node.data?.scan.imports
    if (!imports)
      return null
    // 2. get target node
    const importStmt = getImportByName(name, imports)
    const source = importStmt?.source
    if (!source)
      return null
    if (importFrom && !importFrom.includes(source))
      return null
    // 3. get target node by path
    const result = getTargetNodeByPath(source, this.#node)
    // 4. get export statement
    if (!result)
      return null
    if (result.type === 'importModule') {
      return {
        type: 'importModule',
        importModule: result.importModule,
      }
    }
    else {
      const node = result.node
      if (!node)
        return null
      const exportStmt = node.data!.scan.exports
      const exportNode = getExportByName(name, exportStmt)
      if (!exportNode)
        return null
      return {
        type: 'importFile',
        importFile: node.path,
        fromImport: importStmt,
        fromExport: exportNode,
      }
    }
  }

  findImportByIdentifyName(name: string) {
    const imports = this.#node.data?.scan.imports
    if (!imports)
      return null
    return getImportByName(name, imports)
  }

  getResults() {
    return this.#analyzeResult
  }
}
