import React, { useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { getAsteroidPosition } from '../utils/orbitalMath'
import { ASTEROID_COLORS } from '../utils/colors'

// Simplified planet orbital elements (approximate, circular orbits for simplicity)
// For real accuracy, we'd need to fetch from HORIZONS, but this is good enough for visualization
const PLANET_DATA = [
  { name: 'Mercury', distance: 0.39, period: 88, diameter: 4879, color: '#b6a965', horizons: 199 },
  { name: 'Venus', distance: 0.72, period: 225, diameter: 12104, color: '#d05227', horizons: 299 },
  { name: 'Earth', distance: 1.0, period: 365, diameter: 12742, color: '#7EBCE5', horizons: 399 },
  { name: 'Mars', distance: 1.52, period: 687, diameter: 6779, color: '#cb2655', horizons: 499 },
  { name: 'Jupiter', distance: 5.2, period: 4331, diameter: 139822, color: '#e1d9c4', horizons: 599 },
  { name: 'Saturn', distance: 9.5, period: 10747, diameter: 116464, color: '#A73E5C', horizons: 699 },
  { name: 'Uranus', distance: 19.2, period: 30589, diameter: 50724, color: '#F34E52', horizons: 799 },
  { name: 'Neptune', distance: 30.1, period: 59800, diameter: 49244, color: '#738cc1', horizons: 899 },
]

const Planets = ({ onSelect, time }) => {
  const scale = 10.0 // 1 AU = 10 units
  
  return (
    <group>
      {PLANET_DATA.map((planet, idx) => {
        // Simple circular orbit approximation
        const angle = (time / planet.period) * Math.PI * 2
        const x = Math.cos(angle) * planet.distance * scale
        const z = Math.sin(angle) * planet.distance * scale
        const y = 0 // Assume ecliptic plane
        
        // Size scaling (logarithmic like asteroids, but planets are much larger)
        const size = Math.log(planet.diameter / 1000 + 1) * 0.3
        
        return (
          <group key={planet.name} position={[x, y, z]}>
            {/* Planet Sphere */}
            <mesh 
              onClick={(e) => {
                e.stopPropagation() // Prevent background click from deselecting
                onSelect({
                  id: planet.horizons.toString(),
                  name: planet.name,
                  class: 'Planet',
                  diameter: planet.diameter,
                  period: planet.period,
                  distance: planet.distance
                })
              }}
            >
              <sphereGeometry args={[size, 16, 16]} />
              <meshBasicMaterial color={planet.color} />
            </mesh>
            
            {/* Glow effect (reduced by 60%) */}
            <mesh>
              <sphereGeometry args={[size * 1.5, 16, 16]} />
              <meshBasicMaterial 
                color={planet.color} 
                transparent 
                opacity={0.12} 
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
            
            {/* Label */}
            <Text
              position={[0, size + 1, 0]}
              fontSize={1.5}
              color={planet.color}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.1}
              outlineColor="#000000"
            >
              {planet.name}
            </Text>
          </group>
        )
      })}
    </group>
  )
}

export default Planets

