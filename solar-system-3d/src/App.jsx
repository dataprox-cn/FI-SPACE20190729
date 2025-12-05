import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import SolarSystem from './components/SolarSystem'
import HUD from './components/HUD'

// Temporarily disable postprocessing to avoid errors
// Will re-enable once compatibility issues are resolved
const ENABLE_POSTPROCESSING = false

function App() {
  const [selectedAsteroid, setSelectedAsteroid] = useState(null)
  const [quality, setQuality] = useState('high') // 'high' or 'low'

  // Add mobile check/default
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) setQuality('low');
  }, []);

  return (
    <>
      <Canvas 
        camera={{ position: [0, 80, 80], fov: 50, far: 2000, near: 0.1 }}
        dpr={quality === 'high' ? [1, 2] : [0.75, 1.5]} // Dynamic pixel ratio
        gl={{ 
          antialias: quality === 'high',
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false
        }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.05} /> {/* Reduced ambient for more contrast */}
        <pointLight position={[0, 0, 0]} intensity={3} color="#ffaa00" distance={0} decay={0} /> {/* Sun light */}
        <spotLight position={[50, 50, 50]} angle={0.5} penumbra={1} intensity={1} color="#ffffff" /> {/* Rim light */}
        
        <Suspense fallback={null}>
          <SolarSystem onSelect={setSelectedAsteroid} />
          <Stars radius={300} depth={50} count={quality === 'high' ? 5000 : 1000} factor={4} saturation={0} fade speed={1} />
        </Suspense>
        
        <OrbitControls 
          minDistance={10} 
          maxDistance={600} 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />

        {/* Post-processing temporarily disabled due to compatibility issues */}
        {false && quality === 'high' && (
          // Postprocessing disabled for now
          null
        )}
      </Canvas>
      <HUD 
        selected={selectedAsteroid} 
        onDeselect={() => setSelectedAsteroid(null)}
        quality={quality} 
        setQuality={setQuality}
        asteroidCount={18000} // This should be dynamic
      />
    </>
  )
}

export default App
