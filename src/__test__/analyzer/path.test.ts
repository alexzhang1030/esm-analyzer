import { isNotPath } from '@/analyzer/analyze'

describe('path', () => {
  test.each([
    ['./', false],
    ['a', true],
    ['b', true],
    ['.', false],
    ['../', false],
  ])('isNotPath(%s) === %s', (path, expected) => {
    expect(isNotPath(path)).toBe(expected)
  })
})
