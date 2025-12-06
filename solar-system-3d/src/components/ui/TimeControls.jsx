import React, { useState } from 'react'
import Card from './Card'

const TimeControls = ({ speed, setSpeed, isPaused, setIsPaused }) => {
  return (
    <Card 
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: 'auto',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      <button
        onClick={() => setIsPaused(!isPaused)}
        style={{
          background: isPaused ? '#4caf50' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px'
        }}
      >
        {isPaused ? '▶' : '⏸'}
      </button>

      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 10, 50, 100].map(val => (
          <button
            key={val}
            onClick={() => setSpeed(val)}
            style={{
              background: speed === val ? 'rgba(255,255,255,0.3)' : 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              color: 'white',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {val}x
          </button>
        ))}
      </div>
    </Card>
  )
}

export default TimeControls


