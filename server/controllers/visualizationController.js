/**
 * visualizationController.js
 *
 * AI-powered controller for:
 * GET /api/visualization/:topic
 *
 * Pipeline:
 *
 * Request
 *    ↓
 * Prompt Builder
 *    ↓
 * Gemini
 *    ↓
 * Validator
 *    ↓
 * Response
 */

const {
  buildVisualizationPrompt,
} = require("../services/promptBuilder");

const {
  generateFromPrompt,
} = require("../services/geminiService");

const {
  validateVisualization,
} = require("../services/visualizationValidator");

/**
 * Normalise incoming topic.
 */
function normalise(raw) {
  return decodeURIComponent(raw)
    .trim()
    .toLowerCase()
    .replace(/-/g, " ");
}

async function getVisualization(req, res) {
  try {
    const topic = normalise(req.params.topic);

    // difficulty comes from:
    // ?difficulty=Beginner
    const difficulty =
      req.query.difficulty || "Beginner";

    //--------------------------------------------------
    // Phase 1
    // Build prompt
    //--------------------------------------------------

    const prompt = buildVisualizationPrompt({
      topic,
      difficulty,
    });

    //--------------------------------------------------
    // Phase 2
    // Gemini
    //--------------------------------------------------

    const rawResponse =
      await generateFromPrompt(prompt);

    //--------------------------------------------------
    // Phase 3
    // Validate
    //--------------------------------------------------

    const result = validateVisualization(
      rawResponse,
      {
        expectedDifficulty: difficulty,
      }
    );

    if (!result.valid) {
      return res.status(502).json({
        error: "AI returned an invalid visualization.",
        details: result.error,
      });
    }

    //--------------------------------------------------
    // Success
    //--------------------------------------------------

    return res.json({
      data: result.data,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      error: err.message,
    });

  }
}

module.exports = {
  getVisualization,
};