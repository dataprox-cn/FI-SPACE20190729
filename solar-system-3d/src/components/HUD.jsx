import React, { useState, useEffect } from 'react'
import Statistics from './ui/Statistics'
import ObjectDetails from './ui/ObjectDetails'
import FilterLegend from './ui/FilterLegend'
import SearchBar from './ui/SearchBar'
import SystemInfo from './ui/SystemInfo'
import AudioPlayer from './ui/AudioPlayer'

const HUD = ({ selected, onDeselect, asteroidCount, quality, setQuality, onSearch, activeFilters, onToggleFilter }) => {
  const [fps, setFps] = useState(0)

  // Mock FPS counter
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
      
      <div style={{ position: 'absolute', bottom: '90px', left: '20px', zIndex: 10 }}>
        <button 
          onClick={() => setQuality(quality === 'high' ? 'low' : 'high')}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          Quality: {quality.toUpperCase()}
        </button>
      </div>
    </>
  )
}

export default HUD
