import type { ASTNode, ASTNodeLocation, t } from '@/types'
import { getASTNodeLocation, isImportDeclaration } from '@/common'

import { loop } from '@/utils'

interface ScanResultBase {
  source: string
  loc: ASTNodeLocation
}

export interface ScanImportResultDefault extends ScanResultBase {
  type: 'default'
  local: string // local name
}

export interface ScanImportResultNamespace extends ScanResultBase {
  type: 'namespace'
  local: string // local name
}

export interface ScanImportResultImport extends ScanResultBase {
  type: 'import'
  subType: 'id' | 'string'
  isType: boolean
  local: string // local name
  imported: string // imported name
}

export type ScanImportResult = ScanImportResultDefault | ScanImportResultNamespace | ScanImportResultImport

// import bar from 'foo'
function resolveDefaultSpecifier(node: t.ImportDefaultSpecifier) {
  return node.local.name
}

// import * as bar from 'foo'
function resolveNamespaceSpecifier(node: t.ImportNamespaceSpecifier) {
  return node.local.name
}

// import { bar } from 'foo'
function resolveImportSpecifier(node: t.ImportSpecifier) {
  let imported: string
  let subType: ScanImportResultImport['subType'] = 'id'
  const isType = node.importKind === 'type'
  if (node.imported.type === 'Identifier') {
    imported = node.imported.name
  }
  else {
    imported = node.imported.value
    subType = 'string'
  }
  return {
    imported,
    local: node.local.name,
    subType,
    isType,
  }
}

export interface ScanImportConfig {
  includeSource?: string[]
  excludeSource?: string[]
  skipType?: boolean
  offset?: number
}

export const defaultConfig: Required<ScanImportConfig> = {
  includeSource: [],
  excludeSource: [],
  skipType: false,
  offset: 0,
}

export function scanImport(node: ASTNode, config: ScanImportConfig = defaultConfig, offsetContent: string = ''): ScanImportResult[] | null {
  if (!isImportDeclaration(node))
    return null
  const items = node.specifiers
  if (!items.length)
    return null
  const result: ScanImportResult[] = []
  const source = node.source.value
  if (config.includeSource?.length && !config.includeSource.includes(source))
    return null
  if (config.excludeSource?.length && config.excludeSource.includes(source))
    return null
  const isType = node.importKind === 'type'
  if (config.skipType && isType)
    return null
  loop(items, (item) => {
    if (item.type === 'ImportDefaultSpecifier') {
      result.push({
        type: 'default',
        source,
        local: resolveDefaultSpecifier(item),
        loc: getASTNodeLocation(item, offsetContent),
      })
    }
    else if (item.type === 'ImportNamespaceSpecifier') {
      result.push({
        type: 'namespace',
        source,
        local: resolveNamespaceSpecifier(item),
        loc: getASTNodeLocation(item, offsetContent),
      })
    }
    else if (item.type === 'ImportSpecifier') {
      const { imported, local, subType, isType: subIsType } = resolveImportSpecifier(item)
      if (config.skipType && subIsType)
        return
      result.push({
        type: 'import',
        loc: getASTNodeLocation(item, offsetContent),
        source,
        imported,
        local,
        subType,
        isType: !isType ? subIsType : isType,
      })
    }
  })
  return result
}

export function getImportByName(name: string, imports: ScanImportResult[]) {
  return imports.find(item => item.type === 'import' && item.imported === name) ?? null
}
