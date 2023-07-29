import mitt from 'mitt'
import pLimit from 'p-limit'
import type { NodeItem } from 'to-path-tree'
import { pathToTree, walkPathTree } from 'to-path-tree'
import type { AcceptableLang, ScanExportResult, ScanImportResult, ScanVariableDeclarationResult } from '..'
import { scan } from '..'
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
}

export class Project {
  #name: string
  #mapping: Map</* _absolute_ file name */string, MapData> = new Map()

  #progress = 0
  #mitt = mitt<{
    progress: number
  }>()

  get name() {
    return this.#name
  }

  constructor(name: string) {
    this.#name = name
  }

  #emitProgress(progress: number) {
    this.#progress = progress
    this.#mitt.emit('progress', progress)
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
  }

  onProgress(callback: (progress: number) => void) {
    this.#mitt.on('progress', callback)
  }

  async prepare() {
    const codes = this.#mapping.entries()
    const filepaths = Array.from(codes, ([filename]) => filename)
    const tasks: (() => Promise<void>)[] = []
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
        tasks.push(limit(() => {
          const r = this.#scanFile(code, ext as AcceptableLang)
          this.#emitProgress(this.#progress + 1)
          item.data!.scan = r
          this.#mapping.get(item.path)!.referToNode = item
        }) as any)
      })
    })
    await Promise.all(tasks)
  }

  getTreeNode(filename: string) {
    return this.#mapping.get(filename)!.referToNode
  }
}
