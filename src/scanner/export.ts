import { getASTNodeLocation, isExportAllDeclaration, isExportDefaultDeclaration, isExportNamedDeclaration, isIdentifier, resolveVariableDeclarationValue } from '@/common'
import type { ASTNode, ASTNodeLocation, ResolveVariableDeclaration, t } from '@/types'
import { loop } from '@/utils'

export type ScanExportType =
  | 'ExportNamedDeclaration'
  | 'ExportAllDeclaration'
  | 'ExportDefaultDeclaration'

export interface ScanExportNamedDeclarationResult {
  type: 'ExportNamedDeclaration'
  subType: 'VariableDeclaration'
  kind: t.VariableDeclaration['kind']
  declarations: {
    name: string
    init: ResolveVariableDeclaration
  }[]
}

export interface ScanExportNamedSpecifiersResult {
  type: 'ExportNamedDeclaration'
  subType: 'Specifiers'
  specifiers: {
    local: string
    exported: string
  }[]
  source: string | null
}

export interface ScanExportAllResult {
  type: 'ExportAllDeclaration'
  source: string
}

export interface ScanExportDefaultIdentifierResult {
  type: 'ExportDefaultDeclaration'
  subType: 'Identifier'
  id: string
}

export interface ScanExportDefaultObjectResult {
  type: 'ExportDefaultDeclaration'
  subType: 'ObjectExpression'
  properties: {
    key: string
    value: ResolveVariableDeclaration
  }[]
}

export type ScanExportResult = (
  | ScanExportNamedDeclarationResult
  | ScanExportNamedSpecifiersResult
  | ScanExportAllResult
  | ScanExportDefaultIdentifierResult
  | ScanExportDefaultObjectResult
) & {
  loc: ASTNodeLocation
}

export interface ScanExportConfig {
  includeType?: ScanExportType[]
  excludeType?: ScanExportType[]
}

export function scanExport(node: ASTNode, config?: ScanExportConfig): ScanExportResult | null {
  if (
    !isExportNamedDeclaration(node)
    && !isExportDefaultDeclaration(node)
    && !isExportAllDeclaration(node)
  )
    return null
  if (config?.includeType && !config.includeType.includes(node.type))
    return null
  if (config?.excludeType && config.excludeType.includes(node.type))
    return null
  if (node.type === 'ExportNamedDeclaration') {
    if (node.declaration && node.declaration.type === 'VariableDeclaration') {
      const vars: ScanExportNamedDeclarationResult['declarations'] = []
      loop(node.declaration.declarations, (declaration) => {
        if (!isIdentifier(declaration.id))
          return
        const result = {
          name: declaration.id.name,
          init: resolveVariableDeclarationValue(declaration.init),
        }
        if (!result.init)
          return
        vars.push(result)
      })
      return {
        type: 'ExportNamedDeclaration',
        subType: 'VariableDeclaration',
        declarations: vars,
        kind: node.declaration.kind,
        loc: getASTNodeLocation(node),
      }
    }
    if (node.specifiers) {
      const specifiers: ScanExportNamedSpecifiersResult['specifiers'] = []
      loop(node.specifiers, (specifier) => {
        if (specifier.type !== 'ExportSpecifier')
          return
        if (!isIdentifier(specifier.local) || !isIdentifier(specifier.exported))
          return
        specifiers.push({
          local: specifier.local.name,
          exported: specifier.exported.name,
        })
      })
      return {
        type: 'ExportNamedDeclaration',
        subType: 'Specifiers',
        specifiers,
        source: node.source?.value || null,
        loc: getASTNodeLocation(node),
      }
    }
    return null
  }
  else if (node.type === 'ExportAllDeclaration') {
    return {
      type: 'ExportAllDeclaration',
      source: node.source.value,
      loc: getASTNodeLocation(node),
    }
  }
  else {
    if (node.declaration.type === 'Identifier') {
      return {
        type: 'ExportDefaultDeclaration',
        subType: 'Identifier',
        id: node.declaration.name,
        loc: getASTNodeLocation(node),
      }
    }
    else if (node.declaration.type === 'ObjectExpression') {
      return {
        type: 'ExportDefaultDeclaration',
        subType: 'ObjectExpression',
        loc: getASTNodeLocation(node),
        properties: node.declaration.properties.map((property) => {
          if (property.type !== 'ObjectProperty' || !isIdentifier(property.key))
            return null
          return {
            key: property.key.name,
            value: resolveVariableDeclarationValue(property.value),
          }
        }).filter(Boolean) as ScanExportDefaultObjectResult['properties'],
      }
    }
  }
  return null
}
