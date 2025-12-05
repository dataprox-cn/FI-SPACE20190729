import React, { useState } from 'react'
import Card from './Card'
import { ASTEROID_COLORS } from '../../utils/colors'

const FilterLegend = ({ meta, activeFilters, onToggleFilter }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Get common classes to show in legend (could be dynamic based on data)
  const commonClasses = ['MBA', 'APO', 'ATE', 'TNO', 'CEN', 'JFc']
  
  const classNames = {
    'MBA': 'Main Belt',
    'APO': 'Apollo (NEO)',
    'ATE': 'Aten (NEO)',
    'TNO': 'Trans-Neptunian',
    'CEN': 'Centaur',
    'JFc': 'Jupiter Family Comet'
  }

  return (
    <Card 
      title="Legend & Filters"
      style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '220px',
        zIndex: 10,
        maxHeight: isCollapsed ? '50px' : '400px',
        transition: 'max-height 0.3s ease',
        overflow: 'hidden'
      }}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        {isCollapsed ? 'Show' : 'Hide'}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {commonClasses.map(cls => (
          <div 
            key={cls}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              cursor: 'pointer',
              opacity: activeFilters[cls] === false ? 0.5 : 1
            }}
            onClick={() => onToggleFilter(cls)}
          >
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: ASTEROID_COLORS[cls] || ASTEROID_COLORS.default,
              boxShadow: `0 0 5px ${ASTEROID_COLORS[cls]}`
            }} />
            <span style={{ fontSize: '12px' }}>{classNames[cls] || cls}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default FilterLegend

