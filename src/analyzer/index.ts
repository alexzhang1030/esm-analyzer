import pLimit from 'p-limit'
import type { NodeItem } from 'to-path-tree'
import { pathToTree, walkPathTree } from 'to-path-tree'
import type { AcceptableLang, ScanExportResult, ScanImportResult, ScanVariableDeclarationResult } from '..'
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

export class Project {
  #name: string
  #mapping: Map</* _absolute_ file name */string, MapData> = new Map()

  #progress = new Progress()

  get name() {
    return this.#name
  }

  constructor(name: string) {
    this.#name = name
  }

  #scanFile(code: string, lang: AcceptableLang) {
    return scan(code, lang)
  }

  /**
   *
   * @param fileName must be **absolute** file name
   * @param fileCode
   */
  addFile(fileName: string, fileCode: string) {
    if (!isAcceptableLang(fileName))
      throw new Error(`File name "${fileName}" is not acceptable.`)
    const lang = getLangByFileName(fileName)
    this.#mapping.set(fileName, {
      source: {
        code: fileCode,
        lang,
      },
    })
    this.#progress.addProgress(2) // 1 for scan, 1 for analyze
  }

  onProgress(callback: (progress: number) => void) {
    this.#progress.onProgress(callback)
  }

  async prepare() {
    const codes = this.#mapping.entries()
    const filepaths = Array.from(codes, ([filename]) => filename)
    const scanTasks: (() => Promise<void>)[] = []
    const analyzeTasks: (() => Promise<void>)[] = []
    const tree = pathToTree<TreeNodeData>(filepaths, {
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
          targetNode.analyzer = new Analyzer(item, r)
          this.#progress.reduce()
        }) as any)
        scanTasks.push(limit(() => {
          node.analyzer!.analyze()
        }) as any)
      })
    })
    await Promise.all(scanTasks)
    await Promise.all(analyzeTasks)
  }

  getTreeNode(filename: string) {
    return this.#mapping.get(filename)?.referToNode
  }

  findAnalyzeResults(filename: string) {
    return this.#mapping.get(filename)?.analyzer?.getResults()
  }
}
