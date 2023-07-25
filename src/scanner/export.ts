import { isImportDeclaration } from '@/common'
import type { ASTNode } from '@/types'

export function scanExport(node: ASTNode) {
  if (!isImportDeclaration(node))
    return null
}
