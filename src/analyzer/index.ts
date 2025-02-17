import type { NodeItem } from 'to-path-tree'
import type { AcceptableLang, ScanExportResult, ScanImportResult, ScanVariableDeclarationResult, VariableType } from '..'
import { getLangByFileName, isAcceptableLang } from '@/common'
import { loop } from '@/utils'
import pLimit from 'p-limit'
import { pathToTree, walkPathTree } from 'to-path-tree'
import { scan } from '..'
import { Analyzer } from './analyze'
import { Progress } from './progress'

const limit = pLimit(10)

export interface TreeNodeData {
  code: string
  scan: {
    imports: ScanImportResult[]
    exports: ScanExportResult[]
    variables: ScanVariableDeclarationResult[]
  }
}

export type TreeNodeItem = NodeItem<TreeNodeData>

interface MapData {
  source: {
    code: string
    lang: AcceptableLang
    offsetContent: string
  }
  referToNode?: TreeNodeItem
  analyzer?: Analyzer
}

export interface PrepareConfig {
  variables: {
    type?: VariableType[]
    importFrom?: string[]
  }
}

export class Project {
  #name: string
  #mapping: Map<string, MapData> = new Map()
  #filePaths: string[] = []
  #config: {
    prepare?: PrepareConfig
  } = {}

  #progress = new Progress()

  get name() {
    return this.#name
  }

  constructor(name: string) {
    this.#name = name
  }

  #scanFile(code: string, lang: AcceptableLang, offsetContent?: string) {
    const type = this.#config.prepare?.variables.type
    return scan(code, lang, type
      ? {
          variable: {
            includeType: type,
          },
        }
      : undefined, offsetContent)
  }

  /**
   *
   * @param fileName must be **absolute** file name
   * @param fileCode
   */
  addFile(fileName: string, fileCode: string, fileLang: AcceptableLang = 'js', offsetContent = '') {
    const lang = fileLang ?? getLangByFileName(fileName)
    if (!isAcceptableLang(lang))
      throw new Error(`[ESM Analyzer] Unsupported language: ${lang}`)
    this.#mapping.set(fileName, {
      source: {
        code: fileCode,
        lang,
        offsetContent,
      },
    })
    this.#progress.addProgress(2) // 1 for scan, 1 for analyze
    this.#filePaths.push(fileName)
  }

  addFiles(files: { path: string, code: string, lang?: AcceptableLang, offsetContent?: string }[]) {
    loop(files, (file) => {
      this.addFile(file.path, file.code, file.lang, file.offsetContent)
    })
  }

  onProgress(callback: (progress: number) => void) {
    this.#progress.onProgress(callback)
  }

  async prepare(config?: PrepareConfig) {
    this.#config.prepare = config
    const importFrom = config?.variables.importFrom
    const tasks: (() => Promise<void>)[] = []
    const tree = pathToTree<TreeNodeData>(this.#filePaths, {
      getData: (node) => {
        return {
          code: this.#mapping.get(node.path)!.source.code,
          scan: {} as TreeNodeData['scan'],
        }
      },
    })
    walkPathTree(tree, (node) => {
      loop(node.items, (item) => {
        const { data } = item
        const { code } = data!
        tasks.push(limit(() => {
          const targetNode = this.#mapping.get(item.path)!
          const r = this.#scanFile(code, targetNode.source.lang, targetNode.source.offsetContent)
          item.data!.scan = r
          targetNode.referToNode = item
          targetNode.analyzer = new Analyzer(item, r, importFrom ? { importFrom } : undefined)
          this.#progress.increment()
          targetNode.analyzer?.analyze()
          this.#progress.increment()
        }) as any)
      })
    })
    await Promise.all(tasks)
  }

  getTreeNode(filename: string) {
    return this.#mapping.get(filename)?.referToNode
  }

  getAnalyzeResults(filename: string) {
    return this.#mapping.get(filename)?.analyzer?.getResults()
  }

  getMapping() {
    return this.#mapping
  }

  getFilePaths() {
    return this.#filePaths
  }
}

export * from './analyze'
