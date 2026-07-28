import './Footer.css'

/**
 * A one-line status strip, not a marketing footer. Real footer
 * content (links, legal, social) doesn't exist in the approved
 * v0.1 design, so this stays honest about what it is rather than
 * being padded out with sections invented for this refactor —
 * see the PRD note on why Features/Footer were scoped down.
 */
function Footer() {
  return (
    <div className="footer">
      <span>
        build <span className="footer__stage">v0.35</span> — 5 visualization datasets, shared JSON schema
      </span>
      <span>next: v0.39 AI-generated JSON replaces local files</span>
    </div>
  )
}

export default Footer
