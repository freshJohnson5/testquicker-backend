import { Schema, model } from 'mongoose'

const linkSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'fetched', 'error'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})

export const Link = model('Link', linkSchema)