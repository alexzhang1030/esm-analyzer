# esm-analyzer

The scanner and analyzer of ESM.

- [esm-analyzer](#esm-analyzer)
  - [Installation](#installation)
  - [Scanner](#scanner)
    - [cases](#cases)
    - [`lang`](#lang)
    - [`imports` scanner](#imports-scanner)
      - [type definition](#type-definition)
      - [examples](#examples)
      - [the standalone API](#the-standalone-api)
      - [config](#config)
    - [`variable declarations` scanner](#variable-declarations-scanner)
      - [type definition](#type-definition-1)
    - [cases](#cases-1)
      - [examples](#examples-1)
      - [the standalone API](#the-standalone-api-1)
      - [config](#config-1)
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

### cases

- [x] import default, e.g. `import foo from 'bar'`
- [x] import namespace, e.g. `import * as foo from 'bar'`
- [x] import named, e.g. `import { foo } from 'bar'`
- [x] import named with alias, e.g. `import { foo as bar } from 'bar'`
- [x] import type named, e.g. `import type { foo } from 'bar'` or `import { type foo } from 'bar'`

### `lang`

The `lang` parameter is used to specify the language of the source code.

It can be one of the following values:

- `js`
- `jsx`
- `ts`
- `tsx`

### `imports` scanner

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

The `variable declarations` is an array of `ScanVariableDeclarationResultItem`.

#### type definition

The `ScanVariableDeclarationResultItem` is defined as follows:

```ts
export interface ScanVariableDeclarationResult {
  loc: ASTNodeLocation
  kind: t.VariableDeclaration['kind']
  name: string
  init: ResolveVariableDeclaration
}
```

### cases

- ❌ deferred init
- primitive declaration
  - ✅ `StringLiteral`
  - ✅ `NumericLiteral`
  - ✅ `BooleanLiteral`
  - ✅ `NullLiteral`
- complex declaration
  - ✅ `ObjectExpression`
  - ✅ `ArrayExpression`
  - ✅ `CallExpression`
  - ❗ Others are not supported yet


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

## License

MIT
