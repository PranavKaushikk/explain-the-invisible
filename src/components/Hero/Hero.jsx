import './Hero.css'

/**
 * Hero is pure presentation: the H1 and the one-line pitch under it.
 * No props, no state — it's a component mainly so App.jsx reads as
 * a table of contents for the page rather than a wall of markup.
 */
function Hero() {
  return (
    <>
      <h1 className="hero__title">
        explain the <span>invisible</span>
      </h1>
      <p className="hero__subtitle">
        Making invisible computer-science processes visible — one traced signal at a time. This is the v0.1
        shell: layout only, nothing wired to a model yet.
      </p>
    </>
  )
}

export default Hero
