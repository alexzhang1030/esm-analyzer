# esm-analyzer

The scanner and analyzer of ESM(odule).

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

### `imports`

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

#### the standalone `import` scanner API

Also, you can use the standalone `import` scanner API(with `loadScanner` helper):

```ts
import { loadScanner } from 'esm-analyzer'

const scanners = [
  node => scanImport(node),
]
// the return value is a two dimensional array
const [importResults] = loadScanner(sourceCode, lang, scanners)
```

#### the import scanner config

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

## License

MIT
