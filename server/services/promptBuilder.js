/**
 * promptBuilder.js
 *
 * Builds the natural-language prompt sent to an LLM to generate a
 * visualization dataset. This module is the provider-agnostic half of
 * the v1.0 AI integration: it knows the shape of a good prompt and the
 * shape of the visualization schema, and NOTHING about which LLM
 * provider will eventually consume it.
 *
 * Design notes
 * ────────────
 * • Output is a single plain string. No provider SDK types, no message
 *   arrays, no request options — those belong in the provider-specific
 *   service (e.g. geminiService.js). Swapping providers later means
 *   writing a new service that calls buildVisualizationPrompt() and
 *   passes the resulting string along; this file never changes.
 *
 * • The schema described here is the schema the visualization ENGINE
 *   actually consumes today — topic, difficulty, template, steps[]
 *   (id, label, description, icon, actors) — not the full aspirational
 *   PRD schema. The four forward-looking PRD fields (nodes,
 *   connections, annotations, questions) are mentioned as optional so
 *   the model isn't forbidden from including them for future
 *   compatibility, but they are never required or fabricated here.
 *
 * • `template` is pinned to "linear-flow" in the instructions, because
 *   that is the only template the rendering engine currently supports
 *   (see PROJECT_MEMORY.md → "Supported Visualization Templates").
 *   Letting the model invent a new template name would silently break
 *   rendering downstream.
 */

// ── Difficulty configuration ─────────────────────────────────────────────────
//
// Canonical difficulty levels, matching src/constants/topics.js
// (DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']) on the
// frontend. Each level maps to concrete prompt guidance rather than
// just passing the word through and hoping the model interprets it
// consistently every time.

const DIFFICULTY_PROFILES = {
  Beginner: {
    stepCount: '4 to 6',
    guidance:
      'Use simple, everyday language. Avoid jargon; when a technical ' +
      'term is unavoidable, explain it briefly in plain words inside the ' +
      'description. Favor short, concrete sentences over abstractions. ' +
      'Assume the reader has never studied computer science.',
  },
  Intermediate: {
    stepCount: '5 to 8',
    guidance:
      'Assume the reader is comfortable with basic computing concepts ' +
      '(what a server is, what a request is) but is learning this ' +
      'specific process for the first time. Use standard technical ' +
      'terminology, but still explain the "why", not just the "what".',
  },
  Advanced: {
    stepCount: '7 to 10',
    guidance:
      'Assume the reader has a CS or engineering background. Use ' +
      'precise technical terminology, mention edge cases, timing, or ' +
      'protocol-level detail where relevant, and prefer depth over ' +
      'simplification. Descriptions may reference specific mechanisms ' +
      '(e.g. algorithms, headers, flags) by name.',
  },
}

const DEFAULT_DIFFICULTY = 'Beginner'

/**
 * Normalise a raw difficulty string to one of the canonical levels.
 * Falls back to the same default the frontend uses when the value is
 * missing or unrecognised, so prompt generation never throws on bad
 * input — it degrades to a sane default instead.
 */
function normaliseDifficulty(rawDifficulty) {
  const match = Object.keys(DIFFICULTY_PROFILES).find(
    (level) => level.toLowerCase() === String(rawDifficulty ?? '').trim().toLowerCase()
  )
  return match ?? DEFAULT_DIFFICULTY
}

// ── Prompt Builder ────────────────────────────────────────────────────────────

/**
 * Build a production-quality, provider-agnostic prompt that instructs
 * an LLM to generate a single visualization dataset as JSON.
 *
 * @param {object} params
 * @param {string} params.topic — the CS concept to explain (e.g. "DNS Resolution")
 * @param {string} [params.difficulty] — 'Beginner' | 'Intermediate' | 'Advanced'
 * @returns {string} a complete prompt ready to send to any text-generation LLM
 */
function buildVisualizationPrompt({ topic, difficulty }) {
  const cleanTopic = String(topic ?? '').trim()
  const level = normaliseDifficulty(difficulty)
  const profile = DIFFICULTY_PROFILES[level]

  return `You are generating structured data for an educational visualization tool called "Explain the Invisible". The tool turns computer science concepts into step-by-step animated explanations. You never generate visuals, HTML, CSS, SVG, or code — only the structured JSON data described below. A separate, deterministic rendering engine turns your JSON into the actual animation.

## Task

Explain the following concept as a sequence of discrete steps a learner can click through one at a time:

Topic: "${cleanTopic}"
Difficulty level: ${level}

${profile.guidance}

Generate approximately ${profile.stepCount} steps. Each step should represent one meaningful, self-contained moment in the process — not a paragraph of explanation crammed into one step, and not so granular that steps feel redundant.

## Output format — read carefully

Respond with ONLY a single JSON object. No prose before or after it, no markdown code fences, no commentary — the response body must be valid JSON and nothing else, because it will be parsed directly.

The JSON object must have exactly this shape:

{
  "topic": string,          // echo the topic back, using standard capitalization
  "difficulty": string,     // must be exactly "${level}"
  "template": "linear-flow", // always this exact value — it is the only template the renderer currently supports
  "steps": [
    {
      "id": string,          // short, unique, kebab-case identifier (e.g. "dns-lookup")
      "label": string,       // short title for the step (a few words)
      "description": string, // 1-3 sentences explaining what happens in this step and why it matters
      "icon": string,        // a single emoji that visually represents the step
      "actors": [string]     // the entities involved in this step (e.g. "Browser", "Server", "DNS Resolver"), at least one
    }
  ]
}

Rules:
- "steps" must be a non-empty array in the correct chronological order.
- Every step needs all five fields: id, label, description, icon, actors.
- "id" values must be unique within the array.
- "actors" must be a non-empty array of short strings, not a single string.
- Do not include any field other than the ones described above unless it adds genuine, self-contained value as an optional extension — never invent required-looking fields that break this shape.
- Do not wrap the JSON in markdown fences (no \`\`\`json).
- Do not include trailing commas or comments — the output must be strict, parseable JSON.`
}

module.exports = { buildVisualizationPrompt, DIFFICULTY_PROFILES, normaliseDifficulty }