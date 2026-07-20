import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import AsteroidField from './AsteroidField'
import Planets from './Planets'
import { loadAsteroidData } from '../utils/dataLoader'
import { getAsteroidPosition, getOrbitPoints } from '../utils/orbitalMath'
import { createSunTexture } from '../utils/textureGenerator'
import { loadPlanetTextures } from '../utils/textureLoader'
import { ASTEROID_COLORS } from '../utils/colors'

// Helper to format asteroid names nicely e.g. "1Ceres" -> "(1) Ceres", "65803Didymos1996GT" -> "(65803) Didymos"
const formatAsteroidName = (raw, id) => {
  if (!raw) return `Asteroid ${id || ''}`
  const match = raw.match(/^(\d+)([A-Z][a-z\sA-Z0-9'-]+)/)
  if (match) {
    const num = match[1]
    const rest = match[2]
    const subMatch = rest.match(/^([A-Za-z]+)(\d{4}[A-Z]{1,2}\d*)?$/)
    if (subMatch) {
      return `(${num}) ${subMatch[1]}`
    }
    return `(${num}) ${rest}`
  }
  return raw
}

// Renders the elliptical glowing path for selected asteroids
const SelectedOrbit = ({ orbit, color }) => {
  const points = useMemo(() => {
    if (!orbit) return []
    return getOrbitPoints(orbit, 128)
  }, [orbit])

  if (points.length === 0) return null

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={color} 
        transparent 
        opacity={0.7} 
        linewidth={2.5} 
        depthWrite={false} 
      />
    </line>
  )
}

const InteractionHandler = ({ data, count, meta, onSelect, timeRef }) => {
  const { camera, raycaster, pointer } = useThree()

  useEffect(() => {
    const handleClick = () => {
      raycaster.setFromCamera(pointer, camera)
      const ray = raycaster.ray

      // Time matched with dynamic timescale
      const time = timeRef.current
      
      let minDist = Infinity
      let closestId = -1
      
      // Threshold distance (units) - roughly asteroid size + tolerance
      const threshold = 4.0 

      // Data stride = 9
      for (let i = 0; i < count; i++) {
        const offset = i * 9
        const orbit = {
          e: data[offset],
          q: data[offset+1],
          i: data[offset+2],
          om: data[offset+3],
          w: data[offset+4],
          ma: data[offset+5],
          epoch: data[offset+6]
        }
        
        const pos = getAsteroidPosition(orbit, time)
        // Convert AU (pos) to World (scale=10)
        const scale = 10.0
        const worldPos = new THREE.Vector3(pos.x * scale, pos.y * scale, pos.z * scale)
        
        // Ray-Point distance
        const distSq = ray.distanceSqToPoint(worldPos)
        
        if (distSq < threshold * threshold) {
          if (distSq < minDist) {
            minDist = distSq
            closestId = i
          }
        }
      }

      if (closestId !== -1) {
        console.log("Hit asteroid:", closestId)
        const offset = closestId * 9
        const e = data[offset]
        const q = data[offset+1]
        const a = q / (1.0 - e)
        const period = Math.sqrt(Math.pow(a, 3)) * 365.25

        const orbit = {
          e: data[offset],
          q: data[offset+1],
          i: data[offset+2],
          om: data[offset+3],
          w: data[offset+4],
          ma: data[offset+5],
          epoch: data[offset+6]
        }

        // Construct info object with full orbit elements
        const info = {
          id: meta.ids[closestId],
          name: formatAsteroidName(meta.names[closestId], meta.ids[closestId]),
          class: meta.classes[Math.round(data[closestId*9 + 8])],
          diameter: data[closestId*9 + 7],
          type: 'asteroid',
          period: period,
          orbit: orbit
        }
        
        // Calculate current distance
        const pos = getAsteroidPosition(orbit, time)
        const dist = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z)
        info.distance = dist

        onSelect(info)
      } else {
        onSelect(null)
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [data, count, meta, onSelect, camera, raycaster, pointer, timeRef])

  return null
}

const SolarSystem = ({ onSelect, searchResults, activeFilters, speed, isPaused, showOrbits, showLabels, selectedObject }) => {
  const [asteroidData, setAsteroidData] = useState(null)
  const [error, setError] = useState(null)
  const [time, setTime] = useState(0)

  const accumulatedTimeRef = useRef(0)
  const sunRef = useRef()

  const textures = useMemo(() => loadPlanetTextures(), [])
  const sunTexture = textures.Sun

  useEffect(() => {
    loadAsteroidData()
      .then(setAsteroidData)
      .catch(err => {
        console.error('Failed to load asteroid data:', err)
        setError(err.message)
      })
  }, [])

  // Update time for simulation propagation
  useFrame((state, delta) => {
    if (!isPaused) {
      accumulatedTimeRef.current += delta * speed;
      if (sunRef.current) {
        sunRef.current.rotation.y += delta * 0.08 * (speed / 50.0);
      }
    }
    setTime(accumulatedTimeRef.current)
  })

  // Helper to select an asteroid by dataset index
  const selectAsteroidAtIndex = (i) => {
    if (!asteroidData) return
    const offset = i * 9
    const e = asteroidData.data[offset]
    const q_val = asteroidData.data[offset + 1]
    const a = q_val / (1.0 - e)
    const period = Math.sqrt(Math.pow(a, 3)) * 365.25

    const orbit = {
      e: asteroidData.data[offset],
      q: asteroidData.data[offset + 1],
      i: asteroidData.data[offset + 2],
      om: asteroidData.data[offset + 3],
      w: asteroidData.data[offset + 4],
      ma: asteroidData.data[offset + 5],
      epoch: asteroidData.data[offset + 6]
    }

    const info = {
      id: asteroidData.meta.ids[i],
      name: formatAsteroidName(asteroidData.meta.names[i], asteroidData.meta.ids[i]),
      class: asteroidData.meta.classes[Math.round(asteroidData.data[offset + 8])],
      diameter: asteroidData.data[offset + 7],
      type: 'asteroid',
      period: period,
      orbit: orbit
    }

    const currentSimTime = accumulatedTimeRef.current
    const pos = getAsteroidPosition(orbit, currentSimTime)
    info.distance = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z)

    onSelect(info)
  }

  // Handle asteroid searches (only when searchResults changes)
  useEffect(() => {
    if (!asteroidData || !searchResults || !searchResults.length) return;

    const asteroidResult = searchResults.find(result => result.type === 'asteroid');
    if (!asteroidResult || !asteroidResult.query) return;

    const rawQuery = asteroidResult.query;
    const q = rawQuery.toLowerCase().trim();
    if (!q) return;

    const cleanQuery = q.replace(/[^a-z0-9]/g, '');
    const textOnly = q.replace(/[^a-z]/g, '');
    const numbers = q.match(/\d+/g) || [];

    // 1. Search by orbital class abbreviation (e.g., MBA, APO, TNO, CEN, etc.)
    const classMatch = ['APO', 'MBA', 'ATE', 'TNO', 'CEN', 'AMO', 'IMB', 'OMB', 'MCA', 'GRK', 'TJN', 'HTC', 'JFC', 'COM'].find(cls => cls.toLowerCase() === q);
    if (classMatch) {
      for (let i = 0; i < asteroidData.count; i++) {
        const asteroidClass = asteroidData.meta.classes[Math.round(asteroidData.data[i*9 + 8])];
        if (asteroidClass === classMatch) {
          selectAsteroidAtIndex(i);
          return;
        }
      }
    }

    let bestIndex = -1;
    let bestScore = -1;

    for (let i = 0; i < asteroidData.count; i++) {
      const id = asteroidData.meta.ids[i].toString();
      const name = asteroidData.meta.names[i] || '';
      const nameLower = name.toLowerCase();
      const nameClean = nameLower.replace(/[^a-z0-9]/g, '');
      let score = 0;

      // A. Exact ID match (e.g. '2000001', '2065803') or stripped ID match (e.g. '1' -> '2000001', '65803' -> '2065803')
      if (id === q || id.slice(2).replace(/^0+/, '') === q || id === '20' + q.padStart(5, '0')) {
        score = 100;
      }
      // B. Name contains text query (e.g. 'ceres' in '1Ceres', 'didymos' in '65803Didymos1996GT')
      else if (textOnly && textOnly.length >= 2 && nameLower.includes(textOnly)) {
        if (nameClean.startsWith(textOnly) || nameLower.includes(textOnly)) {
          score = 90;
        } else {
          score = 80;
        }
      }
      // C. Number in query matches asteroid designation/ID (e.g. '1' in '1Ceres', '65803' in '65803Didymos')
      else if (numbers.length > 0) {
        for (const num of numbers) {
          const numRegex = new RegExp('^' + num + '[a-z]|\\b' + num + '\\b|^' + num);
          if (numRegex.test(nameLower) || id.endsWith(num) || id.slice(2).replace(/^0+/, '') === num) {
            score = 70;
            break;
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
        if (score === 100) break; // Exact match found
      }
    }

    if (bestIndex !== -1 && bestScore > 0) {
      selectAsteroidAtIndex(bestIndex);
    }
  }, [searchResults, asteroidData, onSelect])

  if (error) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="red" />
      </mesh>
    )
  }

  return (
    <group>
      {/* Central Sun Marker - Premium Detailed NASA Texture Design */}
      <group position={[0, 0, 0]}>
        {/* Textured sun sphere */}
        <mesh ref={sunRef}>
          <sphereGeometry args={[4.0, 64, 64]} />
          <meshBasicMaterial map={sunTexture} />
        </mesh>
        
        {/* Soft, layered dynamic atmospheric corona */}
        <mesh scale={[1.22, 1.22, 1.22]}>
          <sphereGeometry args={[4.0, 32, 32]} />
          <meshBasicMaterial 
            color="#ffba44" 
            transparent 
            opacity={0.32} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
          />
        </mesh>

        <mesh scale={[1.5, 1.5, 1.5]}>
          <sphereGeometry args={[4.0, 32, 32]} />
          <meshBasicMaterial 
            color="#ff5500" 
            transparent 
            opacity={0.14} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
          />
        </mesh>

        {showLabels && (
          <Text
            position={[0, 6.5, 0]}
            fontSize={2.2}
            color="#ffcc66"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.15}
            outlineColor="#000000"
          >
            Sun
          </Text>
        )}
      </group>
      
      {/* Planets with Labels, Orbits, and Custom Textures */}
      <Planets 
        onSelect={onSelect} 
        time={time} 
        showOrbits={showOrbits} 
        showLabels={showLabels} 
        selectedObject={selectedObject}
      />

      {/* Selected Asteroid Glowing Elliptical Orbit Track */}
      {selectedObject && selectedObject.type === 'asteroid' && selectedObject.orbit && showOrbits && (
        <SelectedOrbit 
          orbit={selectedObject.orbit} 
          color={ASTEROID_COLORS[selectedObject.class] || '#00e5ff'} 
        />
      )}
      
      {/* Asteroids */}
      {asteroidData && (
        <>
          <AsteroidField 
            data={asteroidData.data} 
            count={asteroidData.count} 
            meta={asteroidData.meta} 
            activeFilters={activeFilters} 
            speed={speed}
            isPaused={isPaused}
          />
          
          <InteractionHandler 
            data={asteroidData.data} 
            count={asteroidData.count} 
            meta={asteroidData.meta}
            onSelect={onSelect}
            timeRef={accumulatedTimeRef}
          />
        </>
      )}
    </group>
  )
}

export default SolarSystem
