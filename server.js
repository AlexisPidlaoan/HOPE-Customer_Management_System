import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.GEMINI_PORT || 3000
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro'

app.use(express.json())

app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required.' })
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta2/models/${GEMINI_MODEL}:generateText?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: { text: prompt },
          temperature: 0.7,
          maxOutputTokens: 400
        })
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API error' })
    }

    const text = data?.candidates?.[0]?.output || data?.output?.text || ''
    res.json({ text })
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Failed to call Gemini API' })
  }
})

app.listen(PORT, () => {
  console.log(`Gemini proxy server running on http://localhost:${PORT}`)
})
