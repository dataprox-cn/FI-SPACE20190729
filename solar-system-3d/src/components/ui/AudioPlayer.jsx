import React, { useState, useRef, useEffect } from 'react'
import Card from './Card'

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3) // Start at 30% volume
  const audioRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  return (
    <Card 
      title="Music"
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: '220px',
        zIndex: 10
      }}
    >
      <audio 
        ref={audioRef} 
        src="/Galactic_Drift.mp3" 
        loop
        onEnded={() => setIsPlaying(false)}
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={togglePlay}
          style={{
            background: isPlaying ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseOut={e => e.target.style.background = isPlaying ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: 'rgba(255, 255, 255, 0.6)'
            }}
          />
          <div style={{ 
            fontSize: '11px', 
            opacity: 0.6, 
            textAlign: 'center',
            letterSpacing: '0.5px'
          }}>
            Volume: {Math.round(volume * 100)}%
          </div>
        </div>
      </div>
    </Card>
  )
}

export default AudioPlayer








