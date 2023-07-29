import { Project } from '@/analyzer'
import { Analyzer } from '@/analyzer/analyze'

describe('project', async () => {
  test('file paths to tree', () => {

  })
  const code1 = {
    filename: '/src/bar.js',
    code: `
      export const bar = 'bar'
    `,
  }
  const code2 = {
    filename: '/src/foo.js',
    code: `
      import { bar } from './bar'
      export const foo = bar
    `,
  }
  const p = new Project('test')
  p.addFile(code1.filename, code1.code)
  p.addFile(code2.filename, code2.code)
  await p.prepare()
  test('find the location of bar that /src/foo.js imported', async () => {
    const node = p.getTreeNode(code2.filename)
    const a = new Analyzer(node!)
    const { file, nodeData } = a.findImportLocation('bar')!
    expect({ file, loc: nodeData.loc }).toMatchInlineSnapshot(`
      {
        "file": "/src/bar.js",
        "loc": {
          "end": {
            "column": 30,
            "index": 31,
            "line": 2,
          },
          "start": {
            "column": 6,
            "index": 7,
            "line": 2,
          },
        },
      }
    `)
  })
})
