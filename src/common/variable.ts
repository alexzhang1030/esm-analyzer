import type { ScanVariableDeclarationConfig } from '..'
import type { ASTNode, ObjectExpressionVariableValue, ResolveVariableDeclaration, VariableType } from '@/types'
import { isIdentifier } from './ast'

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
