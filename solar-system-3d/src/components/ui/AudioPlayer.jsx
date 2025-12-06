import React, { useState, useRef, useEffect } from 'react'

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
    <div style={{
      position: 'absolute',
      bottom: '90px',
      left: '20px',
      zIndex: 10,
      background: 'rgba(20, 20, 30, 0.7)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white',
      minWidth: '200px'
    }}>
      <audio 
        ref={audioRef} 
        src="/Galactic_Drift.mp3" 
        loop
        onEnded={() => setIsPlaying(false)}
      />
      
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
          transition: 'all 0.2s'
        }}
        onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.3)'}
        onMouseOut={e => e.target.style.background = isPlaying ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Music
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          style={{
            width: '100%',
            cursor: 'pointer'
          }}
        />
      </div>

      <div style={{ fontSize: '12px', opacity: 0.6, minWidth: '35px' }}>
        {Math.round(volume * 100)}%
      </div>
    </div>
  )
}

export default AudioPlayer

