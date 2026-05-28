import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createSparklingStarTexture, createRoundStarTexture } from '../../utils/starfieldGenerator'

/**
 * High-fidelity R3F component that renders a realistic illustrative starfield.
 * Populates deep space with tiny background stars and large, glowing four-pointed
 * cross-stars that twinkle and pulsate organically over time.
 */
const TwinklingStars = ({ count = 4000, sparklingCount = 120 }) => {
  const roundTex = useMemo(() => createRoundStarTexture(), [])
  const sparkTex = useMemo(() => createSparklingStarTexture(), [])
  
  const sparkRef = useRef()
  const roundRef = useRef()

  // Generate random positions in spherical shells
  const [roundPoints, sparkPoints] = useMemo(() => {
    const roundPts = []
    const sparkPts = []
    
    // 1. Regular background round stars
    for (let i = 0; i < count; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 380 + Math.random() * 220 // Scatter between 380 and 600 units
      
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      roundPts.push(x, y, z)
    }

    // 2. Larger sparkling 4-pointed cross-stars
    for (let i = 0; i < sparklingCount; i++) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 320 + Math.random() * 180 // Scattered closer (320-500) to emphasize scale
      
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      sparkPts.push(x, y, z)
    }

    return [new Float32Array(roundPts), new Float32Array(sparkPts)]
  }, [count, sparklingCount])

  // Gentle out-of-phase pulsating twinkle animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (sparkRef.current) {
      sparkRef.current.opacity = 0.52 + Math.sin(time * 2.2) * 0.44
    }
    if (roundRef.current) {
      roundRef.current.opacity = 0.65 + Math.cos(time * 1.3) * 0.3
    }
  })

  return (
    <group>
      {/* Small background stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[roundPoints, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={roundRef}
          size={2.2}
          map={roundTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>

      {/* Sparkling 4-pointed cross-stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[sparkPoints, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={sparkRef}
          size={11.0} // Large, beautiful infographic scale
          map={sparkTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
    </group>
  )
}

export default TwinklingStars
