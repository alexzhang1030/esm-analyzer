import type { ImportDeclaration } from '@babel/types'
import { walk } from 'estree-walker'
import type { ASTNode, ASTNodeLocation, WalkCallback } from '@/types'

export function walkAST(node: ASTNode, handlers: {
  enter?: WalkCallback
  leave?: WalkCallback
}): ASTNode {
  return walk(node, handlers)
}

export function isImportDeclaration(node: ASTNode): node is ImportDeclaration {
  return node.type === 'ImportDeclaration'
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
