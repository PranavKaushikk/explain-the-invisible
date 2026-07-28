import './VisualizationSection.css'

/**
 * VisualizationSection renders the current animation step.
 *
 * Five modes driven by `status`:
 *   'idle'        — nothing submitted yet
 *   'loading'     — fetch in flight (NEW in v0.4)
 *   'active'      — a visualization is running; renders the current step
 *   'unsupported' — topic submitted but not found on the server
 *   'error'       — network / server error (NEW in v0.4)
 *
 * The step data (label, description, icon, actors) comes entirely from
 * the `steps` prop — this component has no knowledge of any specific
 * topic. `supportedTopicsLabel` is a plain string shown in the
 * unsupported-topic message so the hint stays accurate as the registry
 * grows. `errorMessage` surfaces backend error text in the error state.
 *
 * The visualization engine itself is unchanged: it still renders
 * whatever valid step array it receives, unaware of where the data came
 * from (local JSON or the backend).
 */
function VisualizationSection({
  topic,
  status,
  currentStep,
  steps,
  supportedTopicsLabel,
  errorMessage,
}) {
  const isActive = status === 'active'
  const isLoading = status === 'loading'
  const isUnsupported = status === 'unsupported'
  const isError = status === 'error'

  const step = isActive && steps ? steps[currentStep] : null
  const progress = isActive && steps ? ((currentStep + 1) / steps.length) * 100 : 0

  // Badge label in the top-right corner of the canvas
  function badgeLabel() {
    if (isActive) return 'playing'
    if (isLoading) return 'loading…'
    if (isUnsupported) return 'unsupported'
    if (isError) return 'error'
    return 'idle'
  }

  return (
    <>
      <div className="visualization-section__trace">
        <svg preserveAspectRatio="none" viewBox="0 0 100 26">
          <path className="visualization-section__rail" d="M 50 0 L 50 26" vectorEffect="non-scaling-stroke" />
          <circle
            className={`visualization-section__pulse${isActive || isLoading ? ' visualization-section__pulse--active' : ''}`}
            cx="50"
            cy="0"
            r="2.2"
          />
        </svg>
      </div>

      <div className="visualization-section__canvas-wrap">
        <div className="visualization-section__canvas">
          <span className="visualization-section__badge">animation area</span>
          <span
            className={[
              'visualization-section__badge',
              'visualization-section__badge--right',
              (isActive || isLoading) ? 'visualization-section__badge--live' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {badgeLabel()}
          </span>

          {isActive && step ? (
            <div className="visualization-section__step">
              <div className="visualization-section__step-progress">
                <div
                  className="visualization-section__step-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="visualization-section__step-counter">
                <span className="visualization-section__comment">
                  // step {currentStep + 1} of {steps.length}
                </span>
              </div>

              <div className="visualization-section__step-icon" aria-hidden="true">
                {step.icon}
              </div>

              <h2 className="visualization-section__step-label">{step.label}</h2>

              <p className="visualization-section__step-desc">{step.description}</p>

              <div className="visualization-section__step-actors">
                {step.actors.map((actor) => (
                  <span key={actor} className="visualization-section__actor-chip">
                    {actor}
                  </span>
                ))}
              </div>
            </div>
          ) : isLoading ? (
            <div className="visualization-section__empty">
              <span className="visualization-section__icon-lg" aria-hidden="true">⏳</span>
              <span className="visualization-section__comment">// fetching visualization…</span>
              <p>Loading <b>"{topic}"</b> from the server.</p>
            </div>
          ) : isError ? (
            <div className="visualization-section__empty">
              <span className="visualization-section__icon-lg" aria-hidden="true">⚠️</span>
              <span className="visualization-section__comment">// server error</span>
              <p className="visualization-section__unsupported-msg">
                {errorMessage ?? 'Something went wrong. Please try again.'}
                <br />
                Make sure the backend server is running on port 3000.
              </p>
            </div>
          ) : isUnsupported ? (
            <div className="visualization-section__empty">
              <span className="visualization-section__icon-lg" aria-hidden="true">🚧</span>
              <span className="visualization-section__comment">// topic not yet supported</span>
              <p className="visualization-section__unsupported-msg">
                <b>"{topic}"</b> isn't available in v0.4.
                <br />
                Supported topics: <b>{supportedTopicsLabel}</b>.
                <br />
                Try typing <em>HTTPS handshake</em> or clicking a chip above.
              </p>
            </div>
          ) : (
            <div className="visualization-section__empty">
              <span className="visualization-section__comment">// nothing rendered yet</span>
              <br />
              Type a topic above — try <b>HTTPS handshake</b>, <b>DNS resolution</b>, or <b>Git commit workflow</b> — and click <b>Explain</b> to start the animation.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default VisualizationSection
