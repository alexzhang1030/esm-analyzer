import { parse, type ParserOptions, type ParserPlugin } from '@babel/parser'
import { isJSX, isTS } from './lang'

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
