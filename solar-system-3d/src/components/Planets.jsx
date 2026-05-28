import React, { useRef, useState, useMemo, useEffect } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { loadPlanetTextures } from '../utils/textureLoader'
import { generateNormalMapFromTexture } from '../utils/normalMapGenerator'
import { AtmosphereShader } from '../utils/AtmosphereShader'

const PLANET_DATA = [
  { 
    name: 'Mercury', 
    distance: 0.39, 
    period: 88, 
    diameter: 4879, 
    color: '#A5A5A5', 
    horizons: 199,
    classDesc: 'Rocky Planet',
    fact: "Smallest planet, experiences extreme temperature swings." 
  },
  { 
    name: 'Venus', 
    distance: 0.72, 
    period: 225, 
    diameter: 12104, 
    color: '#E3BB76', 
    horizons: 299,
    classDesc: 'Terrestrial Planet',
    fact: "Hottest planet due to a thick atmosphere, rotates backward." 
  },
  { 
    name: 'Earth', 
    distance: 1.0, 
    period: 365, 
    diameter: 12742, 
    color: '#2E81E6', 
    horizons: 399,
    classDesc: 'Habitable Planet',
    fact: "Only planet known to support life, has abundant liquid water." 
  },
  { 
    name: 'Mars', 
    distance: 1.52, 
    period: 687, 
    diameter: 6779, 
    color: '#D14A28', 
    horizons: 499,
    classDesc: 'Terrestrial Planet',
    fact: "Known as the 'Red Planet' due to iron oxide on its surface." 
  },
  { 
    name: 'Jupiter', 
    distance: 5.2, 
    period: 4331, 
    diameter: 139822, 
    color: '#DBC29E', 
    horizons: 599,
    classDesc: 'Gas Giant',
    fact: "Largest planet, its Great Red Spot is a massive storm." 
  },
  { 
    name: 'Saturn', 
    distance: 9.5, 
    period: 10747, 
    diameter: 116464, 
    color: '#EBD797', 
    horizons: 699,
    classDesc: 'Gas Giant',
    fact: "Famous for its complex and extensive ring system." 
  },
  { 
    name: 'Uranus', 
    distance: 19.2, 
    period: 30589, 
    diameter: 50724, 
    color: '#93B8BE', 
    horizons: 799,
    classDesc: 'Ice Giant',
    fact: "Rotates on its side, likely from a past collision." 
  },
  { 
    name: 'Neptune', 
    distance: 30.1, 
    period: 59800, 
    diameter: 49244, 
    color: '#3E54E8', 
    horizons: 899,
    classDesc: 'Ice Giant',
    fact: "Has the strongest winds in the solar system." 
  },
]

// Glowing 3D circular line for planetary orbits
const OrbitLine = ({ radius, color, visible }) => {
  const points = useMemo(() => {
    const pts = []
    const segments = 180
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
    }
    return pts
  }, [radius])

  if (!visible) return null

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
        opacity={0.22} 
        linewidth={1.5} 
        depthWrite={false}
      />
    </line>
  )
}

// Interactive floating futuristic holographic labels
const PlanetLabel = ({ planet, color, size, onSelect, visible }) => {
  const ref = useRef()
  const [hovered, setHovered] = useState(false)

  if (!visible) return null

  return (
    <Html 
      position={[0, size * 2.2, 0]} 
      style={{ 
        pointerEvents: 'auto',
        transformStyle: 'preserve-3d',
        willChange: 'transform'
      }}
      ref={ref}
      center
      occlude={false}
      zIndexRange={[100, 0]}
      distanceFactor={22}
      transform
    >
      <div 
        onClick={(e) => {
          e.stopPropagation()
          onSelect({
            id: planet.horizons.toString(),
            name: planet.name,
            class: planet.name,
            diameter: planet.diameter,
            period: planet.period,
            distance: planet.distance,
            fact: planet.fact,
            type: 'planet'
          })
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          transform: `scale(${hovered ? 1.05 : 1})`,
          transition: 'transform 0.2s ease',
          userSelect: 'none'
        }}
      >
        {/* Holographic line */}
        <div style={{
          width: '25px',
          height: '1px',
          background: color,
          opacity: 0.7,
          transformOrigin: 'left',
          transform: 'rotate(-20deg)',
          marginRight: '6px'
        }} />
        
        {/* Futuristic Minimal Tag */}
        <div style={{
          background: 'rgba(10, 12, 22, 0.75)',
          border: `1.5px solid ${color}`,
          borderRadius: '6px',
          padding: '6px 12px',
          color: 'white',
          backdropFilter: 'blur(8px)',
          boxShadow: hovered ? `0 0 16px ${color}90` : `0 0 8px ${color}40`,
          minWidth: '100px',
          textAlign: 'left',
          borderLeft: `4px solid ${color}`
        }}>
          <div style={{ 
            color: color, 
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            lineHeight: '1.2'
          }}>
            {planet.name}
          </div>
          <div style={{ 
            fontSize: '8px', 
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: '0.6px',
            marginTop: '2px',
            textTransform: 'uppercase'
          }}>
            {planet.classDesc}
          </div>
        </div>
      </div>
    </Html>
  )
}

const Planets = ({ onSelect, time, showOrbits, showLabels, selectedObject }) => {
  const scale = 10.0 // 1 AU = 10 units
  
  const earthCloudsRef = useRef()
  const uranusGroupRef = useRef()
  const planetMeshRefs = useRef({})
  const [texturesLoaded, setTexturesLoaded] = useState(false)
  
  // Load all real texture maps (Solar System Scope CC-BY 4.0)
  const textures = useMemo(() => loadPlanetTextures(), [])

  // Map planet names to their texture
  const planetTextureMap = useMemo(() => ({
    Mercury: textures.Mercury,
    Venus:   textures.Venus,
    Earth:   textures.Earth,
    Mars:    textures.Mars,
    Jupiter: textures.Jupiter,
    Saturn:  textures.Saturn,
    Uranus:  textures.Uranus,
    Neptune: textures.Neptune,
  }), [textures])

  useEffect(() => {
    // Wait for the key textures to be fully loaded with image objects
    const checkInterval = setInterval(() => {
      if (textures.Mars?.image && textures.Mercury?.image) {
        setTexturesLoaded(true)
        clearInterval(checkInterval)
      }
    }, 100)
    return () => clearInterval(checkInterval)
  }, [textures])

  // Generate procedural normal maps for Mars and Mercury to enhance lighting details
  const marsNormalMap = useMemo(() => {
    if (texturesLoaded && textures.Mars?.image) {
      return generateNormalMapFromTexture(textures.Mars, 2.5)
    }
    return null
  }, [texturesLoaded, textures.Mars])

  const mercuryNormalMap = useMemo(() => {
    if (texturesLoaded && textures.Mercury?.image) {
      return generateNormalMapFromTexture(textures.Mercury, 1.8)
    }
    return null
  }, [texturesLoaded, textures.Mercury])

  useFrame((state, delta) => {
    // Drifting clouds on Earth
    if (earthCloudsRef.current) {
      earthCloudsRef.current.rotation.y += delta * 0.015
    }
    // Spin Uranus sideways
    if (uranusGroupRef.current) {
      uranusGroupRef.current.rotation.x = Math.PI / 2 // Sideways axis
      uranusGroupRef.current.rotation.y += delta * 0.05
    }
    // Self-rotation for all planets
    Object.values(planetMeshRefs.current).forEach(mesh => {
      if (mesh) mesh.rotation.y += delta * 0.1
    })
  })

  return (
    <group>
      {/* Permanent Orbit Lines */}
      {PLANET_DATA.map(planet => (
        <OrbitLine 
          key={`orbit-${planet.name}`} 
          radius={planet.distance * scale} 
          color={planet.color} 
          visible={showOrbits} 
        />
      ))}

      {/* Render Planets */}
      {PLANET_DATA.map((planet) => {
        const angle = (time / planet.period) * Math.PI * 2
        const x = Math.cos(angle) * planet.distance * scale
        const z = Math.sin(angle) * planet.distance * scale
        const y = 0 
        
        // Cube root size scaling for high-end visualization balance
        const baseSize = Math.pow(planet.diameter / 1000, 1/3) * 1.3
        const minSize = 1.0 
        const distanceBoost = planet.distance > 8 ? 1.4 : 1.0 
        const size = Math.max(baseSize * distanceBoost, minSize)

        const mainMap = planetTextureMap[planet.name]
        const isUranus = planet.name === 'Uranus'

        // Emissive intensity ramps up with distance so outer planets stay visible
        // Inner planets (< 2AU) get subtle fill, outer planets get strong self-illumination
        const emissiveIntensity = planet.distance > 8 ? 0.35 : planet.distance > 3 ? 0.2 : 0.08

        return (
          <group key={planet.name} position={[x, y, z]}>
            {/* Standard textured planet mesh */}
            {planet.name === 'Earth' ? (
              <mesh 
                ref={el => { planetMeshRefs.current[planet.name] = el }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect({
                    id: planet.horizons.toString(),
                    name: planet.name,
                    class: planet.name,
                    diameter: planet.diameter,
                    period: planet.period,
                    distance: planet.distance,
                    fact: planet.fact,
                    type: 'planet'
                  })
                }}
              >
                <sphereGeometry args={[size, 64, 64]} />
                <meshToonMaterial 
                  map={mainMap}
                  normalMap={textures.EarthNormal}
                  normalScale={new THREE.Vector2(1.2, 1.2)}
                  color="#ffffff"
                />
              </mesh>
            ) : isUranus ? (
              // Side-spinning Uranus (98-degree axial tilt)
              <group ref={uranusGroupRef}>
                <mesh 
                  ref={el => { planetMeshRefs.current[planet.name] = el }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect({
                      id: planet.horizons.toString(),
                      name: planet.name,
                      class: planet.name,
                      diameter: planet.diameter,
                      period: planet.period,
                      distance: planet.distance,
                      fact: planet.fact,
                      type: 'planet'
                    })
                  }}
                >
                  <sphereGeometry args={[size, 64, 64]} />
                  <meshToonMaterial 
                    map={mainMap}
                    color="#ffffff"
                  />
                </mesh>

                {/* Uranus Vertical / Sideways Ring - rendered inside the sideways coordinate group */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[size * 1.45, size * 1.65, 64]} />
                  <meshBasicMaterial 
                    color={planet.color}
                    transparent 
                    opacity={0.65} 
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            ) : (
              // Standard illustrative planet mesh (Mercury, Venus, Mars, Jupiter, Saturn, Neptune)
              <mesh 
                ref={el => { planetMeshRefs.current[planet.name] = el }}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect({
                    id: planet.horizons.toString(),
                    name: planet.name,
                    class: planet.name,
                    diameter: planet.diameter,
                    period: planet.period,
                    distance: planet.distance,
                    fact: planet.fact,
                    type: 'planet'
                  })
                }}
              >
                <sphereGeometry args={[size, 64, 64]} />
                <meshToonMaterial 
                  map={mainMap}
                  normalMap={planet.name === 'Mars' ? marsNormalMap : planet.name === 'Mercury' ? mercuryNormalMap : null}
                  normalScale={planet.name === 'Mars' ? new THREE.Vector2(1.8, 1.8) : new THREE.Vector2(1.4, 1.4)}
                  color="#ffffff"
                />
              </mesh>
            )}

            {/* Earth Cloud Layer */}
            {planet.name === 'Earth' && (
              <mesh ref={earthCloudsRef} scale={[1.008, 1.008, 1.008]}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial 
                  map={textures.EarthClouds}
                  transparent 
                  opacity={0.45} 
                  depthWrite={false}
                  blending={THREE.NormalBlending}
                />
              </mesh>
            )}
            
            {/* Volumetric Rayleigh Scattering Atmosphere Halo */}
            {['Earth', 'Venus', 'Uranus', 'Neptune'].includes(planet.name) ? (
              <mesh scale={planet.name === 'Earth' ? [1.09, 1.09, 1.09] : planet.name === 'Venus' ? [1.07, 1.07, 1.07] : [1.14, 1.14, 1.14]}>
                <sphereGeometry args={[size, 32, 32]} />
                <shaderMaterial
                  vertexShader={AtmosphereShader.vertexShader}
                  fragmentShader={AtmosphereShader.fragmentShader}
                  uniforms={{
                    color: { value: new THREE.Color(planet.color) },
                    coefficient: { value: planet.name === 'Venus' ? 0.72 : 0.62 },
                    power: { value: planet.name === 'Venus' ? 4.0 : 5.5 }
                  }}
                  transparent
                  blending={THREE.AdditiveBlending}
                  side={THREE.BackSide}
                  depthWrite={false}
                />
              </mesh>
            ) : (
              /* Non-atmosphere basic glow for Mercury, Mars, Jupiter, Saturn */
              <mesh scale={[1.08, 1.08, 1.08]}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshBasicMaterial 
                  color={planet.color} 
                  transparent 
                  opacity={planet.distance > 8 ? 0.28 : 0.16} 
                  blending={THREE.AdditiveBlending} 
                  side={THREE.BackSide}
                  depthWrite={false}
                />
              </mesh>
            )}

            {/* High-Fidelity Photorealistic Ring Systems */}
            {planet.name === 'Saturn' && (
              <mesh rotation={[Math.PI / 2.8, 0, 0]}>
                <ringGeometry args={[size * 1.35, size * 2.3, 64]} />
                <meshToonMaterial 
                  map={textures.SaturnRings} 
                  transparent 
                  opacity={0.88} 
                  side={THREE.DoubleSide}
                  color="#ffffff"
                />
              </mesh>
            )}

            {/* Redundant Uranus ring node removed (moved inside uranusGroupRef) */}

            {/* Holographic floating labels */}
            <PlanetLabel 
              planet={planet} 
              color={planet.color} 
              size={size} 
              onSelect={onSelect}
              visible={showLabels}
            />
          </group>
        )
      })}
    </group>
  )
}

export default Planets
