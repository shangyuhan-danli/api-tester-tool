import express from 'express'
import cors from 'cors'
import axios from 'axios'
import { createClient } from 'redis'

const app = express()
const PORT = 3001

// Redis client
const redis = createClient()
redis.on('error', err => console.log('Redis Client Error', err))
await redis.connect()

app.use(cors())
app.use(express.json())

// Proxy endpoint - forward requests to target URL
app.post('/api/proxy', async (req, res) => {
  const { method, url, headers, body } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  try {
    const startTime = Date.now()

    const response = await axios({
      method: method || 'GET',
      url,
      headers: headers || {},
      data: body,
      validateStatus: () => true, // Don't throw on any status code
      timeout: 30000,
    })

    const duration = Date.now() - startTime

    // Save to history
    const historyItem = {
      id: Date.now().toString(),
      method: method || 'GET',
      url,
      headers,
      body,
      response: {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
      },
      duration,
      timestamp: new Date().toISOString(),
    }

    await redis.lPush('request_history', JSON.stringify(historyItem))
    await redis.lTrim('request_history', 0, 99) // Keep last 100 requests

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      duration,
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: error.code,
    })
  }
})

// Get request history
app.get('/api/history', async (req, res) => {
  try {
    const history = await redis.lRange('request_history', 0, 49)
    res.json(history.map(item => JSON.parse(item)))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Clear history
app.delete('/api/history', async (req, res) => {
  try {
    await redis.del('request_history')
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Save request template
app.post('/api/templates', async (req, res) => {
  const { name, method, url, headers, body } = req.body

  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' })
  }

  try {
    const template = {
      id: Date.now().toString(),
      name,
      method: method || 'GET',
      url,
      headers,
      body,
      createdAt: new Date().toISOString(),
    }

    await redis.hSet('request_templates', template.id, JSON.stringify(template))
    res.json(template)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all templates
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await redis.hGetAll('request_templates')
    res.json(Object.values(templates).map(t => JSON.parse(t)))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete template
app.delete('/api/templates/:id', async (req, res) => {
  try {
    await redis.hDel('request_templates', req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`API Tester backend running on http://localhost:${PORT}`)
})
