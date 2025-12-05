import React, { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ASTEROID_COLORS } from '../utils/colors'

// Sprite Texture Generation (Procedural Glow)
const createGlowTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  // Radial Gradient for Soft Glow (reduced by 60%, then +20% brighter)
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.48)'); // Center core (0.4 * 1.2)
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.384)'); // 0.32 * 1.2
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.096)'); // 0.08 * 1.2
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Edge
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

const vertexShader = `
  precision highp float;

  uniform float uTime;
  uniform float uScale; // Global scale for visibility
  
  // Instance Attributes
  attribute vec4 aOrbit; // e, q, i, om
  attribute vec3 aOrbit2; // w, ma, epoch
  attribute vec2 aProps;  // diameter, class_id

  varying float vClassId;
  varying float vAlpha;
  varying vec2 vUv;

  // Rotation functions
  vec3 rotateX(vec3 v, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c);
  }

  vec3 rotateZ(vec3 v, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(v.x * c - v.y * s, v.x * s + v.y * c, v.z);
  }

  void main() {
    vClassId = aProps.y;
    
    // Unpack Orbital Elements
    float e = aOrbit.x;
    float q = aOrbit.y;
    float i = aOrbit.z;
    float om = aOrbit.w;
    float w = aOrbit2.x;
    float ma = aOrbit2.y;
    
    // Propagate Orbit
    float a = q / (1.0 - e);
    float mu = 0.0002959122;
    float n = sqrt(mu / (a * a * a));
    float M = ma + n * uTime;
    
    // Newton-Raphson for E
    float E = M;
    for(int j = 0; j < 5; j++) {
      E = M + e * sin(E);
    }
    
    float P = a * (cos(E) - e);
    float Q = a * sqrt(1.0 - e * e) * sin(E);
    
    vec3 pos = vec3(P, Q, 0.0);
    
    // Apply Rotations
    pos = rotateZ(pos, w);
    pos = rotateX(pos, i);
    pos = rotateZ(pos, om);
    
    // World Position
    vec3 worldPos = pos * 10.0; // 1 AU = 10 units
    
    // Billboard Logic (Point Sprite behavior in mesh)
    // We want the quad to face the camera. 
    // Simplified: Just add position to view-aligned offset?
    // Actually, for thousands of particles, GL_POINTS is easiest, but size limit.
    // InstancedMesh with billboard constraint in shader is better.
    
    // View-aligned billboard
    vec3 viewRight = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
    vec3 viewUp = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    
    // Size calculation
    // Logarithmic scale for better visibility? Or literal diameter?
    // Original map uses log scale.
    // Increased base size for better visibility (+20%)
    float size = log(aProps.x + 1.0) * 1.2 * uScale;
    
    vec3 vPos = position * size;
    // Rotate vertex to face camera
    vec3 finalPos = worldPos + (viewRight * vPos.x) + (viewUp * vPos.y);
    
    vec4 mvPosition = viewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Distance fade logic for LOD (simple alpha fade based on z-depth?)
    // Or just fully opaque for the glow look.
    vAlpha = 1.0;
    vUv = uv;
  }
`

const fragmentShader = `
  precision highp float;
  
  uniform sampler2D uTexture; // Glow sprite
  uniform sampler2D uColorMap; // Color lookup texture
  
  varying float vClassId;
  varying float vAlpha;
  varying vec2 vUv;

  void main() {
    int id = int(vClassId + 0.5);
    // Lookup color from texture (x = class_id, y = 0)
    vec3 color = texture2D(uColorMap, vec2((float(id) + 0.5) / 32.0, 0.5)).rgb;
    
    // Sample texture (Glow sprite)
    vec4 texColor = texture2D(uTexture, vUv);
    
    // Additive blending prep (reduced glow by 60%, then +20% brighter)
    gl_FragColor = vec4(color, 1.0) * texColor;
    gl_FragColor.a = texColor.a * vAlpha * 0.48; // 0.4 * 1.2 = 0.48
    // Increase color intensity slightly for better visibility
    gl_FragColor.rgb *= 1.2;
  }
`

const AsteroidField = ({ data, count, meta }) => {
  const meshRef = useRef()
  const glowTexture = useMemo(() => createGlowTexture(), [])
  
  // Prepare Color Texture (more reliable than uniform array)
  const colorTexture = useMemo(() => {
    const size = 32; // max 32 classes
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    
    // Fill with default color first
    const defaultColor = new THREE.Color(ASTEROID_COLORS['default']);
    ctx.fillStyle = `rgb(${Math.floor(defaultColor.r * 255)}, ${Math.floor(defaultColor.g * 255)}, ${Math.floor(defaultColor.b * 255)})`;
    ctx.fillRect(0, 0, size, 1);
    
    // Fill with actual class colors
    if (meta && meta.classes) {
      meta.classes.forEach((cls, index) => {
        if (index >= size) return;
        const hex = ASTEROID_COLORS[cls] || ASTEROID_COLORS['default'];
        const c = new THREE.Color(hex);
        ctx.fillStyle = `rgb(${Math.floor(c.r * 255)}, ${Math.floor(c.g * 255)}, ${Math.floor(c.b * 255)})`;
        ctx.fillRect(index, 0, 1, 1);
      });
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }, [meta]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uTexture: { value: glowTexture },
    uColorMap: { value: colorTexture },
    uScale: { value: 2.4 } // Increased scale by 20% (2.0 * 1.2) for better visibility
  }), [glowTexture, colorTexture])

  // Geometry: Simple Quad for Billboard
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    
    const buffer = new THREE.InstancedInterleavedBuffer(data, 9, 1) // stride 9
    
    geo.setAttribute('aOrbit', new THREE.InterleavedBufferAttribute(buffer, 4, 0)) // e, q, i, om
    geo.setAttribute('aOrbit2', new THREE.InterleavedBufferAttribute(buffer, 3, 4)) // w, ma, epoch
    geo.setAttribute('aProps', new THREE.InterleavedBufferAttribute(buffer, 2, 7)) // diam, class
    
    return geo
  }, [data])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    // Speed up time: 1 second = 50 days (slower for beauty)
    uniforms.uTime.value = time * 50.0;
    
    // Update color array if needed (it's static usually)
    // uniforms.uColors.value = colorArray; 
  })
  
  // Re-update uniforms ref when colors change (async load)
  useEffect(() => {
    if (meshRef.current) {
        meshRef.current.material.uniforms.uColorMap.value = colorTexture;
    }
  }, [colorTexture]);

  return (
    <instancedMesh ref={meshRef} args={[geometry, null, count]}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false} // Important for additive glow overlapping
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  )
}

export default AsteroidField
