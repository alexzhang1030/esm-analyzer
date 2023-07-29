import { loadScanner } from '@/scanner'
import { scanExport } from '@/scanner/export'

describe('scan export', () => {
  test('export default', () => {
    const code = `
      export default {
        a: 1,
        b: 2
      }
    `
    const result = loadScanner(code, 'js', scanExport)
    expect(result).toMatchSnapshot()
  })
  test('export named declaration', () => {
    const code = `
      export const a = 1
      export const b = 2
      const c = 3
    `
    const result = loadScanner(code, 'js', scanExport)
    expect(result).toMatchSnapshot()
  })
  test('export named specifier', () => {
    const code = `
      export { a, b } from 'foo'
      const c = 3, d = 4
      export { c, d }
    `
    const result = loadScanner(code, 'js', scanExport)
    expect(result).toMatchSnapshot()
  })
  test('export all', () => {
    const code = `
      export * from 'foo'
      export * from './bar'
    `
    const result = loadScanner(code, 'js', scanExport)
    expect(result).toMatchSnapshot()
  })
})

describe('scan export pass config', () => {
  test('includeType', () => {
    const code = `
      export const a = 1
      export const b = 2
      export default {
        a: 1,
        b: 2
      }
    `
    const result = loadScanner(code, 'js', node => scanExport(node, {
      includeType: ['ExportDefaultDeclaration'],
    }))
    expect(result).toMatchSnapshot()
  })
  test('excludeType', () => {
    const code = `
      export const a = 1
      export const b = 2
      export default {
        a: 1,
        b: 2
      }
    `
    const result = loadScanner(code, 'js', node => scanExport(node, {
      excludeType: ['ExportDefaultDeclaration'],
    }))
    expect(result).toMatchSnapshot()
  })
})
