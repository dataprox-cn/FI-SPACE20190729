import React, { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
// EffectComposer/Bloom disabled — incompatible with current three/fiber versions
import * as THREE from 'three'
import SolarSystem from './components/SolarSystem'
import HUD from './components/HUD'
import CameraController from './components/ui/CameraController'

// Planet data for search functionality
const PLANET_DATA = [
  { name: 'Mercury', distance: 0.39, period: 88, diameter: 4879, horizons: 199 },
  { name: 'Venus', distance: 0.72, period: 225, diameter: 12104, horizons: 299 },
  { name: 'Earth', distance: 1.0, period: 365, diameter: 12742, horizons: 399 },
  { name: 'Mars', distance: 1.52, period: 687, diameter: 6779, horizons: 499 },
  { name: 'Jupiter', distance: 5.2, period: 4331, diameter: 139822, horizons: 599 },
  { name: 'Saturn', distance: 9.5, period: 10747, diameter: 116464, horizons: 699 },
  { name: 'Uranus', distance: 19.2, period: 30589, diameter: 50724, horizons: 799 },
  { name: 'Neptune', distance: 30.1, period: 59800, diameter: 49244, horizons: 899 },
]

function App() {
  const [selectedAsteroid, setSelectedAsteroid] = useState(null)
  const [quality, setQuality] = useState('high') // 'high' or 'low'
  const [searchResults, setSearchResults] = useState([])
  const [activeFilters, setActiveFilters] = useState({})
  
  // Interactive Simulation Controls
  const [speed, setSpeed] = useState(50) // Default time speed (days/sec relative)
  const [isPaused, setIsPaused] = useState(false)
  const [showOrbits, setShowOrbits] = useState(true)
  const [showLabels, setShowLabels] = useState(true)

  const controlsRef = useRef()

  // Add mobile check/default
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setQuality('low');
      setSpeed(10); // Slower speed default on mobile
    }
  }, []);

  // Search functionality
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const results = [];
    let foundMatch = false;

    // 1. Search planets first
    const planetMatches = PLANET_DATA.filter(planet =>
      planet.name.toLowerCase().includes(q)
    );

    if (planetMatches.length > 0) {
      planetMatches.forEach(planet => {
        results.push({
          type: 'planet',
          id: planet.horizons.toString(),
          name: planet.name,
          class: planet.name, // Use planet name as class to get correct color
          diameter: planet.diameter,
          period: planet.period,
          distance: planet.distance,
          position: calculatePlanetPosition(planet, 0)
        });
      });
      foundMatch = true;
    }

    // 2. For asteroid searches, create a placeholder result that will be processed by SolarSystem
    const isNumeric = /^\d+$/.test(query.trim());
    const isClass = ['apo', 'mba', 'ate', 'tno', 'cen'].includes(q);

    if (!foundMatch && (isNumeric || isClass)) {
      results.push({
        type: 'asteroid',
        query: query.trim()
      });
    }

    setSearchResults(results);

    // If we found planet results, focus on the first one and show details
    if (results.length > 0 && results[0].type === 'planet') {
      setSelectedAsteroid(results[0]); // Show planet details in the panel
    }
  };

  // Calculate planet position for camera focusing
  const calculatePlanetPosition = (planet, time) => {
    const angle = (time / planet.period) * Math.PI * 2;
    const scale = 10.0; // Same scale as in SolarSystem
    const x = Math.cos(angle) * planet.distance * scale;
    const z = Math.sin(angle) * planet.distance * scale;
    const y = 0;
    return new THREE.Vector3(x, y, z);
  };

  // Toggle filter on/off
  const handleToggleFilter = (cls) => {
    setActiveFilters(prev => ({
      ...prev,
      [cls]: prev[cls] === false ? true : false
    }))
  }

  return (
    <>
      <Canvas 
        camera={{ position: [0, 120, 120], fov: 50, far: 1000, near: 0.1 }}
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
        <ambientLight intensity={0.15} /> {/* Base fill so all planets are visible */}
        <hemisphereLight args={['#334466', '#111122', 0.25]} /> {/* Soft sky/ground fill light */}
        <pointLight position={[0, 0, 0]} intensity={8} color="#ffddaa" distance={0} decay={0} /> {/* Sun light — illuminates nearby planets strongly */}
        <spotLight position={[50, 50, 50]} angle={0.5} penumbra={1} intensity={0.6} color="#ffffff" /> {/* Rim lighting */}
        
        <Suspense fallback={null}>
          <SolarSystem 
            onSelect={setSelectedAsteroid} 
            searchResults={searchResults} 
            activeFilters={activeFilters}
            speed={speed}
            isPaused={isPaused}
            showOrbits={showOrbits}
            showLabels={showLabels}
            selectedObject={selectedAsteroid}
          />
          <Stars radius={400} depth={60} count={quality === 'high' ? 8000 : 2000} factor={6} saturation={0.5} fade speed={1.2} />
        </Suspense>
        
        <OrbitControls
          ref={controlsRef}
          minDistance={5}
          maxDistance={800}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />

        {/* Dynamic target tracking and camera flying */}
        <CameraController selectedObject={selectedAsteroid} controlsRef={controlsRef} speed={speed} isPaused={isPaused} />
      </Canvas>
      <HUD
        selected={selectedAsteroid}
        onDeselect={() => setSelectedAsteroid(null)}
        quality={quality}
        setQuality={setQuality}
        asteroidCount={18000} // This matches the curated count
        onSearch={handleSearch}
        activeFilters={activeFilters}
        onToggleFilter={handleToggleFilter}
        
        // Dynamic time state wires
        speed={speed}
        setSpeed={setSpeed}
        isPaused={isPaused}
        setIsPaused={setIsPaused}
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
      />
    </>
  )
}

export default App
