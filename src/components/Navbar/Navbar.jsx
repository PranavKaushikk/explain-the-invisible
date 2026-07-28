import './Navbar.css'

/**
 * Navbar renders the product's brand identity above the hero.
 *
 * There's only one screen in v0.1, so there's nothing to navigate
 * to yet — this intentionally has no links or routing. It exists
 * as its own component anyway because it's the one piece of chrome
 * that will stay identical while everything below it is replaced
 * screen-by-screen as the product grows (e.g. once /library or
 * /account exist, Navbar is what makes them feel like one product).
 */
function Navbar() {
  return (
    <div className="navbar">
      <span className="navbar__dot" />
      <span className="navbar__label">AI-Powered System Visualizer</span>
    </div>
  )
}

export default Navbar
