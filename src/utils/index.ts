export function loop<T>(
  items: T[],
  cb: (item: T, i: number) => unknown | void,
  range: [number, number] = [0, items.length],
) {
  let index = range[0]
  const end = range[1]
  while (index < end) {
    const item = items[index]
    cb(item, index)
    index++
  }
}

export function rangeLoop(len: number, cb: (i: number) => unknown | void) {
  let index = 0
  while (index < len) {
    cb(index)
    index++
  }
}
