import { scanImport } from './import'
import type { ScanImportResultItem } from './type'
import type { AcceptableLang } from '@/types'
import { babelParse, walkAST } from '@/common'

export function scan(code: string, lang: AcceptableLang) {
  const ast = babelParse(code, lang)
  const results: {
    import: ScanImportResultItem[]
  } = {
    import: [],
  }
  walkAST(ast, {
    enter(node) {
      const importResult = scanImport(node)
      if (importResult)
        results.import.push(...importResult)
    },
  })
  return results
}

export type * from './type'
