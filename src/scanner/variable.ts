import type { ASTNode, ASTNodeLocation, ResolveVariableDeclaration, t, VariableType } from '@/types'
import {
  getASTNodeLocation,
  isIdentifier,
  isVariableDeclaration,
  resolveVariableDeclarationValue,
} from '@/common'
import { loop } from '@/utils'

export interface ScanVariableDeclarationResult {
  loc: ASTNodeLocation
  kind: t.VariableDeclaration['kind']
  name: string
  init: ResolveVariableDeclaration
}

export interface ScanVariableDeclarationConfig {
  includeType?: VariableType[]
  excludeType?: VariableType[]
}

export function scanVariableDeclaration(node: ASTNode, config?: ScanVariableDeclarationConfig, offsetContent: string = ''): ScanVariableDeclarationResult[] | null {
  if (!isVariableDeclaration(node))
    return null
  const result: ScanVariableDeclarationResult[] = []
  loop(node.declarations, (declaration) => {
    // TODO: handle more cases, currently only handle `identifier`
    // TODO: handle delay init, e.g. `var` and `let`
    if (!isIdentifier(declaration.id))
      return
    const value = {
      loc: getASTNodeLocation(declaration, offsetContent),
      kind: node.kind,
      name: declaration.id.name,
      init: resolveVariableDeclarationValue(declaration.init, config),
    }
    if (!value.init)
      return
    result.push(value)
  })
  return result
}
