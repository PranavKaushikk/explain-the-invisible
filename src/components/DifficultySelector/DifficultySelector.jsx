import { DIFFICULTY_LEVELS } from '../../constants/topics.js'
import './DifficultySelector.css'

/**
 * A controlled segmented control. It has no state of its own —
 * `value`/`onChange` are owned by SearchSection — because the
 * selected difficulty is part of the request payload the Explain
 * button submits (FR2 in the PRD), not a private UI detail. Keeping
 * it controlled now means v0.2 can read `difficulty` straight off
 * whatever owns the request without touching this file.
 */
function DifficultySelector({ value, onChange }) {
  return (
    <div className="difficulty" role="radiogroup" aria-label="Explanation difficulty">
      {DIFFICULTY_LEVELS.map((level) => (
        <button
          key={level}
          type="button"
          role="radio"
          aria-checked={value === level}
          className={`difficulty__option${value === level ? ' difficulty__option--active' : ''}`}
          onClick={() => onChange(level)}
        >
          {level}
        </button>
      ))}
    </div>
  )
}

export default DifficultySelector
