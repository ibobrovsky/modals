export default class Registry {
  private ids: string[] = []

  get length() {
    return this.ids.length
  }

  getAll(): string[] {
    return this.ids
  }

  set(id: string): void {
    if (!this.has(id)) {
      this.ids.push(id)
    }
  }

  has(id: string): boolean {
    return this.ids.includes(id)
  }

  unset(id: string): void {
    const index = this.ids.indexOf(id)
    if (index !== -1) {
      this.ids.splice(index, 1)
    }
  }
}
