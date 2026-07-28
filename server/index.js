/**
 * Explain the Invisible — Express server entry point.
 *
 * Responsibilities:
 *   - Parse JSON request bodies.
 *   - Allow the React frontend to call this API.
 *   - Mount all API routes under /api.
 *   - Start listening.
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const visualizationRoutes = require('./routes/visualization')

const app = express()
const PORT = process.env.PORT || 3000

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json())

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN
      ? process.env.FRONTEND_ORIGIN.split(',')
      : ['http://localhost:5173'],
    methods: ['GET'],
  })
)

// ── API Routes ────────────────────────────────────────────────────────────────

app.use('/api', visualizationRoutes)

// ── Health Check ──────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Explain the Invisible API is running',
  })
})

// ── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Explain the Invisible server running on http://localhost:${PORT}`)
})