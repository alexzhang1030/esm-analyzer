# esm-analyzer

<a href="https://www.npmjs.com/package/esm-analyzer" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/v/esm-analyzer" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/esm-analyzer" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/npm/dt/esm-analyzer" alt="NPM Downloads" /></a>
<a href="https://github.com/alexzhang1030/esm-analyzer/blob/main/LICENSE" target="_blank" rel="noopener noreferrer"><img src="https://badgen.net/github/license/alexzhang1030/esm-analyzer" alt="License" /></a>

The scanner and analyzer of ESM.

- [esm-analyzer](#esm-analyzer)
  - [Installation](#installation)
  - [Scanner](#scanner)
    - [`lang`](#lang)
    - [`imports` scanner](#imports-scanner)
      - [cases](#cases)
      - [type definition](#type-definition)
      - [examples](#examples)
      - [the standalone API](#the-standalone-api)
      - [config](#config)
    - [`variable declarations` scanner](#variable-declarations-scanner)
      - [cases](#cases-1)
      - [type definition](#type-definition-1)
      - [examples](#examples-1)
      - [the standalone API](#the-standalone-api-1)
      - [config](#config-1)
    - [`export` scanner](#export-scanner)
      - [cases](#cases-2)
      - [type definition](#type-definition-2)
      - [examples](#examples-2)
      - [the standalone API](#the-standalone-api-2)
      - [config](#config-2)
  - [Analyzer](#analyzer)
  - [License](#license)

## Installation

```bash
pnpm i esm-analyzer
```

## Scanner

The scanner uses `@babel/parser` to parse the source code and find the `import` and `export` statements.

```ts
import { scan } from 'esm-analyzer'

const { imports, exports } = scan(sourceCode, lang)
```

### `lang`

The `lang` parameter is used to specify the language of the source code.

It can be one of the following values:

- `js`
- `jsx`
- `ts`
- `tsx`

### `imports` scanner

#### cases

- ✅ import default, e.g. `import foo from 'bar'`
- ✅ import namespace, e.g. `import * as foo from 'bar'`
- ✅ import named, e.g. `import { foo } from 'bar'`
- ✅ import named with alias, e.g. `import { foo as bar } from 'bar'`
- ✅ import type named, e.g. `import type { foo } from 'bar'` or `import { type foo } from 'bar'`

#### type definition

The `imports` type is defined as follows:

```ts
interface ScanResultBase {
  source: string
  loc: ASTNodeLocation
}

// import a from 'a'
interface ScanImportResultDefault extends ScanResultBase {
  type: 'default'
  local: string // a
}

// import * as a from 'a'
interface ScanImportResultNamespace extends ScanResultBase {
  type: 'namespace'
  local: string // a
}

// import { a as b } from 'a'
interface ScanImportResultImport extends ScanResultBase {
  type: 'import'
  subType: 'id' | 'string' // id: `import { a } from 'a'`; string: `import { 'a' } from 'a'`
  isType: boolean // `import type { a } from 'a'` or `import { type a } from 'a'`
  local: string // b
  imported: string // a
}

type ScanImportResultItem = ScanImportResultDefault | ScanImportResultNamespace | ScanImportResultImport
```

The `imports` is an array of `ScanImportResultItem`.

#### examples

The basic example:

```ts
const code = 'import foo from "bar"'
scan(code, 'js').imports
```

will be:

```ts
[
  {
    loc: {
      end: {
        column: 10,
        index: 10,
        line: 1,
      },
      start: {
        column: 7,
        index: 7,
        line: 1,
      },
    },
    local: 'foo',
    source: 'bar',
    type: 'default',
  },
]
```

#### the standalone API

Also, you can use the standalone `import` scanner API(with `loadScanner` helper):

```ts
import { loadScanner } from 'esm-analyzer'

const importResults = loadScanner(sourceCode, lang, node => scanImport(node))
```

#### config 

The `scanImport` function accepts a config object as the second parameter:

```ts
interface ScanImportConfig {
  includeSource?: string[] // the source list to be included
  excludeSource?: string[] // the source list to be excluded
  skipType?: boolean // whether to skip the type import
}

const defaultConfig: Required<ScanImportConfig> = {
  includeSource: [],
  excludeSource: [],
  skipType: false,
}
```

### `variable declarations` scanner

The `variable declarations` is an array of `ScanVariableDeclarationResult`.

#### cases 

- ❌ deferred init
- primitive declaration
  - ✅ `StringLiteral`
  - ✅ `NumericLiteral`
  - ✅ `BooleanLiteral`
  - ✅ `NullLiteral`
- ✅ reference declaration
- complex declaration
  - ✅ `ObjectExpression`
  - ✅ `ArrayExpression`
  - ✅ `CallExpression`
  - ❗ Others are not supported yet

#### type definition

The `ScanVariableDeclarationResult` is defined as follows:

```ts
export interface ScanVariableDeclarationResult {
  loc: ASTNodeLocation
  kind: t.VariableDeclaration['kind']
  name: string
  init: ResolveVariableDeclaration
}
```


#### examples

The basic example:

```ts
const code = 'const foo = "bar"'
scan(code, 'js').variables
```

The output will be:

```ts
[
  {
    init: {
      type: 'StringLiteral',
      value: 'bar',
    },
    kind: 'const',
    loc: {
      end: {
        column: 17,
        index: 17,
        line: 1,
      },
      start: {
        column: 6,
        index: 6,
        line: 1,
      },
    },
    name: 'foo',
  },
]
```

#### the standalone API

Also, you can use the standalone `variable` scanner API(with `loadScanner` helper):

```ts
import { loadScanner } from 'esm-analyzer'

const importResults = loadScanner(sourceCode, lang, node => scanVariableDeclaration(node))
```

#### config

The `scanVariableDeclaration` function accepts a config object as the second parameter:

```ts
export type VariableType =
  | 'StringLiteral'
  | 'NumericLiteral'
  | 'BooleanLiteral'
  | 'NullLiteral'
  | 'ObjectExpression'
  | 'ArrayExpression'
  | 'CallExpression'

interface ScanVariableDeclarationConfig {
  includeType?: VariableType[]
  excludeType?: VariableType[]
}
```

### `export` scanner

#### cases

- ✅ export default, e.g. `export default foo`
- ✅ export named, e.g. `export { foo }`
  - only support `Identifier` and primitive
  - functions are not supported yet
- ✅ export named with alias, e.g. `export { foo as bar }`
- ✅ export all, e.g. `export * from 'foo'`
- ❌ export type, e.g. `export type { foo } from 'bar'`
- ❌ export type named, e.g. `export { type foo } from 'bar'`

#### type definition

The `exports` type is defined as follows, will return `ScanExportResult[]`

```ts
export interface ScanExportNamedDeclarationResult {
  type: 'ExportNamedDeclaration'
  subType: 'VariableDeclaration'
  kind: t.VariableDeclaration['kind']
  declarations: {
    name: string
    init: ResolveVariableDeclaration
  }[]
}

export interface ScanExportNamedSpecifiersResult {
  type: 'ExportNamedDeclaration'
  subType: 'Specifiers'
  specifiers: {
    local: string
    exported: string
  }[]
  source: string | null
}

export interface ScanExportAllResult {
  type: 'ExportAllDeclaration'
  source: string
}

export interface ScanExportDefaultIdentifierResult {
  type: 'ExportDefaultDeclaration'
  subType: 'Identifier'
  id: string
}

export interface ScanExportDefaultObjectResult {
  type: 'ExportDefaultDeclaration'
  subType: 'ObjectExpression'
  properties: {
    key: string
    value: ResolveVariableDeclaration
  }[]
}

export type ScanExportResult = (
  | ScanExportNamedDeclarationResult
  | ScanExportNamedSpecifiersResult
  | ScanExportAllResult
  | ScanExportDefaultIdentifierResult
  | ScanExportDefaultObjectResult
) & {
  loc: ASTNodeLocation
}
```

#### examples

The basic example:

```ts
const code = 'export default { a: 1, b: 2 }'
scan(code, 'js').exports
```

The result will be:

```ts
[
  {
    loc: {
      end: {
        column: 7,
        index: 58,
        line: 5,
      },
      start: {
        column: 6,
        index: 7,
        line: 2,
      },
    },
    properties: [
      {
        key: 'a',
        value: {
          type: 'NumericLiteral',
          value: 1,
        },
      },
      {
        key: 'b',
        value: {
          type: 'NumericLiteral',
          value: 2,
        },
      },
    ],
    subType: 'ObjectExpression',
    type: 'ExportDefaultDeclaration',
  },
]
```

#### the standalone API

Also, you can use the standalone `export` scanner API(with `loadScanner` helper):

```ts
import { loadScanner } from 'esm-analyzer'

const importResults = loadScanner(sourceCode, lang, node => scanExport(node))
```

#### config

The `scanExport` function accepts a config object as the second parameter:

```ts
export type ScanExportType =
  | 'ExportNamedDeclaration'
  | 'ExportAllDeclaration'
  | 'ExportDefaultDeclaration'

interface ScanExportConfig {
  includeType?: ScanExportType[]
  excludeType?: ScanExportType[]
}
```

## Analyzer

Under heavy development...

## License

MIT
