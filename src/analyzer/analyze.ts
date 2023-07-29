import type { TreeNode } from 'to-path-tree'
import { getExportByName, getImportByName } from '..'
import type { TreeNodeData, TreeNodeItem } from '.'
import { rangeLoop } from '@/utils'

const ENTRY = 'index'

function findTheEntry(node: TreeNodeItem) {
  if (node.filename === ENTRY)
    return node
  return node.parent.items.find(item => item.filename === ENTRY) ?? null
}

function findTheParentEntry(node: TreeNode<TreeNodeData>) {
  return node.items.find(item => item.filename === ENTRY) ?? null
}

function findSibling(node: TreeNodeItem, name: string) {
  return node.parent.items.find(item => item.filename === name) ?? null
}

function findChildren(node: TreeNode<TreeNodeData>, name: string) {
  return node.items.find(item => item.filename === name) ?? null
}

export function isNotPath(path: string) {
  return /^(?!\.\/|\.|\.\.\/).*/.test(path)
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

function getLastImport(path: string) {
  return /\/([^/]+)$/.exec(path)?.[1] ?? null
}

// ../foo/bar
export function getTargetNodeByPath(path: string, node: TreeNodeItem) {
  if (path === '.')
    return findTheEntry(node)
  if (path === '..')
    return findTheParentEntry(node.parent)
  if (isNotPath(path)) {
    // TODO: resolve: is import from node_modules
    return null
  }
  // ./foo or ./../foo
  if (path.startsWith('./')) {
    path = path.slice(2)
    if (isNotPath(path))
      return findSibling(node, path)
    if (path.startsWith('../')) {
      const resultNode = processParentPath(path, node)
      if (!resultNode)
        return null
      const importName = getLastImport(path)
      if (!importName)
        return null
      return findChildren(resultNode, importName)
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
    return findChildren(resultNode, importName)
  }
}

export class Analyzer {
  #node: TreeNodeItem

  constructor(node: TreeNodeItem) {
    this.#node = node
  }

  findImportLocation(name: string) {
    // 1. find all import statements
    const imports = this.#node.data?.scan.imports
    if (!imports)
      return null
    // 2. get target node
    const source = getImportByName(name, imports)?.source
    if (!source)
      return null
    // 3. get target node by path
    const targetNode = getTargetNodeByPath(source, this.#node)
    // 4. get export statement
    if (!targetNode)
      return null
    const exportStmt = targetNode.data!.scan.exports
    const exportNode = getExportByName(name, exportStmt)
    if (!exportNode)
      return null
    return {
      nodeData: exportNode,
      file: targetNode.path,
    }
  }
}
