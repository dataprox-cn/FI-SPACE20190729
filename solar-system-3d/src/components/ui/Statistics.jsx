import React from 'react'
import Card from './Card'

const Statistics = ({ count, fps }) => {
  return (
    <Card 
      title="Mission Status"
      style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '200px',
        zIndex: 10
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>OBJECTS TRACKED</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ada7' }}>
            {new Intl.NumberFormat().format(count)}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>SIMULATION DATE</div>
          <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
            {new Date().toISOString().split('T')[0]}
          </div>
        </div>

        {fps && (
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>PERFORMANCE</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: fps > 50 ? '#4caf50' : '#ff9800' 
              }} />
              <span>{fps} FPS</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default Statistics

