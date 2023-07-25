import { type ParserOptions, type ParserPlugin, parse } from '@babel/parser'
import { isAcceptableLang, isJSX, isTS } from './lang'
import { walkAST } from './ast'
import type { ASTNode } from '@/types'
import { loop } from '@/utils'

export function getBabelParsePlugins(lang: string) {
  const plugins: ParserPlugin[] = []
  if (isTS(lang))
    plugins.push('typescript')
  if (isJSX(lang))
    plugins.push('jsx')
  return plugins
}

export function babelParse(code: string, lang: string) {
  const options: ParserOptions = {
    plugins: getBabelParsePlugins(lang),
    sourceType: 'module',
  }
  return parse(code, options)
}

type NonNullable<T> = T extends null | undefined ? never : T

export function loadCode<I, R extends I[]>(code: string, lang: string, processors: ((node: ASTNode) => R | null)[]) {
  if (!isAcceptableLang(lang))
    throw new Error(`[ESM Analyzer] Unsupported language: ${lang}`)
  const result: NonNullable<R>[] = Array.from({ length: processors.length }).fill(null).map<NonNullable<R>>(() => [] as any)
  const ast = babelParse(code, lang)
  walkAST(ast, {
    enter(node) {
      loop(processors, (processor, index) => {
        const res = processor(node)
        if (res)
          result[index].push(...res)
      })
    },
  })
  return result
}
