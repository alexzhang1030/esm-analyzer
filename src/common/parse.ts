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

type LoadScannerReturnType<T extends ((...args: any[]) => any)[]> = NonNullable<ReturnType<T[number]>>[]

export function loadScanners<
  Func extends (node: ASTNode) => any[] | null = (node: ASTNode) => any[] | null,
  Funcs extends Func[] = Func[],
>(code: string, lang: string, scanner: Funcs) {
  if (!isAcceptableLang(lang))
    throw new Error(`[ESM Analyzer] Unsupported language: ${lang}`)
  const result = Array.from({ length: scanner.length }).fill(null).map<any>(() => [] as any)
  const ast = babelParse(code, lang)
  walkAST(ast, {
    enter(node) {
      loop(scanner, (scanner, index) => {
        const res = scanner(node)
        if (res)
          result[index].push(...res)
      })
    },
  })
  return result as LoadScannerReturnType<Funcs>
}

export function loadScanner<
  Func extends (node: ASTNode) => any[] | null = (node: ASTNode) => any[] | null,
  >(code: string, lang: string, scanner: Func) {
  return loadScanners(code, lang, [scanner])[0]
}
