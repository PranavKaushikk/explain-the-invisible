// Static placeholder data for v0.1.
//
// In later versions this list will most likely be fetched from the
// backend (or derived from whatever concepts the AI has templates
// for). Keeping it in one exported constant now means that when
// that happens, only this file changes — no component needs to be
// rewritten, since components already just consume `POPULAR_TOPICS`
// as a prop/import rather than hardcoding strings inline.

export const POPULAR_TOPICS = [
  'HTTPS handshake',
  'DNS resolution',
  'HTTP request lifecycle',
  'Git commit workflow',
  'Docker container startup',
]

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export const ANIMATION_SPEEDS = [0.5, 1, 2, 4]

// v0.35: updated to reflect all five supported visualizations.
// When the registry grows, update this string to match.
export const SUPPORTED_TOPICS_LABEL =
  'HTTPS Handshake, DNS Resolution, HTTP Request Lifecycle, Git Commit Workflow, and Docker Container Startup'
