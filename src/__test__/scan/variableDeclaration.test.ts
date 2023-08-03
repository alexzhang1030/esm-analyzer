import { loadScanner } from '@/scanner'
import { scanVariableDeclaration } from '@/scanner/variable'

describe('variableDeclaration', () => {
  test('should execute', () => {
    const code = 'const foo = "bar"'
    const result = loadScanner(code, 'js', node => scanVariableDeclaration(node))
    expect(result).toMatchSnapshot()
  })
  test('primitive', () => {
    const code = `
      const a = 1
      const b = '2'
      let c = true
      var d = null
    `
    const result = loadScanner(code, 'js', node => scanVariableDeclaration(node))
    expect(result).toMatchSnapshot()
  })
  test('function call', () => {
    const code = `
      const foo = ref(1)
      const bar = computed(() => 1)
      const baz = reactive({ a: 1 })
      const baz2 = ref([1, 2, 3])
    `
    const result = loadScanner(code, 'js', node => scanVariableDeclaration(node))
    expect(result).toMatchSnapshot()
  })
  test('identifier', () => {
    const code = `
      const foo = bar
    `
    const result = loadScanner(code, 'js', node => scanVariableDeclaration(node))
    expect(result).toMatchSnapshot()
  })
})

describe('variableDeclaration type', () => {
  test('includeType', () => {
    const code = `
      const a = 1
      const b = '2'
      let c = true
      var d = null
      const foo = ref(1)
    `
    const result = loadScanner(code, 'js', node => scanVariableDeclaration(node, { includeType: ['CallExpression'] }))
    expect(result).toMatchSnapshot()
  })
})

describe('offset', () => {
  const code = 'const a = 1'
  test('no offset', () => {
    const result = loadScanner(code, 'js', node => scanVariableDeclaration(node, {}))
    expect(result[0].loc.start).toStrictEqual({
      line: 1,
      column: 6,
      index: 6,
    })
  })
  test('offset with no wrap line', () => {
    const result = loadScanner(code, 'js', node => scanVariableDeclaration(node, {}, '123456'))
    expect(result[0].loc.start).toStrictEqual({
      line: 1,
      column: 6 + 6,
      index: 6 + 6,
    })
  })
  test('offset with wrap line', () => {
    const result = loadScanner(code, 'js', node => scanVariableDeclaration(node, {}, '123456\n'))
    expect(result[0].loc.start).toStrictEqual({
      line: 1 + 1,
      column: 6,
      index: 6 + 6 + 1,
    })
  })
})
