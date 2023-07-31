import mitt from 'mitt'

export class Progress {
  #totalTasksCount: number
  #progress = 0
  #emitter = mitt<{
    progress: number
  }> ()

  constructor(count?: number) {
    this.#totalTasksCount = count ?? 0
  }

  #calcProgress() {
    return Math.round(this.#progress / this.#totalTasksCount).toFixed(2)
  }

  onProgress(callback: (progress: number) => void) {
    this.#emitter.on('progress', callback)
  }

  increment() {
    this.#progress++
    this.#emitter.emit('progress', Number(this.#calcProgress()))
  }

  addProgress(count: number) {
    this.#progress += count
  }
}
