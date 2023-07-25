import type { Node } from '@babel/types'
import type { WalkerContext } from 'estree-walker/types/walker'

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
