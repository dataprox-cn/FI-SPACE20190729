import React, { useState, useEffect } from 'react'
import Statistics from './ui/Statistics'
import ObjectDetails from './ui/ObjectDetails'
import FilterLegend from './ui/FilterLegend'
import SearchBar from './ui/SearchBar'
import SystemInfo from './ui/SystemInfo'
import AudioPlayer from './ui/AudioPlayer'
import TimeControls from './ui/TimeControls'

const HUD = ({ 
  selected, 
  onDeselect, 
  asteroidCount, 
  quality, 
  setQuality, 
  onSearch, 
  activeFilters, 
  onToggleFilter,
  speed,
  setSpeed,
  isPaused,
  setIsPaused,
  showOrbits,
  setShowOrbits,
  showLabels,
  setShowLabels
}) => {
  const [fps, setFps] = useState(0)

  // Real FPS counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    const update = () => {
      frameCount++
      const now = performance.now()
      if (now - lastTime >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastTime = now
      }
      requestAnimationFrame(update)
    }
    const id = requestAnimationFrame(update)
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <Statistics count={asteroidCount} fps={fps} />
      
      <SearchBar onSearch={onSearch} />
      
      {/* Show System Info when no object is selected, or Object Details when selected */}
      {!selected && <SystemInfo />}
      <ObjectDetails selected={selected} onClose={onDeselect} />
      
      <FilterLegend 
        activeFilters={activeFilters} 
        onToggleFilter={onToggleFilter} 
        meta={{}} // Pass metadata if available
      />

      <AudioPlayer />
      
      {/* Simulation Time Controls */}
      <TimeControls 
        speed={speed} 
        setSpeed={setSpeed} 
        isPaused={isPaused} 
        setIsPaused={setIsPaused} 
      />
      
      {/* Quick Visual Settings Controls */}
      <div style={{ 
        position: 'absolute', 
        bottom: '80px', 
        left: '20px', 
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* Quality Toggle */}
        <button 
          onClick={() => setQuality(quality === 'high' ? 'low' : 'high')}
          style={{
            background: 'rgba(20, 20, 30, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontSize: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'left',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background 0.2s',
            pointerEvents: 'auto'
          }}
          onMouseOver={e => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={e => e.target.style.background = 'rgba(20, 20, 30, 0.7)'}
        >
          Quality: <strong style={{ color: quality === 'high' ? '#4caf50' : '#ff9800' }}>{quality.toUpperCase()}</strong>
        </button>

        {/* Orbit Lines Toggle */}
        <button 
          onClick={() => setShowOrbits(!showOrbits)}
          style={{
            background: 'rgba(20, 20, 30, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontSize: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'left',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background 0.2s',
            pointerEvents: 'auto'
          }}
          onMouseOver={e => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={e => e.target.style.background = 'rgba(20, 20, 30, 0.7)'}
        >
          Orbit Lines: <strong style={{ color: showOrbits ? '#00e5ff' : '#f44336' }}>{showOrbits ? 'ON' : 'OFF'}</strong>
        </button>

        {/* Floating Labels Toggle */}
        <button 
          onClick={() => setShowLabels(!showLabels)}
          style={{
            background: 'rgba(20, 20, 30, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            fontSize: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'left',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'background 0.2s',
            pointerEvents: 'auto'
          }}
          onMouseOver={e => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={e => e.target.style.background = 'rgba(20, 20, 30, 0.7)'}
        >
          Planet Labels: <strong style={{ color: showLabels ? '#00e5ff' : '#f44336' }}>{showLabels ? 'ON' : 'OFF'}</strong>
        </button>
      </div>
    </>
  )
}

export default HUD
