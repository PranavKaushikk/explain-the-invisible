# Project Memory — Explain the Invisible
**PRD v2.0 | Product v0.4 | Updated July 28, 2026**

---

## Product Vision

Turn invisible computer science concepts into interactive, animated visualizations powered by AI. Instead of reading "Browser sends a request," users *see* it travel. The platform replaces the flat Question → Answer pattern with a pipeline: **Question → AI Understanding → Structured JSON → Visualization Engine → Step-by-Step Exploration**.

The AI never touches rendering. It produces meaning and structure; a separate, deterministic visualization engine handles layout, animation, and interaction. This separation is the core architectural constraint of the entire product.

---

## Mission & Goals

Help students understand technology by converting abstract CS concepts into interactive experiences.

Four non-negotiable product goals:
1. Make the invisible legible — every in-scope concept must be *explorable*, not just describable.
2. Never let the AI touch rendering — visual correctness comes from a deterministic engine.
3. Ship incrementally without rework — each version adds one capability without discarding prior code.
4. Stay provider-agnostic — Claude, GPT, Gemini, or any future LLM must be swappable behind the same JSON contract.

---

## Technology Stack

Frontend
- React
- Vite
- JavaScript

Backend
- Node.js
- Express

Deployment
- Vercel / Netlify (Frontend)
- Backend deployment to be added in a later milestone.

AI
- Provider-agnostic (Claude, Gemini, GPT, Groq, OpenRouter, etc.)

---

## Current Version — v0.4

Frontend:
- React + Vite SPA.
- Generic JSON-driven visualization engine.
- Interactive playback controls and timeline.
- Fetches visualization data from the backend through a dedicated API service.
- Visualization engine remains completely data-source agnostic.

Backend:
- Express backend running on port 3000.
- REST API serving visualization requests.
- Frontend and backend fully connected.
- Visualization JSON served through API endpoints.
- API contract established:
  ```json
  {
    "data": { ...visualization }
  }
  ```
- AI integration not yet implemented (next milestone).

---

## Folder Structure

```text
src/
  components/
    Navbar/
    Hero/
    SearchSection/
    DifficultySelector/
    PopularTopics/
    VisualizationSection/
    TimelineSection/
    Footer/

  constants/
    topics.js

  services/
    api.js               # Frontend API client

  App.jsx
  App.css
  index.css
  main.jsx

server/
  controllers/
  routes/
  data/                  # Temporary visualization datasets
  app.js
```

Each component is colocated with its own CSS file. No global stylesheet beyond `index.css` (tokens + reset).

Two pieces of fixed chrome (terminal titlebar, signal-trace connector) are plain markup — **not** their own components — because they have no state and no second call site.

---

## Coding Conventions

- **One component, one responsibility.** A component that fetches data and renders is two components in a trenchcoat.
- **Props in, callbacks out.** Children never reach into parent state; they call a handler passed down as a prop.
- **No dead abstractions.** No hook, context, or config layer is added before the need exists.
- **Visualization rendering never depends on where the data came from.**
- **Static metadata lives in `constants/`.**
- **API communication is isolated inside `src/services/api.js`.**
- **CSS:** Plain CSS with BEM-style, component-prefixed class names (e.g. `.search-section__field`). No CSS Modules, no CSS-in-JS.
- **State:** `useState` only. App.jsx lifts `{ topic, difficulty, status }`, animation speed, playback state, current visualization step, and selected visualization. No Context, Redux, or Zustand until the tree grows deeper.
- **Rendering components must remain concept-agnostic.** They render whatever valid visualization JSON they receive.
- **Linting:** ESLint flat config with `react-hooks` and `react-refresh` rules enforced in CI before merge.
- **Build tooling:** Vite only (esbuild + Rollup). No custom Webpack config.
- **User-facing version labels, build status, roadmap text and footer information must always match the current implemented milestone.**

**Accessibility baseline:** Difficulty selector is a real `radiogroup` with `aria-checked`. Motion respects `prefers-reduced-motion`. Color is never the only signal (disabled controls are visually flattened, not just recolored).

---

## AI Output Contract (JSON Schema)

The AI returns structured JSON — **not** HTML, CSS, JS, or SVG:

```json
{
  "topic": "DNS",
  "difficulty": "Beginner",
  "template": "linear-flow",
  "nodes": [],
  "connections": [],
  "steps": [],
  "annotations": [],
  "questions": []
}
```

This schema is a **versioned contract**. Changes require updating the PRD, not just the code.

**Current implementation (v0.4):** the frontend receives visualization JSON from the Express backend via REST APIs. The backend currently serves temporary JSON files. The next milestone replaces these files with AI-generated JSON while preserving the same response contract.

---

## Supported Visualization Templates

### Current template

- `linear-flow`

### Current datasets

- HTTPS Handshake
- DNS Resolution
- HTTP Request Lifecycle
- Git Commit Workflow
- Docker Container Startup

All datasets must follow the same visualization schema so they can be rendered by the same engine without modification.

---

## Roadmap

| Version | Scope |
|---------|-------|
| **v0.1** | React + Vite frontend shell. All UI present and styled. |
| **v0.2** | Hardcoded HTTPS Handshake visualization engine with timeline, playback controls and speed control. |
| **v0.3** | Generic visualization engine renders from a JSON schema instead of hardcoded arrays. |
| **v0.35** | Multiple visualization datasets share the same JSON schema. A visualization registry selects the correct dataset while the renderer remains unchanged. |
| **v0.4 (Current)** | Frontend communicates with an Express backend through REST APIs. Visualization JSON is fetched from the backend instead of local frontend files. The rendering engine remains unchanged. |
| **v1.0** | Replace temporary backend JSON files with AI-generated visualization JSON using a provider-agnostic Prompt Builder and LLM service while preserving the existing API contract. |

---

## Key Risks to Track

| Risk | Mitigation |
|------|------------|
| AI output diverges from JSON schema | Validate every response before it reaches the engine; reject and retry. |
| One-off rendering code per concept | Constrain engine to reusable templates (`linear-flow`, `handshake`, etc.). |
| Frontend/backend JSON contract drift | Schema changes must update this document — not just the code. |
| AI provider lock-in | Keep Prompt Builder and provider implementation separated behind a common service interface. |
| Visualization engine becomes coupled to AI | Engine must only consume validated JSON and remain completely deterministic. |

---

## Success Metrics

- **Comprehension:** Users correctly describe a visualized process's step order after one session (measured via quiz export).
- **Engagement:** Median session includes at least one pause/replay/speed-change interaction.
- **Coverage:** Number of concepts with a working visualization template, tracked per release.
- **Adoption:** Returning usage from the same account across multiple topic searches.