/**
 * Visualization registry — v0.3.
 *
 * Keys are lowercase, trimmed topic strings that match what the user
 * types (same normalisation as App.jsx: `topic.trim().toLowerCase()`).
 * Values are the full visualization objects consumed by the engine.
 *
 * Adding a new topic in v0.4+ means:
 *   1. Create src/constants/visualizations/<topic-slug>.js
 *   2. Import it here and add one entry to VISUALIZATIONS.
 *   Nothing else changes.
 */
import httpsHandshake from './https-handshake.js'

const VISUALIZATIONS = {
  'https handshake': httpsHandshake,
}

export default VISUALIZATIONS
