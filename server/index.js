/**
 * Explain the Invisible — Express server entry point.
 *
 * Responsibilities:
 *   - Parse JSON request bodies.
 *   - Allow the React dev server (Vite, port 5173) to call this API.
 *   - Mount all API routes under /api.
 *   - Serve the React production build.
 *   - Start listening.
 */

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const path = require('path')
const visualizationRoutes = require('./routes/visualization')

const app = express()
const PORT = process.env.PORT || 3000

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json())

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    methods: ['GET'],
  })
)

// ── API Routes ────────────────────────────────────────────────────────────────

app.use('/api', visualizationRoutes)

// ── Serve React Production Build ──────────────────────────────────────────────

// Serve all static files from the React build folder
app.use(express.static(path.join(__dirname, 'dist')))

// For every non-API route, send React's index.html
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next()
  }

  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// ── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Explain the Invisible server running on http://localhost:${PORT}`)
})