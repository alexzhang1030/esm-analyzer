import type { ScanImportConfig, ScanImportResult } from './import'
import { scanImport } from './import'
import type { ScanVariableDeclarationConfig, ScanVariableDeclarationResult } from './variable'
import { scanVariableDeclaration } from './variable'
import type { AcceptableLang } from '@/types'
import { loadScanners } from '@/common'

interface ScanConfig {
  import?: ScanImportConfig
  variable?: ScanVariableDeclarationConfig
}

export function scan(code: string, lang: AcceptableLang, config?: ScanConfig) {
  const [imports, variables] = loadScanners(code, lang, [
    node => scanImport(node, config?.import),
    node => scanVariableDeclaration(node, config?.variable),
  ])
  return {
    imports,
    variables,
  } as {
    imports: ScanImportResult[]
    variables: ScanVariableDeclarationResult[]
  }
}

export * from './import'
export * from './variable'
