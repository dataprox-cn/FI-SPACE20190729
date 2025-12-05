import React, { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PLANET_DATA = [
  { 
    name: 'Mercury', 
    distance: 0.39, 
    period: 88, 
    diameter: 4879, 
    color: '#A5A5A5', // Grey/Silver
    horizons: 199,
    fact: "Smallest planet, experiences extreme temperature swings." 
  },
  { 
    name: 'Venus', 
    distance: 0.72, 
    period: 225, 
    diameter: 12104, 
    color: '#E3BB76', // Pale Yellow/Beige
    horizons: 299,
    fact: "Hottest planet due to a thick atmosphere, rotates backward." 
  },
  { 
    name: 'Earth', 
    distance: 1.0, 
    period: 365, 
    diameter: 12742, 
    color: '#2E81E6', // Vibrant Earth Blue
    horizons: 399,
    fact: "Only planet known to support life, has abundant liquid water." 
  },
  { 
    name: 'Mars', 
    distance: 1.52, 
    period: 687, 
    diameter: 6779, 
    color: '#D14A28', // Rust Red
    horizons: 499,
    fact: "Known as the 'Red Planet' due to iron oxide on its surface." 
  },
  { 
    name: 'Jupiter', 
    distance: 5.2, 
    period: 4331, 
    diameter: 139822, 
    color: '#DBC29E', // Beige/Brown
    horizons: 599,
    fact: "Largest planet, its Great Red Spot is a massive storm." 
  },
  { 
    name: 'Saturn', 
    distance: 9.5, 
    period: 10747, 
    diameter: 116464, 
    color: '#EBD797', // Pale Gold
    horizons: 699,
    fact: "Famous for its complex and extensive ring system." 
  },
  { 
    name: 'Uranus', 
    distance: 19.2, 
    period: 30589, 
    diameter: 50724, 
    color: '#93B8BE', // Pale Cyan
    horizons: 799,
    fact: "Rotates on its side, likely from a past collision." 
  },
  { 
    name: 'Neptune', 
    distance: 30.1, 
    period: 59800, 
    diameter: 49244, 
    color: '#3E54E8', // Deep Royal Blue
    horizons: 899,
    fact: "Has the strongest winds in the solar system." 
  },
]

const PlanetLabel = ({ planet, color, size }) => {
  const [visible, setVisible] = useState(true)
  const ref = useRef()
  const lastVisibleRef = useRef(true)

  useFrame(({ camera }) => {
    if (ref.current) {
      const worldPos = new THREE.Vector3()
      ref.current.getWorldPosition(worldPos)
      const dist = camera.position.distanceTo(worldPos)
      // Much larger threshold - basically always show unless very far
      const isVisible = dist < 300
      
      // Only update state if visibility actually changed
      if (lastVisibleRef.current !== isVisible) {
        lastVisibleRef.current = isVisible
        setVisible(isVisible)
      }
    }
  })

  if (!visible) return null

  return (
    <Html 
      position={[0, size * 2.5, 0]} // Position above the planet
      style={{ 
        pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s',
        transformStyle: 'preserve-3d',
        willChange: 'transform' // Optimize rendering
      }}
      ref={ref}
      center
      occlude={false}
      zIndexRange={[16777271, 0]}
      distanceFactor={15} // Increased for less drastic scaling
      transform // Always face camera (billboard effect)
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        width: '240px',
        transform: 'translate(20px, -50%)' // Offset slightly
      }}>
        {/* Connector Line */}
        <div style={{
          width: '40px',
          height: '1px',
          background: color,
          marginRight: '10px',
          transformOrigin: 'left',
          transform: 'rotate(-15deg)'
        }} />
        
        {/* Card */}
        <div style={{
          background: 'rgba(10, 10, 15, 0.9)',
          border: `2px solid ${color}`,
          borderRadius: '10px',
          padding: '16px',
          color: 'white',
          backdropFilter: 'blur(8px)',
          boxShadow: `0 0 20px ${color}60`,
          minWidth: '200px',
          userSelect: 'none'
        }}>
          <h3 style={{ 
            margin: '0 0 6px 0', 
            color: color, 
            fontSize: '18px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            textShadow: `0 0 10px ${color}`
          }}>
            {planet.name}
          </h3>
          <p style={{ 
            margin: 0, 
            fontSize: '13px', 
            lineHeight: '1.5', 
            color: '#eee',
            fontWeight: '400'
          }}>
            {planet.fact}
          </p>
        </div>
      </div>
    </Html>
  )
}

const Planets = ({ onSelect, time }) => {
  const scale = 10.0 // 1 AU = 10 units
  
  return (
    <group>
      {PLANET_DATA.map((planet, idx) => {
        const angle = (time / planet.period) * Math.PI * 2
        const x = Math.cos(angle) * planet.distance * scale
        const z = Math.sin(angle) * planet.distance * scale
        const y = 0 
        
        // Increased size significantly for better visibility
        const size = Math.log(planet.diameter / 1000 + 1) * 0.8

        return (
          <group key={planet.name} position={[x, y, z]}>
            {/* Planet Sphere - Polished PBR Look */}
            <mesh 
              onClick={(e) => {
                e.stopPropagation()
                onSelect({
                  id: planet.horizons.toString(),
                  name: planet.name,
                  class: 'Planet',
                  diameter: planet.diameter,
                  period: planet.period,
                  distance: planet.distance,
                  fact: planet.fact
                })
              }}
            >
              <sphereGeometry args={[size, 64, 64]} />
              <meshStandardMaterial 
                color={planet.color}
                roughness={0.4}
                metalness={0.1}
                emissive={planet.color}
                emissiveIntensity={0.1}
              />
            </mesh>
            
            {/* Atmosphere Glow (Fresnel-like) */}
            <mesh scale={[1.1, 1.1, 1.1]}>
              <sphereGeometry args={[size, 32, 32]} />
              <meshBasicMaterial 
                color={planet.color} 
                transparent 
                opacity={0.15} 
                blending={THREE.AdditiveBlending} 
                side={THREE.BackSide}
              />
            </mesh>

            {/* Rings for Saturn & Uranus */}
            {(planet.name === 'Saturn' || planet.name === 'Uranus') && (
              <mesh rotation={[Math.PI / 3, 0, 0]}>
                <ringGeometry args={[size * 1.4, size * 2.2, 64]} />
                <meshStandardMaterial 
                  color={planet.color} 
                  transparent 
                  opacity={0.6} 
                  side={THREE.DoubleSide} 
                  emissive={planet.color}
                  emissiveIntensity={0.1}
                />
              </mesh>
            )}

            {/* Planet labels removed - info moved to flashcard system */}
          </group>
        )
      })}
    </group>
  )
}

export default Planets
