/**
 * api.js — thin fetch wrapper for the Explain the Invisible backend.
 *
 * Works both:
 * - locally (Vite proxy)
 * - on Elastic Beanstalk
 */

// Use the same domain the website is served from.
const BASE_URL = ''

/**
 * Fetch a visualization dataset from the backend.
 *
 * @param {string} topic
 * @param {string} difficulty
 * @returns {Promise<object>}
 */
export async function fetchVisualization(topic, difficulty = 'Beginner') {
  const slug = encodeURIComponent(topic.trim().toLowerCase())

  const url =
    `${BASE_URL}/api/visualization/${slug}` +
    `?difficulty=${encodeURIComponent(difficulty)}`

  let response

  try {
    response = await fetch(url)
  } catch {
    throw new Error(
      'Could not reach the server.'
    )
  }

  if (response.status === 404) {
    throw new Error(`No visualization found for "${topic}".`)
  }

  if (!response.ok) {
    let message = `Server error (${response.status}). Please try again.`

    try {
      const body = await response.json()

      if (body.error) {
        message = body.error
      }
    } catch {
      // Ignore invalid JSON.
    }

    throw new Error(message)
  }

  const body = await response.json()

  return body.data
}