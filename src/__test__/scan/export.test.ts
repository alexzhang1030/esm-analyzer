import { scan } from '@/scanner'

describe('scan export', () => {
  test('export default', () => {
    const code = `
      export default {
        a: 1,
        b: 2
      }
    `
    const { imports } = scan(code, 'js')
    expect(imports).toEqual([])
  })
})
