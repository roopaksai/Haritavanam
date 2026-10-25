import { MongoClient } from 'mongodb'

/**
 * MongoDB implementation of the store interface.
 * Activate by setting MONGODB_URI in server/.env — nothing else changes.
 */
export class MongoStore {
  constructor(uri, dbName) {
    this.uri = uri
    this.dbName = dbName
    this.client = null
    this.db = null
  }

  async init() {
    this.client = new MongoClient(this.uri, { serverSelectionTimeoutMS: 8000 })
    await this.client.connect()
    this.db = this.client.db(this.dbName)
    await this.db.collection('users').createIndex({ email: 1 }, { unique: true })
    await this.db.collection('plants').createIndex({ ownerId: 1 })
    await this.db.collection('plants').createIndex({ qrToken: 1 }, { unique: true, sparse: true })
    await this.db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  }

  col(name) {
    return this.db.collection(name)
  }

  sanitize(doc) {
    if (!doc) return null
    const { _id, ...rest } = doc
    return rest
  }

  toMongoFilter(filter = {}) {
    return filter
  }

  async list(name, filter = {}) {
    const docs = await this.col(name).find(this.toMongoFilter(filter)).toArray()
    return docs.map((doc) => this.sanitize(doc))
  }

  async get(name, id) {
    return this.sanitize(await this.col(name).findOne({ id }))
  }

  async findOne(name, filter = {}) {
    return this.sanitize(await this.col(name).findOne(this.toMongoFilter(filter)))
  }

  async insert(name, doc) {
    const { id, ...rest } = doc
    await this.col(name).insertOne({ _id: id, id, ...rest })
    return doc
  }

  async update(name, id, patch) {
    const result = await this.col(name).findOneAndUpdate(
      { id },
      { $set: patch },
      { returnDocument: 'after' },
    )
    return this.sanitize(result)
  }

  async remove(name, id) {
    const result = await this.col(name).deleteOne({ id })
    return result.deletedCount > 0
  }

  async count(name, filter = {}) {
    return this.col(name).countDocuments(this.toMongoFilter(filter))
  }

  async replaceCollections(next) {
    for (const [name, rows] of Object.entries(next)) {
      await this.col(name).deleteMany({})
      if (rows.length) {
        await this.col(name).insertMany(rows.map(({ id, ...rest }) => ({ _id: id, id, ...rest })))
      }
    }
  }

  async resetCollections(names) {
    for (const name of names) await this.col(name).deleteMany({})
  }
}
