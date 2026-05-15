import { Router, Request, Response } from 'express'
import OpenAI from 'openai'

const router = Router()

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are TestQuicker, a helpful academic assistant for college students. Explain concepts clearly, help students understand their assignments, and provide thorough answers.'
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1024,
    })

    res.json({
      status: 200,
      data: {
        answer: completion.choices[0].message.content
      }
    })
} catch (error) {
    console.error('DeepSeek error:', error)
    res.status(500).json({ status: 500, message: 'AI service error' })
  }
})

export default router