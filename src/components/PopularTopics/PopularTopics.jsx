import { POPULAR_TOPICS } from '../../constants/topics.js'
import './PopularTopics.css'

/**
 * A row of shortcut chips. `onSelect` is the only prop — this
 * component doesn't know or care that it's populating a search
 * input; it just reports which label was clicked. That keeps it
 * reusable if a "recently viewed" or "recommended for you" list
 * needs the same chip UI later.
 */
function PopularTopics({ onSelect }) {
  return (
    <div className="popular-topics">
      {POPULAR_TOPICS.map((topic) => (
        <button key={topic} type="button" className="popular-topics__chip" onClick={() => onSelect(topic)}>
          {topic}
        </button>
      ))}
    </div>
  )
}

export default PopularTopics
