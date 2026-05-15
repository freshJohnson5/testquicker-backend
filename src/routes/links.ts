import { Router, Request, Response } from 'express'
import { Link } from '../models/link'
import jwt from 'jsonwebtoken'

const router = Router()

const getUserIdFromToken = (req: Request): string | null => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return null
    const token = authHeader.split(' ')[1]
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.id
  } catch {
    return null
  }
}

// Save a batch of links for a user
router.post('/', async (req: Request, res: Response) => {
  try {
    const { urls } = req.body
    const userId = getUserIdFromToken(req)

    if (!userId) {
      return res.status(401).json({ status: 401, message: 'Unauthorized' })
    }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ status: 400, message: 'No links provided' })
    }

    const links = await Link.insertMany(
      urls.map((url: string) => ({ userId, url, status: 'pending' }))
    )

    res.json({ status: 200, data: { links } })
  } catch (error) {
    console.error('Link save error:', error)
    res.status(500).json({ status: 500, message: 'Failed to save links' })
  }
})

// Get all links for a user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req)
    if (!userId) {
      return res.status(401).json({ status: 401, message: 'Unauthorized' })
    }
    const links = await Link.find({ userId }).sort({ createdAt: -1 })
    res.json({ status: 200, data: { links } })
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Failed to fetch links' })
  }
})
// Trigger link processing
router.post('/process', async (req: Request, res: Response) => {
  try {
    const { processLinks } = await import('../services/linkProcessor')
    processLinks() // run in background, don't await
    res.json({ status: 200, message: 'Processing started' })
  } catch (error) {
    console.error('Process error:', error)
    res.status(500).json({ status: 500, message: 'Failed to start processing' })
  }
})
export default router