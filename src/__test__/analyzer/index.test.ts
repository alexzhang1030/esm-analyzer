import { Project } from '@/analyzer'

describe('project', () => {
  test('find variable locations', async () => {
    const code1 = {
      filename: '/src/bar.js',
      code: `
      export const bar = 'bar'
    `,
    }
    const code2 = {
      filename: '/src/foo.js',
      code: `
      import { bar, ref } from './bar'
      export const foo = bar
      const foo2 = ref(1)
    `,
    }
    const p = new Project('test')
    p.addFile(code1.filename, code1.code)
    p.addFile(code2.filename, code2.code)
    await p.prepare()
    const c = p.findAnalyzeResults(code2.filename)
    expect(Array.from(c!.entries())).toMatchSnapshot()
  })
})
