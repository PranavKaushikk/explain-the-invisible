import { ANIMATION_SPEEDS } from '../../constants/topics.js'
import './TimelineSection.css'

/**
 * TimelineSection is now functional in v0.2.
 *
 * It receives all playback state from App (via props) and fires
 * callbacks — it owns no timer logic itself. That separation keeps
 * the interval ref in one place (App) so clearing it on unmount
 * or mid-play is straightforward.
 *
 * New props vs v0.1:
 *   steps        — HTTPS_STEPS array, used to render step chips
 *   currentStep  — index of the active step
 *   isPlaying    — drives the play/pause icon
 *   onPlay       — toggle play/pause
 *   onRewind     — jump to step 0
 *   onForward    — advance one step
 *   onStepSelect — jump to a specific step index
 */
function TimelineSection({
  status,
  speed,
  onSpeedChange,
  steps,
  currentStep,
  isPlaying,
  onPlay,
  onRewind,
  onForward,
  onStepSelect,
}) {
  const controlsEnabled = status === 'active'
  const totalSteps = steps ? steps.length : 0
  const playheadPct = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0

  // Format as MM:SS where each step is counted as 1 "second"
  function fmt(n) {
    const m = Math.floor(n / 60)
    const s = n % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const timeLabel = controlsEnabled
    ? `${fmt(currentStep)} / ${fmt(totalSteps - 1)}`
    : '00:00 / 00:00'

  return (
    <div className="timeline-section">
      <div className="timeline-section__label">
        <span>timeline</span>
        <span>{timeLabel}</span>
      </div>

      {/* Step chips — clickable in v0.2 */}
      {controlsEnabled && steps && (
        <div className="timeline-section__steps" role="list">
          {steps.map((step, i) => (
            <button
              key={step.id}
              type="button"
              role="listitem"
              className={`timeline-section__step-chip${i === currentStep ? ' timeline-section__step-chip--active' : ''}${i < currentStep ? ' timeline-section__step-chip--done' : ''}`}
              onClick={() => onStepSelect(i)}
              title={step.label}
            >
              <span className="timeline-section__step-chip-num">{i + 1}</span>
              <span className="timeline-section__step-chip-label">{step.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="timeline-section__scrubber">
        <div className="timeline-section__track">
          <div
            className="timeline-section__track-fill"
            style={{ width: `${playheadPct}%` }}
          />
          <div className="timeline-section__ticks">
            {Array.from({ length: 9 }).map((_, i) => (
              <i key={i} />
            ))}
          </div>
          <div
            className="timeline-section__playhead"
            style={{ left: `${playheadPct}%` }}
          />
        </div>
      </div>

      <div className="timeline-section__controls">
        <button
          type="button"
          className="timeline-section__ctrl-btn"
          disabled={!controlsEnabled}
          title="Rewind to start"
          onClick={onRewind}
        >
          «
        </button>
        <button
          type="button"
          className="timeline-section__ctrl-btn timeline-section__ctrl-btn--play"
          disabled={!controlsEnabled}
          title={isPlaying ? 'Pause' : 'Play'}
          onClick={onPlay}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          type="button"
          className="timeline-section__ctrl-btn"
          disabled={!controlsEnabled}
          title="Next step"
          onClick={onForward}
        >
          »
        </button>
      </div>

      <div className="timeline-section__speed-row">
        {ANIMATION_SPEEDS.map((option) => (
          <button
            key={option}
            type="button"
            className={`timeline-section__speed-chip${speed === option ? ' timeline-section__speed-chip--active' : ''}`}
            onClick={() => onSpeedChange(option)}
          >
            {option}×
          </button>
        ))}
      </div>
    </div>
  )
}

export default TimelineSection
