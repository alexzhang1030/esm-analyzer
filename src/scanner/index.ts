import type { ScanImportConfig, ScanImportResult } from './import'
import { scanImport } from './import'
import type { ScanVariableDeclarationConfig, ScanVariableDeclarationResult } from './variable'
import { scanVariableDeclaration } from './variable'
import type { ScanExportConfig } from './export'
import { scanExport } from './export'
import type { AcceptableLang } from '@/types'
import { loadScanners } from '@/common'

interface ScanConfig {
  import?: ScanImportConfig
  variable?: ScanVariableDeclarationConfig
  export?: ScanExportConfig
}

export function scan(code: string, lang: AcceptableLang, config?: ScanConfig) {
  const [imports, variables, exports] = loadScanners(code, lang, [
    node => scanImport(node, config?.import),
    node => scanVariableDeclaration(node, config?.variable),
    node => scanExport(node, config?.export),
  ])
  return {
    imports,
    variables,
    exports,
  } as {
    imports: ScanImportResult[]
    variables: ScanVariableDeclarationResult[]
    exports: ScanVariableDeclarationResult[]
  }
}

export * from './import'
export * from './variable'
