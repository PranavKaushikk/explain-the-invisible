import { useState } from 'react'
import DifficultySelector from '../DifficultySelector/DifficultySelector.jsx'
import PopularTopics from '../PopularTopics/PopularTopics.jsx'
import './SearchSection.css'

/**
 * SearchSection owns everything about the *act* of composing a
 * request: the raw text being typed and the chosen difficulty.
 * Neither is meaningful outside this component until the person
 * presses Explain — so unlike `request` in App, this state stays
 * local and is only "promoted" via `onExplain` on submit.
 *
 * FR1 (concept search) and FR2 (difficulty selection) from the PRD
 * both live here, which is why the two controls are composed in one
 * component instead of two unrelated ones scattered across the page.
 */
function SearchSection({ onExplain }) {
  const [inputValue, setInputValue] = useState('')
  const [difficulty, setDifficulty] = useState('Beginner')
  const [placeholder, setPlaceholder] = useState('search a concept — HTTPS, DNS, the event loop…')

  const hasText = inputValue.trim().length > 0

  function submit() {
    if (!hasText) {
      setPlaceholder('type a concept first…')
      return
    }
    onExplain({ topic: inputValue.trim(), difficulty })
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') submit()
  }

  return (
    <>
      <div className="search-section">
        <span className="search-section__glyph">&gt;</span>

        <div className={`search-section__field${hasText ? ' search-section__field--has-text' : ''}`}>
          <input
            type="text"
            value={inputValue}
            placeholder={placeholder}
            autoComplete="off"
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <span className="search-section__cursor" aria-hidden="true" />
        </div>

        <DifficultySelector value={difficulty} onChange={setDifficulty} />

        <button type="button" className="search-section__explain-btn" onClick={submit}>
          Explain ▸
        </button>
      </div>

      <PopularTopics onSelect={setInputValue} />
    </>
  )
}

export default SearchSection
