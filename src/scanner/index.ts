import type { ScanExportConfig, ScanExportResult } from './export'
import type { ScanImportConfig, ScanImportResult } from './import'
import type { ScanVariableDeclarationConfig, ScanVariableDeclarationResult } from './variable'
import type { AcceptableLang, ASTNode } from '@/types'
import { babelParse, isAcceptableLang, walkAST } from '@/common'
import { loop } from '@/utils'
import { scanExport } from './export'
import { scanImport } from './import'
import { scanVariableDeclaration } from './variable'

type NonNullable<T> = T extends null | undefined ? never : T
type Flat<T> = T extends (infer U)[] ? Flat<U> : T

type LoadScannerReturnType<T extends ((...args: any[]) => any)[]> = (Flat<NonNullable<ReturnType<T[number]>>>)[][]

export function loadScanners<
  Func extends (node: ASTNode, ...args: any[]) => any | null = (node: ASTNode, ...args: any[]) => any | null,
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
        if (res) {
          if (Array.isArray(res))
            result[index].push(...res)
          else
            result[index].push(res)
        }
      })
    },
  })
  return result as LoadScannerReturnType<Funcs>
}

export function loadScanner<
  Func extends (node: ASTNode, ...args: any[]) => any | null = (node: ASTNode, ...args: any[]) => any | null,
>(code: string, lang: string, scanner: Func) {
  return loadScanners(code, lang, [scanner])[0]
}

interface ScanConfig {
  import?: ScanImportConfig
  variable?: ScanVariableDeclarationConfig
  export?: ScanExportConfig
}

export function scan(code: string, lang: AcceptableLang, config?: ScanConfig, offsetContent = '') {
  const [imports, variables, exports] = loadScanners(code, lang, [
    node => scanImport(node, config?.import, offsetContent),
    node => scanVariableDeclaration(node, config?.variable, offsetContent),
    node => scanExport(node, config?.export, offsetContent),
  ])
  return {
    imports,
    variables,
    exports,
  } as {
    imports: ScanImportResult[]
    variables: ScanVariableDeclarationResult[]
    exports: ScanExportResult[]
  }
}

export * from './export'
export * from './import'
export * from './variable'
