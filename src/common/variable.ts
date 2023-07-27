import type { Primitive } from 'type-fest'
import { isIdentifier } from './ast'
import type { ASTNode } from '@/types'

type PrimitiveValue =
  | Primitive
  | null | undefined

export interface PrimitiveVariableValue {
  type: 'StringLiteral' | 'NumericLiteral' | 'BooleanLiteral' | 'NullLiteral' | 'ObjectExpression' | 'ArrayExpression'
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

export type ResolveVariableDeclaration =
  | PrimitiveVariableValue
  | CallExpressionVariableValue
  | ObjectExpressionVariableValue
  | ArrayExpressionVariableValue
  | null

export function resolveVariableDeclarationValue(node?: ASTNode | null): ResolveVariableDeclaration {
  if (!node)
    return null
  switch (node.type) {
    case 'StringLiteral':
    case 'NumericLiteral':
    case 'BooleanLiteral':
      return {
        type: node.type,
        value: node.value,
      }
    case 'NullLiteral':
      return {
        type: node.type,
        value: null,
      }
    case 'ObjectExpression':
      return {
        type: node.type,
        value: node.properties.reduce((result, property) => {
          if (!property || property.type !== 'ObjectProperty')
            return result
          if (!isIdentifier(property.key))
            return result
          if (!property.value)
            return result
          result[property.key.name] = resolveVariableDeclarationValue(property.value)
          return result
        }, {} as ObjectExpressionVariableValue['value']),
      }
    case 'ArrayExpression':
      return {
        type: node.type,
        value: node.elements.map((item) => {
          return resolveVariableDeclarationValue(item)
        }),
      }
    case 'CallExpression':
      if (!node.callee || !isIdentifier(node.callee))
        return null
      return {
        type: node.type,
        callee: node.callee.name,
        arguments: node.arguments.map((item) => {
          return resolveVariableDeclarationValue(item)
        }),
      }
  }
  return null
}
