import type { ScanImportConfig } from './import'
import { scanImport } from './import'
import type { AcceptableLang } from '@/types'
import { loadScanner } from '@/common'

interface ScanConfig {
  import: ScanImportConfig
}

const defaultConfig: ScanConfig = {
  import: {},
}

export function scan(code: string, lang: AcceptableLang, config: ScanConfig = defaultConfig) {
  const [imports] = loadScanner(code, lang, [node => scanImport(node, config.import)])
  return {
    imports,
  }
}

export * from './import'
