import type { AcceptableLang } from '..'

const REGEX_LANG_TS = /.?[mc]?tsx?$/
const REGEX_LANG_JSX = /.?[jt]sx$/
const REGEX_ACCEPTABLE_LANG = /.?[mc]?[jt]sx?$/

export const isTS = (lang: string) => REGEX_LANG_TS.test(lang)
export const isJSX = (lang: string) => REGEX_LANG_JSX.test(lang)
export const isAcceptableLang = (filename: string) => REGEX_ACCEPTABLE_LANG.test(filename)

export function getLangByFileName(filename: string) {
  return filename.split('.').pop() as AcceptableLang
}
