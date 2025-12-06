import React from 'react'
import Card from './Card'
import { ASTEROID_COLORS } from '../../utils/colors'

const ObjectDetails = ({ selected, onClose }) => {
  if (!selected) return null

  // Format numbers nicely
  const formatNum = (num) => new Intl.NumberFormat().format(Math.round(num))

  return (
    <Card 
      title="Object Details"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '300px',
        maxWidth: 'calc(100vw - 40px)',
        zIndex: 10
      }}
    >
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '0 5px'
        }}
      >
        ×
      </button>

      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>{selected.name}</h2>
        <span style={{ 
          fontSize: '12px', 
          color: 'rgba(255,255,255,0.5)',
          fontFamily: 'monospace' 
        }}>
          ID: {selected.id}
        </span>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '16px',
        padding: '8px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: ASTEROID_COLORS[selected.class] || ASTEROID_COLORS.default,
          marginRight: '10px'
        }} />
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>CLASS</div>
          <div style={{ fontWeight: '500' }}>{selected.class}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>DIAMETER</div>
          <div style={{ fontSize: '16px' }}>{formatNum(selected.diameter)} km</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>ORBIT PERIOD</div>
          <div style={{ fontSize: '16px' }}>
            {selected.period ? `${formatNum(selected.period)}d` : 'Unknown'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>DISTANCE</div>
          <div style={{ fontSize: '16px' }}>
            {selected.distance ? `${selected.distance.toFixed(2)} AU` : 'Calculating...'}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <a 
          href={`https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=${selected.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            textDecoration: 'none',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
          onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
        >
          View Full NASA Data →
        </a>
      </div>
    </Card>
  )
}

export default ObjectDetails


