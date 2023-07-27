import type { Node } from '@babel/types'
import type { WalkerContext } from 'estree-walker/types/walker'
import type { Primitive } from 'type-fest'

export type ASTNode = Node
export type * as t from '@babel/types'
export type WalkCallback = (
  this: WalkerContext,
  node: Node, parent: Node | null,
  key: string | number | symbol | null | undefined,
  index: number | null | undefined
) => void
export type AcceptableLang = 'js' | 'jsx' | 'ts' | 'tsx'

export interface ASTNodeLocation {
  start: {
    line: number
    column: number
    index: number
  }
  end: {
    line: number
    column: number
    index: number
  }
}

export type VariableType =
  | 'StringLiteral'
  | 'NumericLiteral'
  | 'BooleanLiteral'
  | 'NullLiteral'
  | 'ObjectExpression'
  | 'ArrayExpression'
  | 'CallExpression'
  | 'Identifier'

type PrimitiveValue =
  | Primitive
  | null | undefined

export interface PrimitiveVariableValue {
  type:
  | 'StringLiteral'
  | 'NumericLiteral'
  | 'BooleanLiteral'
  | 'NullLiteral'
  value: PrimitiveValue | ResolveVariableDeclaration
}

export interface ObjectExpressionVariableValue {
  type: 'ObjectExpression'
  value: {
    [key: string]: ResolveVariableDeclaration
  }
}

export interface ArrayExpressionVariableValue {
  type: 'ArrayExpression'
  value: ResolveVariableDeclaration[]
}

export interface CallExpressionVariableValue {
  type: 'CallExpression'
  callee: string
  arguments: ResolveVariableDeclaration[]
}

export interface IdentifierVariableValue {
  type: 'Identifier'
  id: string
}

export type ResolveVariableDeclaration =
  | PrimitiveVariableValue
  | CallExpressionVariableValue
  | ObjectExpressionVariableValue
  | ArrayExpressionVariableValue
  | IdentifierVariableValue
  | null
