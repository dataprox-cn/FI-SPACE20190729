import React, { useState, useRef, useEffect } from 'react'
import Card from './Card'

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = new Audio('/Galactic_Drift_v2.mp3')
    audio.loop = true
    audio.volume = volume
    audio.preload = 'auto'
    audioRef.current = audio

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleError = (e) => {
      console.error('Audio element error:', e)
      const err = audio.error
      if (err) {
        setErrorMsg(`Error ${err.code}: ${err.message || 'Unknown audio error'}`)
      } else {
        setErrorMsg('Unknown audio load error')
      }
    }

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('error', handleError)

    // Force load to trigger metadata/error events
    audio.load()

    return () => {
      audio.pause()
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('error', handleError)
      audio.src = ''
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    setErrorMsg('') // Clear old errors on attempt
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true)
        })
        .catch(err => {
          console.error('Audio play promise rejected:', err)
          setErrorMsg(`Play rejected: ${err.message || err}`)
        })
    }
  }

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value))
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card 
      title="Music"
      style={{
        position: 'absolute',
        bottom: '225px',
        left: '20px',
        width: '240px',
        zIndex: 10
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '10px', 
              opacity: 0.6 
            }}>
              <span>Vol: {Math.round(volume * 100)}%</span>
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            fontSize: '10px',
            color: '#ff5252',
            background: 'rgba(255, 82, 82, 0.1)',
            border: '1px solid rgba(255, 82, 82, 0.2)',
            padding: '4px 6px',
            borderRadius: '4px',
            wordBreak: 'break-all'
          }}>
            {errorMsg}
          </div>
        )}
      </div>
    </Card>
  )
}

export default AudioPlayer
