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

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body || {}
    if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required.' })

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'Email service not configured.' })

    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8f7f2;border-radius:12px"><h2 style="font-family:Georgia,serif;font-size:24px;color:#1a1a1a;margin-bottom:24px">New message via LandPal.</h2><table style="width:100%;border-collapse:collapse"><tr><td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.08);font-size:13px;color:rgba(26,26,26,0.5);width:80px;vertical-align:top">Name</td><td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.08);font-size:14px;color:#1a1a1a">${name}</td></tr><tr><td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.08);font-size:13px;color:rgba(26,26,26,0.5);vertical-align:top">Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(0,0,0,0.08);font-size:14px;color:#1a1a1a">${email}</td></tr><tr><td style="padding:12px 0;font-size:13px;color:rgba(26,26,26,0.5);vertical-align:top">Message</td><td style="padding:12px 0;font-size:14px;color:#1a1a1a;line-height:1.7;white-space:pre-wrap">${message}</td></tr></table><p style="margin-top:32px;font-size:11px;color:rgba(26,26,26,0.35)">Sent via LandPal. contact form</p></div>`

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'LandPal. <onboarding@resend.dev>', to: ['hello@landpal.design'], reply_to: email, subject: `New message from ${name} — LandPal.`, html })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return res.status(response.status).json({ error: err.message || 'Failed to send email.' })
    }
    res.json({ ok: true })
  } catch (err) {
    console.error('Contact error:', err)
    res.status(500).json({ error: err.message || 'Failed to send email.' })
  }
})

app.listen(3001, () => console.log('API server running on http://localhost:3001'))
