/**
 * visualizationValidator.js
 *
 * Validates that raw text returned by an LLM (Gemini today, any
 * provider tomorrow) is a usable visualization dataset before it is
 * ever handed to the rendering engine.
 *
 * Scope of validation — intentionally narrow
 * ───────────────────────────────────────────
 * This checks exactly the fields the visualization engine actually
 * reads today:
 *
 *   topic       (string)
 *   difficulty  (string)
 *   template    (string, must be "linear-flow" — the only template
 *                the renderer currently supports)
 *   steps[]     (non-empty array), each with:
 *     id          (string, unique within the array)
 *     label       (string)
 *     description (string)
 *     icon        (string)
 *     actors      (non-empty array of strings)
 *
 * The PRD's forward-looking fields — nodes, connections, annotations,
 * questions — are treated as OPTIONAL passthrough data. If the model
 * includes them, this validator does nothing more than a light type
 * check (must be an array if present) and lets them ride along
 * untouched. If they're absent, nothing is fabricated to satisfy the
 * PRD, because the current renderer never reads them — inventing empty
 * arrays here would just be dead weight in the response.
 *
 * This module is provider-agnostic: it takes raw text (whatever a
 * model returned) and returns a structured result. It doesn't know or
 * care that the text came from Gemini.
 */

const REQUIRED_TOP_LEVEL_STRING_FIELDS = ['topic', 'difficulty', 'template']
const REQUIRED_STEP_STRING_FIELDS = ['id', 'label', 'description', 'icon']
const OPTIONAL_PASSTHROUGH_ARRAY_FIELDS = ['nodes', 'connections', 'annotations', 'questions']
const SUPPORTED_TEMPLATE = 'linear-flow'

/**
 * @typedef {object} ValidationResult
 * @property {boolean} valid
 * @property {object} [data] — the parsed visualization object, present when valid is true
 * @property {string} [error] — a human-readable reason, present when valid is false
 */

/**
 * Parse and validate raw LLM output against the visualization schema
 * the rendering engine actually consumes.
 *
 * @param {string} rawText — raw text response from the LLM
 * @param {object} [options]
 * @param {string} [options.expectedDifficulty] — if provided, the parsed
 *   `difficulty` field must match it (case-insensitive). Catches cases
 *   where the model ignores the requested difficulty level.
 * @returns {ValidationResult}
 */
function validateVisualization(rawText, options = {}) {
  const { expectedDifficulty } = options

  // ── Step 1: must be parseable JSON ──────────────────────────────────────
  // Models occasionally wrap JSON in markdown fences or add stray prose
  // despite instructions not to. Strip a leading/trailing ```json fence
  // defensively before parsing, but do not attempt any deeper "recovery"
  // of malformed JSON — that would risk silently accepting garbage.
  const stripped = String(rawText ?? '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()

  let parsed
  try {
    parsed = JSON.parse(stripped)
  } catch (err) {
    return { valid: false, error: `Response was not valid JSON: ${err.message}` }
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, error: 'Response JSON must be a single object, not an array or primitive.' }
  }

  // ── Step 2: required top-level string fields ────────────────────────────
  for (const field of REQUIRED_TOP_LEVEL_STRING_FIELDS) {
    if (typeof parsed[field] !== 'string' || parsed[field].trim().length === 0) {
      return { valid: false, error: `Missing or invalid required field: "${field}".` }
    }
  }

  if (parsed.template !== SUPPORTED_TEMPLATE) {
    return {
      valid: false,
      error: `Unsupported template "${parsed.template}". Only "${SUPPORTED_TEMPLATE}" is supported by the renderer.`,
    }
  }

  if (
    expectedDifficulty &&
    parsed.difficulty.trim().toLowerCase() !== String(expectedDifficulty).trim().toLowerCase()
  ) {
    return {
      valid: false,
      error: `Response difficulty "${parsed.difficulty}" does not match requested difficulty "${expectedDifficulty}".`,
    }
  }

  // ── Step 3: steps[] ──────────────────────────────────────────────────────
  if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    return { valid: false, error: 'Missing or empty required field: "steps" (must be a non-empty array).' }
  }

  const seenIds = new Set()

  for (let i = 0; i < parsed.steps.length; i += 1) {
    const step = parsed.steps[i]

    if (step === null || typeof step !== 'object' || Array.isArray(step)) {
      return { valid: false, error: `Step at index ${i} must be an object.` }
    }

    for (const field of REQUIRED_STEP_STRING_FIELDS) {
      if (typeof step[field] !== 'string' || step[field].trim().length === 0) {
        return { valid: false, error: `Step at index ${i} is missing or has an invalid "${field}".` }
      }
    }

    if (
      !Array.isArray(step.actors) ||
      step.actors.length === 0 ||
      !step.actors.every((actor) => typeof actor === 'string' && actor.trim().length > 0)
    ) {
      return { valid: false, error: `Step at index ${i} must have a non-empty array of string "actors".` }
    }

    if (seenIds.has(step.id)) {
      return { valid: false, error: `Duplicate step id "${step.id}" at index ${i}.` }
    }
    seenIds.add(step.id)
  }

  // ── Step 4: optional PRD passthrough fields — light check only ─────────
  // These are never required and never fabricated. If present, they must
  // at least be arrays so a malformed value can't reach the frontend, but
  // their internal shape is intentionally not enforced here since the
  // renderer does not consume them today.
  for (const field of OPTIONAL_PASSTHROUGH_ARRAY_FIELDS) {
    if (field in parsed && !Array.isArray(parsed[field])) {
      return { valid: false, error: `Optional field "${field}" was present but is not an array.` }
    }
  }

  return { valid: true, data: parsed }
}

module.exports = { validateVisualization, SUPPORTED_TEMPLATE }