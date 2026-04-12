import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '.env.local'), override: true })

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' })

    const { prompt } = req.body
    if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Missing or invalid prompt' })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const rawText = await response.text()
    let data
    try { data = JSON.parse(rawText) } catch { return res.status(500).json({ error: 'Bad response from Anthropic API' }) }
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Anthropic API error' })
    if (data.stop_reason === 'max_tokens') return res.status(500).json({ error: 'Response too long — try Moderate diversity' })

    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
    res.json({ text })
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
})

app.listen(3001, () => console.log('API server running on http://localhost:3001'))
