import { loadScanner, loadScanners, scan, scanImport } from '@/scanner'

describe('scan import', () => {
  test('import default', () => {
    const code = 'import foo from \'bar\''
    expect(scan(code, 'js').imports).toMatchSnapshot()
  })
  test('import namespace', () => {
    const code = 'import * as foo from \'bar\''
    expect(scan(code, 'js').imports[0]).toMatchSnapshot()
  })
  test('import id', () => {
    const code = `
      import { foo, foo1 as foo2, "foo3" as foo4 } from 'bar'
      import { bar1 as bar2 } from 'bar'
      import { "baz1" as baz2 } from 'bar'
    `
    expect(scan(code, 'js')).toMatchSnapshot()
  })
  test('combine', () => {
    const code = `
      import foo from 'bar'
      import * as foo2 from 'bar1'
      import { foo3 } from 'bar2'
      import { foo3 as foo4 } from 'bar3'
    `
    expect(scan(code, 'js')).toMatchSnapshot()
  })
  test('import type', () => {
    const code = `
      import type { foo1, foo2 } from 'foo'
      import { type foo3, foo4_real }  from 'bar'
    `
    expect(scan(code, 'ts')).toMatchSnapshot()
  })
})

describe('pass config', () => {
  test('includeSource', () => {
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
  test('excludeSource', () => {
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
