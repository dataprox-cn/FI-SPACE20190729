import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { getAsteroidPosition } from '../../utils/orbitalMath'

const PLANET_DATA = [
  { name: 'Mercury', distance: 0.39, period: 88 },
  { name: 'Venus', distance: 0.72, period: 225 },
  { name: 'Earth', distance: 1.0, period: 365 },
  { name: 'Mars', distance: 1.52, period: 687 },
  { name: 'Jupiter', distance: 5.2, period: 4331 },
  { name: 'Saturn', distance: 9.5, period: 10747 },
  { name: 'Uranus', distance: 19.2, period: 30589 },
  { name: 'Neptune', distance: 30.1, period: 59800 },
]

const CameraController = ({ selectedObject, controlsRef, speed, isPaused }) => {
  const { camera } = useThree()
  
  const accumulatedTimeRef = useRef(0)
  const isTransitioningRef = useRef(false)
  const lastSelectedIdRef = useRef(null)
  const transitionProgressRef = useRef(0)
  
  // Cache variables for smooth lerping
  const startCameraPosRef = useRef(new THREE.Vector3())
  const startTargetPosRef = useRef(new THREE.Vector3())
  const idealCameraOffsetRef = useRef(new THREE.Vector3(0, 320, 480))

  useEffect(() => {
    // When selected object changes, trigger cinematic flight transition
    const objectId = selectedObject ? selectedObject.id : 'sun'
    if (objectId !== lastSelectedIdRef.current) {
      lastSelectedIdRef.current = objectId
      isTransitioningRef.current = true
      transitionProgressRef.current = 0
      
      // Store starting states
      if (controlsRef.current) {
        startCameraPosRef.current.copy(camera.position)
        startTargetPosRef.current.copy(controlsRef.current.target)
        
        // Calculate appropriate viewing offset based on object physical size
        if (!selectedObject) {
          idealCameraOffsetRef.current.set(0, 320, 480)
        } else {
          const targetSize = selectedObject.type === 'planet' ? 24 : 12
          idealCameraOffsetRef.current.set(targetSize, targetSize * 0.7, targetSize)
        }
      }
    }
  }, [selectedObject, camera, controlsRef])

  useFrame((state, delta) => {
    // 1. Maintain perfectly synchronized timeline propagation
    if (!isPaused) {
      accumulatedTimeRef.current += delta * speed
    }

    if (!controlsRef.current) return

    const time = accumulatedTimeRef.current
    const scale = 10.0
    let targetPos = new THREE.Vector3(0, 0, 0) // Default: Sun

    // 2. Compute dynamic, moving coordinates for selected body
    if (selectedObject) {
      if (selectedObject.type === 'planet') {
        const planet = PLANET_DATA.find(p => p.name === selectedObject.name)
        if (planet) {
          const angle = (time / planet.period) * Math.PI * 2
          const x = Math.cos(angle) * planet.distance * scale
          const z = Math.sin(angle) * planet.distance * scale
          targetPos.set(x, 0, z)
        }
      } else if (selectedObject.type === 'asteroid' && selectedObject.orbit) {
        const pos = getAsteroidPosition(selectedObject.orbit, time)
        targetPos.set(pos.x * scale, pos.y * scale, pos.z * scale)
      }
    }

    // 3. Handle smooth transition flight
    if (isTransitioningRef.current) {
      transitionProgressRef.current += delta * 1.5 // 1.5 seconds total transition
      
      // Hermite smoothstep curve for professional easing
      const t = Math.min(1.0, transitionProgressRef.current)
      const ease = t * t * (3 - 2 * t)

      // Lerp camera target
      controlsRef.current.target.lerpVectors(startTargetPosRef.current, targetPos, ease)

      // Lerp camera position to ideal viewing orbit offset
      const idealCameraPos = targetPos.clone().add(idealCameraOffsetRef.current)
      camera.position.lerpVectors(startCameraPosRef.current, idealCameraPos, ease)
      
      controlsRef.current.update()

      if (t >= 1.0) {
        isTransitioningRef.current = false
      }
    } else {
      // 4. Post-flight active tracking
      // Gently lock camera target onto moving body coordinate
      controlsRef.current.target.copy(targetPos)
      controlsRef.current.update()
    }
  })

  return null
}

export default CameraController
