import type { ExportNamedDeclaration, ImportDeclaration } from '@babel/types'
import { walk } from 'estree-walker'
import type { ASTNode, ASTNodeLocation, WalkCallback, t } from '@/types'

export function walkAST(node: ASTNode, handlers: {
  enter?: WalkCallback
  leave?: WalkCallback
}): ASTNode {
  return walk(node, handlers)
}

export function getASTNodeLocation(node: ASTNode): ASTNodeLocation {
  const { start: _s, end: _e } = node.loc!
  return {
    start: {
      line: _s.line,
      column: _s.column,
      index: node.start!,
    },
    end: {
      line: _e.line,
      column: _e.column,
      index: node.end!,
    },
  }
}

// ast is
export function isImportDeclaration(node: ASTNode): node is ImportDeclaration {
  return node.type === 'ImportDeclaration'
}

export function isExportNamedDeclaration(node: ASTNode): node is ExportNamedDeclaration {
  return node.type === 'ExportNamedDeclaration'
}

export function isExportDefaultDeclaration(node: ASTNode): node is ExportNamedDeclaration {
  return node.type === 'ExportDefaultDeclaration'
}

export function isExportAllDeclaration(node: ASTNode): node is ExportNamedDeclaration {
  return node.type === 'ExportAllDeclaration'
}

export function isVariableDeclaration(node: ASTNode): node is t.VariableDeclaration {
  return node.type === 'VariableDeclaration'
}

export function isIdentifier(node: ASTNode): node is t.Identifier {
  return node.type === 'Identifier'
}
