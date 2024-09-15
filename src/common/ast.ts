import type { ASTNode, ASTNodeLocation, t, WalkCallback } from '@/types'
import { walk } from 'estree-walker'

export function walkAST(node: ASTNode, handlers: {
  enter?: WalkCallback
  leave?: WalkCallback
}): ASTNode {
  return walk(node, handlers)
}

function withOffsetContent(offsetContent: string, d: { line: number, column: number, index: number }) {
  if (!offsetContent.length)
    return d
  const lines = offsetContent.split('\n')
  const numNewlines = lines.length - 1
  if (numNewlines > 0)
    d.line += numNewlines
  else
    d.column += offsetContent.length
  return {
    line: d.line,
    column: d.column,
    index: d.index + offsetContent.length,
  }
}

// offset accepts offsetContent and offset number
export function getASTNodeLocation(node: ASTNode, offsetContent: string = ''): ASTNodeLocation {
  const { start: _s, end: _e } = node.loc!
  return {
    start: withOffsetContent(offsetContent, { ..._s, index: node.start! }),
    end: withOffsetContent(offsetContent, { ..._e, index: node.end! }),
  }
}

// ast is
export function isImportDeclaration(node: ASTNode): node is t.ImportDeclaration {
  return node.type === 'ImportDeclaration'
}

export function isExportNamedDeclaration(node: ASTNode): node is t.ExportNamedDeclaration {
  return node.type === 'ExportNamedDeclaration'
}

export function isExportDefaultDeclaration(node: ASTNode): node is t.ExportDefaultDeclaration {
  return node.type === 'ExportDefaultDeclaration'
}

export function isExportAllDeclaration(node: ASTNode): node is t.ExportAllDeclaration {
  return node.type === 'ExportAllDeclaration'
}

export function isVariableDeclaration(node: ASTNode): node is t.VariableDeclaration {
  return node.type === 'VariableDeclaration'
}

export function isIdentifier(node: ASTNode): node is t.Identifier {
  return node.type === 'Identifier'
}
