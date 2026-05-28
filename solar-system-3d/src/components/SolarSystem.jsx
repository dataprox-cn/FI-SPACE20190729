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
          name: meta.names[closestId] || `Asteroid ${meta.ids[closestId]}`,
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

  // Handle asteroid searches (only when searchResults changes)
  useEffect(() => {
    if (!asteroidData || !searchResults.length) return;

    const asteroidResult = searchResults.find(result => result.type === 'asteroid');
    if (!asteroidResult || !asteroidResult.query) return;

    const query = asteroidResult.query;
    const q = query.toLowerCase().trim();

    // Search by asteroid ID (numeric)
    if (/^\d+$/.test(query)) {
      const idMatch = asteroidData.meta.ids.findIndex(id => id.toString() === query);
      if (idMatch !== -1) {
        const offset = idMatch * 9;
        const e = asteroidData.data[offset];
        const q_val = asteroidData.data[offset + 1];
        const a = q_val / (1.0 - e);
        const period = Math.sqrt(Math.pow(a, 3)) * 365.25;

        const orbit = {
          e: asteroidData.data[offset],
          q: asteroidData.data[offset + 1],
          i: asteroidData.data[offset + 2],
          om: asteroidData.data[offset + 3],
          w: asteroidData.data[offset + 4],
          ma: asteroidData.data[offset + 5],
          epoch: asteroidData.data[offset + 6]
        };

        const info = {
          id: asteroidData.meta.ids[idMatch],
          name: asteroidData.meta.names[idMatch] || `Asteroid ${asteroidData.meta.ids[idMatch]}`,
          class: asteroidData.meta.classes[Math.round(asteroidData.data[offset + 8])],
          diameter: asteroidData.data[offset + 7],
          type: 'asteroid',
          period: period,
          orbit: orbit
        };

        const pos = getAsteroidPosition(orbit, time);
        info.distance = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z);

        onSelect(info);
        return;
      }
    }

    // Search by asteroid class
    const classMatch = ['APO', 'MBA', 'ATE', 'TNO', 'CEN'].find(cls => cls.toLowerCase() === q);
    if (classMatch) {
      for (let i = 0; i < asteroidData.count; i++) {
        const asteroidClass = asteroidData.meta.classes[Math.round(asteroidData.data[i*9 + 8])];
        if (asteroidClass === classMatch) {
          const offset = i * 9;
          const e = asteroidData.data[offset];
          const q_val = asteroidData.data[offset + 1];
          const a = q_val / (1.0 - e);
          const period = Math.sqrt(Math.pow(a, 3)) * 365.25;

          const orbit = {
            e: asteroidData.data[offset],
            q: asteroidData.data[offset + 1],
            i: asteroidData.data[offset + 2],
            om: asteroidData.data[offset + 3],
            w: asteroidData.data[offset + 4],
            ma: asteroidData.data[offset + 5],
            epoch: asteroidData.data[offset + 6]
          };

          const info = {
            id: asteroidData.meta.ids[i],
            name: asteroidData.meta.names[i] || `Asteroid ${asteroidData.meta.ids[i]}`,
            class: asteroidClass,
            diameter: asteroidData.data[offset + 7],
            type: 'asteroid',
            period: period,
            orbit: orbit
          };

          const pos = getAsteroidPosition(orbit, time);
          info.distance = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z);

          onSelect(info);
          break;
        }
      }
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
