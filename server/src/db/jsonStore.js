import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Tiny document store backed by a single JSON file.
 * Chosen so the project runs with zero external services ("local first").
 * The same interface is implemented by MongoStore, so switching is a config change.
 */
export class JsonStore {
  constructor(file) {
    this.file = file
    this.state = {}
    this.lock = Promise.resolve()
  }

  async init() {
    await fs.mkdir(path.dirname(this.file), { recursive: true })
    try {
      const raw = await fs.readFile(this.file, 'utf8')
      this.state = raw.trim() ? JSON.parse(raw) : {}
    } catch {
      this.state = {}
      await this.persist()
    }
  }

  rows(name) {
    if (!Array.isArray(this.state[name])) this.state[name] = []
    return this.state[name]
  }

  async persist() {
    const tmp = `${this.file}.${process.pid}.tmp`
    await fs.writeFile(tmp, JSON.stringify(this.state, null, 2), 'utf8')
    await fs.rename(tmp, this.file)
  }

  mutate(fn) {
    const run = async () => {
      const result = await fn()
      await this.persist()
      return result
    }
    const next = this.lock.then(run, run)
    this.lock = next.catch(() => {})
    return next
  }

  async list(name, filter = {}) {
    return this.rows(name).filter((doc) => matches(doc, filter)).map(clone)
  }

  async get(name, id) {
    const doc = this.rows(name).find((row) => row.id === id)
    return doc ? clone(doc) : null
  }

  async findOne(name, filter = {}) {
    const doc = this.rows(name).find((row) => matches(row, filter))
    return doc ? clone(doc) : null
  }

  async insert(name, doc) {
    return this.mutate(async () => {
      this.rows(name).push(clone(doc))
      return clone(doc)
    })
  }

  async update(name, id, patch) {
    return this.mutate(async () => {
      const rows = this.rows(name)
      const index = rows.findIndex((row) => row.id === id)
      if (index === -1) return null
      rows[index] = { ...rows[index], ...clone(patch) }
      return clone(rows[index])
    })
  }

  async remove(name, id) {
    return this.mutate(async () => {
      const rows = this.rows(name)
      const index = rows.findIndex((row) => row.id === id)
      if (index === -1) return false
      rows.splice(index, 1)
      return true
    })
  }

  async count(name, filter = {}) {
    return this.rows(name).filter((doc) => matches(doc, filter)).length
  }

  async replaceCollections(next) {
    return this.mutate(async () => {
      this.state = clone(next)
    })
  }

  async resetCollections(names) {
    return this.mutate(async () => {
      for (const name of names) this.state[name] = []
    })
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function matches(doc, filter) {
  return Object.entries(filter).every(([key, expected]) => {
    if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
      if ('$in' in expected) return expected.$in.includes(doc[key])
      if ('$ne' in expected) return doc[key] !== expected.$ne
      if ('$exists' in expected) return (doc[key] !== undefined) === expected.$exists
    }
    return doc[key] === expected
  })
}
