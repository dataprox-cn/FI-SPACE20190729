import React, { useState } from 'react'
import Card from './Card'

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
      width: '300px'
    }}>
      <Card style={{ padding: '8px 16px', borderRadius: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '8px', opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search asteroids..."
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              width: '100%',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </form>
      </Card>
    </div>
  )
}

export default SearchBar


