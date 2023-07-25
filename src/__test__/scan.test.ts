import { scan } from '@/scanner'

describe('scan import', () => {
  test('import default', () => {
    const code = 'import foo from \'bar\''
    expect(scan(code, 'js').import[0]).toMatchInlineSnapshot(`
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
      }
    `)
  })
  test('import namespace', () => {
    const code = 'import * as foo from \'bar\''
    expect(scan(code, 'js').import[0]).toMatchInlineSnapshot(`
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
    expect(scan(code, 'js').import).toMatchInlineSnapshot(`
      [
        {
          "imported": "foo",
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
      ]
    `)
  })
  test('combine', () => {
    const code = `
      import foo from 'bar'
      import * as foo2 from 'bar1'
      import { foo3 } from 'bar2'
      import { foo3 as foo4 } from 'bar3'
    `
    expect(scan(code, 'js').import).toMatchInlineSnapshot(`
      [
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
      ]
    `)
  })
})
