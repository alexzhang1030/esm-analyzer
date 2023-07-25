import { loadCode } from '@/common'
import { scan, scanImport } from '@/scanner'

describe('scan import', () => {
  test('import default', () => {
    const code = 'import foo from \'bar\''
    expect(scan(code, 'js').imports).toMatchInlineSnapshot(`
      [
        {
          "loc": {
            "end": {
              "column": 10,
              "index": 10,
              "line": 1,
            },
            "start": {
              "column": 7,
              "index": 7,
              "line": 1,
            },
          },
          "local": "foo",
          "source": "bar",
          "type": "default",
        },
      ]
    `)
  })
  test('import namespace', () => {
    const code = 'import * as foo from \'bar\''
    expect(scan(code, 'js').imports[0]).toMatchInlineSnapshot(`
      {
        "loc": {
          "end": {
            "column": 15,
            "index": 15,
            "line": 1,
          },
          "start": {
            "column": 7,
            "index": 7,
            "line": 1,
          },
        },
        "local": "foo",
        "source": "bar",
        "type": "namespace",
      }
    `)
  })
  test('import id', () => {
    const code = `
      import { foo, foo1 as foo2, "foo3" as foo4 } from 'bar'
      import { bar1 as bar2 } from 'bar'
      import { "baz1" as baz2 } from 'bar'
    `
    expect(scan(code, 'js')).toMatchInlineSnapshot(`
      {
        "imports": [
          {
            "imported": "foo",
            "isType": false,
            "loc": {
              "end": {
                "column": 18,
                "index": 19,
                "line": 2,
              },
              "start": {
                "column": 15,
                "index": 16,
                "line": 2,
              },
            },
            "local": "foo",
            "source": "bar",
            "subType": "id",
            "type": "import",
          },
          {
            "imported": "foo1",
            "isType": false,
            "loc": {
              "end": {
                "column": 32,
                "index": 33,
                "line": 2,
              },
              "start": {
                "column": 20,
                "index": 21,
                "line": 2,
              },
            },
            "local": "foo2",
            "source": "bar",
            "subType": "id",
            "type": "import",
          },
          {
            "imported": "foo3",
            "isType": false,
            "loc": {
              "end": {
                "column": 48,
                "index": 49,
                "line": 2,
              },
              "start": {
                "column": 34,
                "index": 35,
                "line": 2,
              },
            },
            "local": "foo4",
            "source": "bar",
            "subType": "string",
            "type": "import",
          },
          {
            "imported": "bar1",
            "isType": false,
            "loc": {
              "end": {
                "column": 27,
                "index": 90,
                "line": 3,
              },
              "start": {
                "column": 15,
                "index": 78,
                "line": 3,
              },
            },
            "local": "bar2",
            "source": "bar",
            "subType": "id",
            "type": "import",
          },
          {
            "imported": "baz1",
            "isType": false,
            "loc": {
              "end": {
                "column": 29,
                "index": 133,
                "line": 4,
              },
              "start": {
                "column": 15,
                "index": 119,
                "line": 4,
              },
            },
            "local": "baz2",
            "source": "bar",
            "subType": "string",
            "type": "import",
          },
        ],
      }
    `)
  })
  test('combine', () => {
    const code = `
      import foo from 'bar'
      import * as foo2 from 'bar1'
      import { foo3 } from 'bar2'
      import { foo3 as foo4 } from 'bar3'
    `
    expect(scan(code, 'js')).toMatchInlineSnapshot(`
      {
        "imports": [
          {
            "loc": {
              "end": {
                "column": 16,
                "index": 17,
                "line": 2,
              },
              "start": {
                "column": 13,
                "index": 14,
                "line": 2,
              },
            },
            "local": "foo",
            "source": "bar",
            "type": "default",
          },
          {
            "loc": {
              "end": {
                "column": 22,
                "index": 51,
                "line": 3,
              },
              "start": {
                "column": 13,
                "index": 42,
                "line": 3,
              },
            },
            "local": "foo2",
            "source": "bar1",
            "type": "namespace",
          },
          {
            "imported": "foo3",
            "isType": false,
            "loc": {
              "end": {
                "column": 19,
                "index": 83,
                "line": 4,
              },
              "start": {
                "column": 15,
                "index": 79,
                "line": 4,
              },
            },
            "local": "foo3",
            "source": "bar2",
            "subType": "id",
            "type": "import",
          },
          {
            "imported": "foo3",
            "isType": false,
            "loc": {
              "end": {
                "column": 27,
                "index": 125,
                "line": 5,
              },
              "start": {
                "column": 15,
                "index": 113,
                "line": 5,
              },
            },
            "local": "foo4",
            "source": "bar3",
            "subType": "id",
            "type": "import",
          },
        ],
      }
    `)
  })
  test('import type', () => {
    const code = `
      import type { foo1, foo2 } from 'foo'
      import { type foo3, foo4_real }  from 'bar'
    `
    expect(scan(code, 'ts')).toMatchInlineSnapshot(`
      {
        "imports": [
          {
            "imported": "foo1",
            "isType": true,
            "loc": {
              "end": {
                "column": 24,
                "index": 25,
                "line": 2,
              },
              "start": {
                "column": 20,
                "index": 21,
                "line": 2,
              },
            },
            "local": "foo1",
            "source": "foo",
            "subType": "id",
            "type": "import",
          },
          {
            "imported": "foo2",
            "isType": true,
            "loc": {
              "end": {
                "column": 30,
                "index": 31,
                "line": 2,
              },
              "start": {
                "column": 26,
                "index": 27,
                "line": 2,
              },
            },
            "local": "foo2",
            "source": "foo",
            "subType": "id",
            "type": "import",
          },
          {
            "imported": "foo3",
            "isType": true,
            "loc": {
              "end": {
                "column": 24,
                "index": 69,
                "line": 3,
              },
              "start": {
                "column": 15,
                "index": 60,
                "line": 3,
              },
            },
            "local": "foo3",
            "source": "bar",
            "subType": "id",
            "type": "import",
          },
          {
            "imported": "foo4_real",
            "isType": false,
            "loc": {
              "end": {
                "column": 35,
                "index": 80,
                "line": 3,
              },
              "start": {
                "column": 26,
                "index": 71,
                "line": 3,
              },
            },
            "local": "foo4_real",
            "source": "bar",
            "subType": "id",
            "type": "import",
          },
        ],
      }
    `)
  })
})

describe('pass config', () => {
  test('includeSource', () => {
    const code = `
      import { a } from 'vue'
      import { b } from 'react'
      import { c } from '@vueuse/core'
    `
    const result = loadCode(code, 'js', [node => scanImport(node, {
      includeSource: ['vue', '@vueuse/core'],
    })])
    expect(result).toMatchInlineSnapshot(`
      [
        [
          {
            "imported": "a",
            "isType": false,
            "loc": {
              "end": {
                "column": 16,
                "index": 17,
                "line": 2,
              },
              "start": {
                "column": 15,
                "index": 16,
                "line": 2,
              },
            },
            "local": "a",
            "source": "vue",
            "subType": "id",
            "type": "import",
          },
          {
            "imported": "c",
            "isType": false,
            "loc": {
              "end": {
                "column": 16,
                "index": 79,
                "line": 4,
              },
              "start": {
                "column": 15,
                "index": 78,
                "line": 4,
              },
            },
            "local": "c",
            "source": "@vueuse/core",
            "subType": "id",
            "type": "import",
          },
        ],
      ]
    `)
  })
})
