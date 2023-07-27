import type { Primitive } from 'type-fest'
import type { ScanVariableDeclarationConfig } from '..'
import { isIdentifier } from './ast'
import type { ASTNode } from '@/types'

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

export function resolveVariableDeclarationValue(node?: ASTNode | null, config?: ScanVariableDeclarationConfig): ResolveVariableDeclaration {
  if (!node)
    return null
  const { includeType, excludeType } = config || {}
  // if not include
  if (includeType && !includeType.includes(node.type as VariableType))
    return null
  // if exclude
  if (excludeType && excludeType.includes(node.type as VariableType))
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
    case 'Identifier':
      return {
        type: node.type,
        id: node.name,
      }
  }
  return null
}
