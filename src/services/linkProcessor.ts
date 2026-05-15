import puppeteer from 'puppeteer'
import OpenAI from 'openai'
import { Link } from '../models/link'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const extractContent = async (url: string): Promise<string> => {
  const browser = await puppeteer.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 })
    const content = await page.evaluate(() => (document as any).body.innerText)
    return (content as string).slice(0, 8000)
  } finally {
    await browser.close()
  }
}

const analyzeContent = async (content: string): Promise<string> => {
  const completion = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are TestQuicker, an academic assistant. Analyze the following assignment or course content and provide a clear summary, key points, and any questions or tasks the student needs to complete.'
      },
      {
        role: 'user',
        content
      }
    ],
    max_tokens: 1024,
  })
  return completion.choices[0].message.content || ''
}

export const processLinks = async () => {
  const pendingLinks = await Link.find({ status: 'pending' })
  console.log(`Processing ${pendingLinks.length} pending links...`)

  for (const link of pendingLinks) {
    try {
      console.log(`Fetching: ${link.url}`)
      const content = await extractContent(link.url as string)
      const answer = await analyzeContent(content)

      await Link.findByIdAndUpdate(link._id, {
        content,
        title: answer.slice(0, 100),
        status: 'fetched'
      })

      console.log(`✅ Done: ${link.url}`)
    } catch (error) {
      console.error(`❌ Failed: ${link.url}`, error)
      await Link.findByIdAndUpdate(link._id, { status: 'error' })
    }
  }

  console.log('All links processed!')
}