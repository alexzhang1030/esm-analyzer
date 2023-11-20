import { loadScanner } from '@/scanner'
import { scanExport } from '@/scanner/export'

describe('scan export', () => {
  it('export default', () => {
    const code = `
      export default {
        a: 1,
        b: 2
      }
    `
    const result = loadScanner(code, 'js', scanExport)
    expect(result).toMatchSnapshot()
  })
  it('export named declaration', () => {
    const code = `
      export const a = 1
      export const b = 2
      const c = 3
    `
    const result = loadScanner(code, 'js', scanExport)
    expect(result).toMatchSnapshot()
  })
  it('export named specifier', () => {
    const code = `
      export { a, b } from 'foo'
      const c = 3, d = 4
      export { c, d }
    `
    const result = loadScanner(code, 'js', scanExport)
    expect(result).toMatchSnapshot()
  })
  it('export all', () => {
    const code = `
      export * from 'foo'
      export * from './bar'
    `
    const result = loadScanner(code, 'js', scanExport)
    expect(result).toMatchSnapshot()
  })
})

describe('scan export pass config', () => {
  it('includeType', () => {
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
  it('excludeType', () => {
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

describe('offset', () => {
  const code = 'export const a = 1'
  it('no offset', () => {
    const result = loadScanner(code, 'js', node => scanExport(node, {}))
    expect(result[0].loc.start).toStrictEqual({
      line: 1,
      column: 0,
      index: 0,
    })
  })
  it('offset with no wrap line', () => {
    const result = loadScanner(code, 'js', node => scanExport(node, {}, '123456'))
    expect(result[0].loc.start).toStrictEqual({
      line: 1,
      column: 6,
      index: 6,
    })
  })
  it('offset with wrap line', () => {
    const result = loadScanner(code, 'js', node => scanExport(node, {}, '123456\n'))
    expect(result[0].loc.start).toStrictEqual({
      line: 1 + 1,
      column: 0,
      index: 6 + 1,
    })
  })
})
