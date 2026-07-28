/**
 * geminiService.js
 *
 * The ONLY file in this project that knows about Google's Gemini API.
 * Everything provider-specific — the SDK, the model name, the API key,
 * response-format hints — lives here and nowhere else.
 *
 * Responsibilities:
 *   - Accept a plain prompt string (built by promptBuilder.js, which
 *     knows nothing about Gemini).
 *   - Call the Gemini API and return the raw text response.
 *   - Translate transport/SDK failures into a single clear Error the
 *     controller can catch, without leaking SDK-specific error shapes
 *     upward.
 *
 * This module does NOT parse or validate the JSON it gets back — that
 * is visualizationValidator.js's job. Keeping this service dumb (prompt
 * in, raw text out) is what makes it swappable for a Claude/GPT/Groq
 * service later without touching the controller or the validator.
 */

const { GoogleGenAI } = require('@google/genai')

// Default model — overridable via env var so the model can be upgraded
// without a code change or redeploy.
const DEFAULT_MODEL = 'gemini-3.6-flash'

// The client is created lazily (on first use, not at module load) so
// that a missing API key only breaks requests that actually need
// Gemini, rather than crashing the whole server at startup.
let client = null

function getClient() {
  if (client) return client

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to server/.env (see .env.example).'
    )
  }

  client = new GoogleGenAI({ apiKey })
  return client
}

/**
 * Send a prompt to Gemini and return the raw text of its response.
 *
 * @param {string} prompt — a complete prompt string (see promptBuilder.js)
 * @returns {Promise<string>} the model's raw text output
 * @throws {Error} a clean, user-legible error if the Gemini call fails
 */
async function generateFromPrompt(prompt) {
  const ai = getClient()
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL

  let response
  try {
    response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        // Nudges Gemini to return strict JSON rather than JSON wrapped
        // in prose or markdown fences. The validator still checks the
        // result independently — this is a quality hint, not a guarantee.
        responseMimeType: 'application/json',
      },
    })
  } catch (err) {
    throw new Error(`Gemini request failed: ${err.message}`)
  }

  const text = response?.text
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('Gemini returned an empty response.')
  }

  return text
}

module.exports = { generateFromPrompt }