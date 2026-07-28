import { useState, useEffect, useRef } from 'react'
import './App.css'

import Navbar from './components/Navbar/Navbar.jsx'
import Hero from './components/Hero/Hero.jsx'
import SearchSection from './components/SearchSection/SearchSection.jsx'
import VisualizationSection from './components/VisualizationSection/VisualizationSection.jsx'
import TimelineSection from './components/TimelineSection/TimelineSection.jsx'
import Footer from './components/Footer/Footer.jsx'

import { fetchVisualization } from './services/api.js'
import { SUPPORTED_TOPICS_LABEL } from './constants/topics.js'

/**
 * App — v0.4 architecture milestone.
 *
 * What changed from v0.35:
 *   • The local VISUALIZATIONS registry import is gone.
 *   • handleExplain is now async: it calls fetchVisualization() and
 *     awaits the backend response before setting state.
 *   • request.status gains two new transient values:
 *       'loading'  — fetch in flight
 *       'error'    — fetch failed (network or 404)
 *     The visualisation engine and timeline already treat anything that
 *     isn't 'active' as an inert/placeholder state, so those components
 *     need no changes.
 *
 * What did NOT change:
 *   • State shape — { topic, difficulty, status } is identical.
 *   • Playback logic — interval, speed, step management untouched.
 *   • Prop contracts — every child component receives the same props.
 *   • The visualization engine — it still receives `steps` from the
 *     resolved visualization object and renders whatever it gets.
 */
function App() {
  const [request, setRequest] = useState({
    topic: null,
    difficulty: 'Beginner',
    status: 'idle', // 'idle' | 'loading' | 'active' | 'unsupported' | 'error'
  })
  const [visualization, setVisualization] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const [speed, setSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const intervalRef = useRef(null)

  const steps = visualization ? visualization.steps : []
  const totalSteps = steps.length

  const BASE_INTERVAL_MS = 2000

  function clearPlayback() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function startPlayback(fromStep, currentSpeed) {
    clearPlayback()
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1
        if (next >= totalSteps) {
          clearPlayback()
          setIsPlaying(false)
          return prev
        }
        return next
      })
    }, BASE_INTERVAL_MS / currentSpeed)
  }

  async function handleExplain({ topic, difficulty }) {
    // Reset playback and put the UI into loading state immediately so
    // the user gets feedback before the network round-trip completes.
    console.log("handleExplain called")
    clearPlayback()
    setIsPlaying(false)
    setCurrentStep(0)
    setVisualization(null)
    setErrorMessage(null)
    setRequest({ topic, difficulty, status: 'loading' })

    try {
      const data = await fetchVisualization(topic, difficulty)

      setVisualization(data)
      setRequest({ topic, difficulty, status: 'active' })
      setIsPlaying(true)
      // totalSteps is still 0 here (derived from the previous visualization
      // state). We start playback with the step count from the fetched data.
      startPlaybackWithSteps(0, speed, data.steps.length)
    } catch (err) {
      setVisualization(null)
      setErrorMessage(err.message)
      // Distinguish between "topic not found" (404 → 'unsupported') and
      // genuine server/network failures ('error').
      const status = err.message.includes('No visualization found')
        ? 'unsupported'
        : 'error'
      setRequest({ topic, difficulty, status })
    }
  }

  /**
   * Like startPlayback but takes an explicit step count because
   * totalSteps (a derived value) hasn't updated yet when called
   * immediately after setVisualization inside handleExplain.
   */
  function startPlaybackWithSteps(fromStep, currentSpeed, stepCount) {
    clearPlayback()
    intervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1
        if (next >= stepCount) {
          clearPlayback()
          setIsPlaying(false)
          return prev
        }
        return next
      })
    }, BASE_INTERVAL_MS / currentSpeed)
  }

  function handlePlay() {
    if (request.status !== 'active') return
    if (isPlaying) {
      clearPlayback()
      setIsPlaying(false)
    } else {
      const startFrom = currentStep >= totalSteps - 1 ? 0 : currentStep
      if (startFrom === 0) setCurrentStep(0)
      setIsPlaying(true)
      startPlayback(startFrom, speed)
    }
  }

  function handleRewind() {
    if (request.status !== 'active') return
    clearPlayback()
    setIsPlaying(false)
    setCurrentStep(0)
  }

  function handleForward() {
    if (request.status !== 'active') return
    clearPlayback()
    setIsPlaying(false)
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1))
  }

  function handleStepSelect(index) {
    if (request.status !== 'active') return
    clearPlayback()
    setIsPlaying(false)
    setCurrentStep(index)
  }

  function handleSpeedChange(newSpeed) {
    setSpeed(newSpeed)
    if (isPlaying) {
      startPlayback(currentStep, newSpeed)
    }
  }

  useEffect(() => {
    return () => clearPlayback()
  }, [])

  return (
    <div className="app">
      <div className="app__wrap">
        <Navbar />
        <Hero />

        <div className="app__terminal">
          <div className="app__titlebar">
            <div className="app__lights">
              <i></i>
              <i></i>
              <i></i>
            </div>
            <div className="app__path">
              session <b>~/explain-the-invisible</b> — v0.4
            </div>
          </div>

          <SearchSection onExplain={handleExplain} />
          <VisualizationSection
            topic={request.topic}
            status={request.status}
            currentStep={currentStep}
            steps={steps}
            supportedTopicsLabel={SUPPORTED_TOPICS_LABEL}
            errorMessage={errorMessage}
          />
          <TimelineSection
            status={request.status}
            speed={speed}
            onSpeedChange={handleSpeedChange}
            steps={steps}
            currentStep={currentStep}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onRewind={handleRewind}
            onForward={handleForward}
            onStepSelect={handleStepSelect}
          />
        </div>

        <Footer />
      </div>
    </div>
  )
}

export default App
