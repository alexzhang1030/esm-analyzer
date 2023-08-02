import pLimit from 'p-limit'
import type { NodeItem } from 'to-path-tree'
import { pathToTree, walkPathTree } from 'to-path-tree'
import type { AcceptableLang, ScanExportResult, ScanImportResult, ScanVariableDeclarationResult, VariableType } from '..'
import { scan } from '..'
import { Progress } from './progress'
import { Analyzer } from './analyze'
import { getLangByFileName, isAcceptableLang } from '@/common'
import { loop } from '@/utils'

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
  #mapping: Map</* _absolute_ file name */string, MapData> = new Map()
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

  #scanFile(code: string, lang: AcceptableLang) {
    const type = this.#config.prepare?.variables.type
    return scan(code, lang, type
      ? {
          variable: {
            includeType: type,
          },
        }
      : undefined)
  }

  /**
   *
   * @param fileName must be **absolute** file name
   * @param fileCode
   */
  addFile(fileName: string, fileCode: string, fileLang?: AcceptableLang) {
    const lang = fileLang ?? getLangByFileName(fileName)
    if (!isAcceptableLang(lang))
      throw new Error(`[ESM Analyzer] Unsupported language: ${lang}`)
    this.#mapping.set(fileName, {
      source: {
        code: fileCode,
        lang,
      },
    })
    this.#progress.addProgress(2) // 1 for scan, 1 for analyze
    this.#filePaths.push(fileName)
  }

  onProgress(callback: (progress: number) => void) {
    this.#progress.onProgress(callback)
  }

  async prepare(config?: PrepareConfig) {
    this.#config.prepare = config
    const importFrom = config?.variables.importFrom
    const scanTasks: (() => Promise<void>)[] = []
    const analyzeTasks: (() => Promise<void>)[] = []
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
        const { data, ext } = item
        const { code } = data!
        let node: MapData
        scanTasks.push(limit(() => {
          const r = this.#scanFile(code, ext as AcceptableLang)
          item.data!.scan = r
          const targetNode = node = this.#mapping.get(item.path)!
          targetNode.referToNode = item
          targetNode.analyzer = new Analyzer(item, r, importFrom ? { importFrom } : undefined)
          this.#progress.increment()
        }) as any)
        analyzeTasks.push(limit(() => {
          node.analyzer!.analyze()
          this.#progress.increment()
        }) as any)
      })
    })
    await Promise.all(scanTasks)
    await Promise.all(analyzeTasks)
  }

  getTreeNode(filename: string) {
    return this.#mapping.get(filename)?.referToNode
  }

  getAnalyzeResults(filename: string) {
    return this.#mapping.get(filename)?.analyzer?.getResults()
  }
}
