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
    const c = p.getAnalyzeResults(code2.filename)
    expect(Array.from(c!.entries())).toMatchSnapshot()
  })
  test('third part module', async () => {
    const p = new Project('test')
    p.addFile('/src/foo.js', `
      import { bar } from 'lodash'
      export const foo = bar
    `)
    await p.prepare()
    const c = p.getAnalyzeResults('/src/foo.js')
    expect(Array.from(c!.entries())).toMatchSnapshot()
  })
  test('pass config', async () => {
    const p = new Project('test')
    p.addFile('/src/foo.js', `
      import { bar } from 'lodash'
      const foo = bar('1')
      const qux = 2
    `)
    await p.prepare({
      variables: {
        type: ['CallExpression'],
        importFrom: ['vue'],
      },
    })
    const c = p.getAnalyzeResults('/src/foo.js')
    expect(c).toMatchSnapshot()
  })
})
