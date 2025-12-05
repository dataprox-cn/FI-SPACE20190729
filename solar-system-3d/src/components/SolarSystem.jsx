import React, { useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import AsteroidField from './AsteroidField'
import Planets from './Planets'
import { loadAsteroidData } from '../utils/dataLoader'
import { getAsteroidPosition } from '../utils/orbitalMath'

const InteractionHandler = ({ data, count, meta, onSelect }) => {
  const { camera, raycaster, pointer, clock } = useThree()

  useEffect(() => {
    const handleClick = () => {
      raycaster.setFromCamera(pointer, camera)
      const ray = raycaster.ray

      // Time must match shader: time * 50.0 (Updated speed)
      const time = clock.getElapsedTime() * 50.0
      
      let minDist = Infinity
      let closestId = -1
      
      // Threshold distance (units) - roughly asteroid size + tolerance
      // Increased threshold for easier touch selection (was 2.0)
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
        // Construct info object
        const info = {
          id: meta.ids[closestId],
          name: meta.names[closestId] || `Asteroid ${meta.ids[closestId]}`,
          class: meta.classes[Math.round(data[closestId*9 + 8])],
          diameter: data[closestId*9 + 7],
          // Calculate period (T^2 = a^3)
          // a = q / (1-e)
          // period = sqrt(a^3) * 365.25 (if a in AU, period in days approx)
        }
        // Improve Period/Distance calculation for display
        const offset = closestId * 9
        const e = data[offset]
        const q = data[offset+1]
        const a = q / (1.0 - e)
        const period = Math.sqrt(Math.pow(a, 3)) * 365.25
        info.period = period
        
        // Calculate current distance
        const pos = getAsteroidPosition({
          e: data[offset],
          q: data[offset+1],
          i: data[offset+2],
          om: data[offset+3],
          w: data[offset+4],
          ma: data[offset+5],
          epoch: data[offset+6]
        }, time)
        const dist = Math.sqrt(pos.x*pos.x + pos.y*pos.y + pos.z*pos.z)
        info.distance = dist

        onSelect(info)
      } else {
        // Only deselect if we didn't hit anything? 
        // We handle planet clicks separately, so if this runs on global click, it might conflict.
        // InteractionHandler attached to window click might override planet click.
        // Better: Raycast only when needed or let R3F handle it.
        // But for 18k instances, manual raycast is needed.
        // To avoid clearing planet selection, we should check if we hit an asteroid.
        // If not, we don't necessarily null it here if the event propagated from a planet.
        // But window click is global.
        
        // Let's use `event.stopPropagation` in Planets?
        // But this is a window listener.
        
        // We'll call onSelect(null) only if we explicitly clicked background?
        // Hard to know from here. 
        
        // Fix: Use the standard `onPointerDown` on the mesh instead of window listener?
        // InstancedMesh supports events if we use raycast logic in R3F.
        // But native R3F raycasting on 20k instances is slow.
        // Stick to this optimized one, but maybe only fire if no planet was clicked?
        
        // For now, let's just Log and Select if hit.
        if (closestId === -1) {
           // Don't deselect here, let the user click "X" on the card or click empty space explicitly?
           // Or just deselect.
           onSelect(null)
        }
      }
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [data, count, meta, onSelect, camera, raycaster, pointer, clock])

  return null
}

const SolarSystem = ({ onSelect }) => {
  const [asteroidData, setAsteroidData] = useState(null)
  const [error, setError] = useState(null)
  const [time, setTime] = useState(0)

  useEffect(() => {
    loadAsteroidData()
      .then(setAsteroidData)
      .catch(err => {
        console.error('Failed to load asteroid data:', err)
        setError(err.message)
      })
  }, [])

  // Update time for planet animation
  useFrame((state) => {
    setTime(state.clock.getElapsedTime() * 50.0) // Match asteroid time speed
  })

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
      {/* Central Sun Marker - Enhanced with simple glow mesh */}
      <group position={[0, 0, 0]}>
        <mesh>
          <sphereGeometry args={[3, 32, 32]} />
          <meshBasicMaterial color="#ffddaa" />
        </mesh>
        <mesh>
          <sphereGeometry args={[5, 32, 32]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <Text
          position={[0, 4, 0]}
          fontSize={2}
          color="#ffaa00"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.15}
          outlineColor="#000000"
        >
          Sun
        </Text>
      </group>
      
      {/* Planets with Labels */}
      <Planets onSelect={onSelect} time={time} />
      
      {/* Asteroids */}
      {asteroidData && (
        <>
          <AsteroidField data={asteroidData.data} count={asteroidData.count} meta={asteroidData.meta} />
          
          <InteractionHandler 
            data={asteroidData.data} 
            count={asteroidData.count} 
            meta={asteroidData.meta}
            onSelect={onSelect}
          />
        </>
      )}
    </group>
  )
}

export default SolarSystem
