import React, { useState, useEffect } from 'react'
import Card from './Card'

const FACTS = [
  {
    title: "Mercury",
    fact: "Smallest planet, experiences extreme temperature swings from -290°F at night to 800°F during the day.",
    color: "#A5A5A5"
  },
  {
    title: "Venus",
    fact: "Hottest planet due to a thick atmosphere, rotates backward compared to most planets.",
    color: "#E3BB76"
  },
  {
    title: "Earth",
    fact: "Only planet known to support life, has abundant liquid water covering 71% of its surface.",
    color: "#2E81E6"
  },
  {
    title: "Mars",
    fact: "Known as the 'Red Planet' due to iron oxide on its surface. Home to the largest volcano in the solar system.",
    color: "#D14A28"
  },
  {
    title: "Jupiter",
    fact: "Largest planet, its Great Red Spot is a massive storm that has raged for over 300 years.",
    color: "#DBC29E"
  },
  {
    title: "Saturn",
    fact: "Famous for its complex and extensive ring system made of billions of ice and rock particles.",
    color: "#EBD797"
  },
  {
    title: "Uranus",
    fact: "Rotates on its side at 98°, likely from a massive collision billions of years ago.",
    color: "#93B8BE"
  },
  {
    title: "Neptune",
    fact: "Has the strongest winds in the solar system, reaching speeds of 1,200 mph.",
    color: "#3E54E8"
  },
  {
    title: "Asteroid Belt",
    fact: "Most asteroids orbit between Mars and Jupiter in the 'Main Belt', but Near-Earth Objects (NEOs) can cross Earth's orbit.",
    color: "#00ada7"
  },
  {
    title: "The Sun",
    fact: "Center of the solar system, accounts for 99.86% of its mass and provides energy for all life on Earth.",
    color: "#ffcc00"
  },
  {
    title: "Comets",
    fact: "Icy bodies that develop spectacular tails when approaching the Sun. They're considered time capsules from the solar system's formation.",
    color: "#e6dfcf"
  }
]

const SystemInfo = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % FACTS.length)
        setIsAnimating(false)
      }, 300)
    }, 8000) // Change every 8 seconds

    return () => clearInterval(interval)
  }, [])

  const currentFact = FACTS[currentIndex]

  return (
    <Card 
      title="System Overview"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '280px',
        zIndex: 5,
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)' }}>
        <p style={{ marginTop: 0 }}>
          Welcome to the <strong>Solar System Asteroid Map</strong>. This simulation visualizes the orbital paths of over 18,000 asteroids and comets.
        </p>
        
        <div style={{ 
          marginTop: '16px', 
          padding: '14px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '8px',
          border: `1px solid ${currentFact.color}40`,
          minHeight: '100px',
          transition: 'all 0.3s ease',
          opacity: isAnimating ? 0.5 : 1,
          transform: isAnimating ? 'scale(0.98)' : 'scale(1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ 
              color: currentFact.color, 
              display: 'flex',
              alignItems: 'center',
              fontSize: '15px',
              textShadow: `0 0 10px ${currentFact.color}80`
            }}>
              <span style={{ marginRight: '8px', fontSize: '18px' }}>💡</span>
              {currentFact.title}
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.5' }}>
            {currentFact.fact}
          </p>
        </div>

        {/* Progress indicator */}
        <div style={{ 
          display: 'flex', 
          gap: '6px', 
          marginTop: '12px',
          justifyContent: 'center'
        }}>
          {FACTS.map((_, idx) => (
            <div 
              key={idx}
              style={{
                width: idx === currentIndex ? '16px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: idx === currentIndex ? currentFact.color : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                setIsAnimating(true)
                setTimeout(() => {
                  setCurrentIndex(idx)
                  setIsAnimating(false)
                }, 300)
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

export default SystemInfo
