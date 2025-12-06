import React from 'react'

const Card = ({ children, title, className = '', style = {} }) => {
  return (
    <div 
      className={className}
      style={{
        background: 'rgba(20, 20, 30, 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        color: 'white',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        pointerEvents: 'auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        ...style
      }}
    >
      {title && (
        <h3 style={{ 
          margin: '0 0 12px 0', 
          fontSize: '14px', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export default Card


