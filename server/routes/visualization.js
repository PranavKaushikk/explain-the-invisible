/**
 * Visualization routes.
 *
 * Exposes a single endpoint:
 *
 *   GET /api/visualization/:topic
 *
 * The `:topic` segment is a URL-encoded slug (e.g. "https%20handshake" or
 * "dns-resolution"). The controller handles normalisation so callers can
 * use either spaces or hyphens as separators.
 *
 * No auth. No body params. One route — keeps the router file as thin
 * as possible and lets the controller own all logic.
 */

const { Router } = require('express')
const { getVisualization } = require('../controllers/visualizationController')

const router = Router()

router.get('/visualization/:topic', getVisualization)

module.exports = router
