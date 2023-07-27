import { loadScanner } from '@/common'
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
