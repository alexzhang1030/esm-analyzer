import { getASTNodeLocation, isImportDeclaration } from '@/common'
import type { ASTNode, ASTNodeLocation, t } from '@/types'

import { loop } from '@/utils'

interface ScanResultBase {
  source: string
  loc: ASTNodeLocation
}

interface ScanResultDefault extends ScanResultBase {
  type: 'default'
  local: string // local name
}

interface ScanResultNamespace extends ScanResultBase {
  type: 'namespace'
  local: string // local name
}

interface ScanResultImport extends ScanResultBase {
  type: 'import'
  subType: 'id' | 'string'
  isType: boolean
  local: string // local name
  imported: string // imported name
}

export type ScanImportResultItem = ScanResultDefault | ScanResultNamespace | ScanResultImport

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
  let subType: ScanResultImport['subType'] = 'id'
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

export function scanImport(node: ASTNode): ScanImportResultItem[] | null {
  if (!isImportDeclaration(node))
    return null
  const items = node.specifiers
  if (!items.length)
    return null
  const result: ScanImportResultItem[] = []
  const source = node.source.value
  const isType = node.importKind === 'type'
  loop(items, (item) => {
    if (item.type === 'ImportDefaultSpecifier') {
      result.push({
        type: 'default',
        source,
        local: resolveDefaultSpecifier(item),
        loc: getASTNodeLocation(item),
      })
    }
    else if (item.type === 'ImportNamespaceSpecifier') {
      result.push({
        type: 'namespace',
        source,
        local: resolveNamespaceSpecifier(item),
        loc: getASTNodeLocation(item),
      })
    }
    else if (item.type === 'ImportSpecifier') {
      const { imported, local, subType, isType: subIsType } = resolveImportSpecifier(item)
      result.push({
        type: 'import',
        loc: getASTNodeLocation(item),
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
