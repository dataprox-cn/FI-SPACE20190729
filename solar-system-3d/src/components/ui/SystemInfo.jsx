import React from 'react'
import Card from './Card'

const SystemInfo = () => {
  return (
    <Card 
      title="System Overview"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '240px',
        zIndex: 5 // Lower z-index than ObjectDetails so it's covered when selected
      }}
    >
      <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
        <p style={{ marginTop: 0 }}>
          Welcome to the <strong>Solar System Asteroid Map</strong>. This simulation visualizes the orbital paths of over 18,000 asteroids and comets.
        </p>
        
        <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
          <strong style={{ color: '#ffcc00', display: 'block', marginBottom: '4px' }}>Did you know?</strong>
          Most asteroids orbit between Mars and Jupiter in the "Main Belt", but Near-Earth Objects (NEOs) can cross Earth's orbit.
        </div>
      </div>
    </Card>
  )
}

export default SystemInfo

