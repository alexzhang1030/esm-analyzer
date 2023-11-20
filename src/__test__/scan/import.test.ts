import { loadScanner, loadScanners, scan, scanImport } from '@/scanner'

describe('scan import', () => {
  it('import default', () => {
    const code = 'import foo from \'bar\''
    expect(scan(code, 'js').imports).toMatchSnapshot()
  })
  it('import namespace', () => {
    const code = 'import * as foo from \'bar\''
    expect(scan(code, 'js').imports[0]).toMatchSnapshot()
  })
  it('import id', () => {
    const code = `
      import { foo, foo1 as foo2, "foo3" as foo4 } from 'bar'
      import { bar1 as bar2 } from 'bar'
      import { "baz1" as baz2 } from 'bar'
    `
    expect(scan(code, 'js')).toMatchSnapshot()
  })
  it('combine', () => {
    const code = `
      import foo from 'bar'
      import * as foo2 from 'bar1'
      import { foo3 } from 'bar2'
      import { foo3 as foo4 } from 'bar3'
    `
    expect(scan(code, 'js')).toMatchSnapshot()
  })
  it('import type', () => {
    const code = `
      import type { foo1, foo2 } from 'foo'
      import { type foo3, foo4_real }  from 'bar'
    `
    expect(scan(code, 'ts')).toMatchSnapshot()
  })
})

describe('pass config', () => {
  it('includeSource', () => {
    const code = `
      import { a } from 'vue'
      import { b } from 'react'
      import { c, d, type f } from '@vueuse/core'
    `
    const result = loadScanner(code, 'ts', node => scanImport(node, {
      includeSource: ['vue', '@vueuse/core'],
      skipType: true,
    }))
    expect(result).toMatchSnapshot()
  })
  it('excludeSource', () => {
    const code = `
      import { a } from 'vue'
      import { b } from 'react'
      import type { c, d } from '@vueuse/core'
    `
    const result = loadScanners(code, 'ts', [node => scanImport(node, {
      excludeSource: ['vue'],
      skipType: true,
    })])
    expect(result).toMatchSnapshot()
  })
})

describe('offset', () => {
  const code = 'import { a } from \'vue\''
  it('no offset', () => {
    const result = loadScanner(code, 'ts', node => scanImport(node, {}))
    expect(result[0].loc.start).toStrictEqual({
      line: 1,
      column: 9,
      index: 9,
    })
  })
  it('offset with no wrap line', () => {
    const result = loadScanner(code, 'ts', node => scanImport(node, {}, '123456'))
    expect(result[0].loc.start).toStrictEqual({
      line: 1,
      column: 9 + 6,
      index: 9 + 6,
    })
  })
  it('offset with wrap line', () => {
    const result = loadScanner(code, 'ts', node => scanImport(node, {}, '123456\n'))
    expect(result[0].loc.start).toStrictEqual({
      line: 1 + 1,
      column: 9,
      index: 9 + 6 + 1,
    })
  })
  it('offset with multiple wrap line', () => {
    const result = loadScanner(code, 'ts', node => scanImport(node, {}, '123456\n123456\n123456\n'))
    expect(result[0].loc.start).toStrictEqual({
      line: 1 + 1 * 3,
      column: 9,
      index: 9 + (6 + 1) * 3,
    })
  })
})
