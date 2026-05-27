import * as THREE from 'three'

// --- Lightweight Self-Contained Value Noise Generator ---
class ImprovedNoise {
  constructor() {
    this.p = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256)
    }
  }

  // Smooth interpolation curve
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  lerp(t, a, b) {
    return a + t * (b - a)
  }

  noise2D(x, y) {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255

    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)

    const u = this.fade(xf)
    const v = this.fade(yf)

    // Lookup table hashing
    const aa = this.p[(this.p[X] + Y) & 255]
    const ab = this.p[(this.p[X] + (Y + 1)) & 255]
    const ba = this.p[(this.p[(X + 1) & 255] + Y) & 255]
    const bb = this.p[(this.p[(X + 1) & 255] + (Y + 1)) & 255]

    // Map hash to a value between 0 and 1
    const v1 = aa / 255
    const v2 = ba / 255
    const v3 = ab / 255
    const v4 = bb / 255

    const x1 = this.lerp(u, v1, v2)
    const x2 = this.lerp(u, v3, v4)

    return this.lerp(v, x1, x2)
  }

  // Fractal Brownian Motion (fBm)
  fbm2D(x, y, octaves = 4, lacunarity = 2.0, gain = 0.5) {
    let total = 0
    let amplitude = 1.0
    let frequency = 1.0
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude
      maxValue += amplitude
      amplitude *= gain
      frequency *= lacunarity
    }

    return total / maxValue
  }
}

const noise = new ImprovedNoise()

// Helper to create and setup a CanvasTexture
const finalizeCanvasTexture = (canvas) => {
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

// Generate the Sun's dynamic fiery surface
export const createSunTexture = () => {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2

      // Map to 3D sphere coordinate for seamless noise
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      // Layered noise for plasma flares
      const n1 = noise.fbm2D(nx * 3.5, ny * 3.5 + nz * 3.5, 5, 2.1, 0.55)
      const n2 = noise.fbm2D(nx * 12.0, ny * 12.0 + nz * 12.0, 3, 2.0, 0.5)
      const nVal = n1 * 0.85 + n2 * 0.15

      // Fire Palette: Yellow, Orange, Deep Red
      const r = Math.floor(255)
      const g = Math.floor(130 * nVal + 125 * Math.pow(nVal, 2.0))
      const b = Math.floor(30 * Math.pow(nVal, 3.0))

      const idx = (y * width + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}

// Generate Mercury (Grey, heavily cratered, asteroid-scarred)
export const createMercuryTexture = () => {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  // Base texture using noise
  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      const nVal = noise.fbm2D(nx * 6.0, ny * 6.0 + nz * 6.0, 4)
      const grey = Math.floor(100 + nVal * 60)

      const idx = (y * width + x) * 4
      data[idx] = grey
      data[idx + 1] = grey
      data[idx + 2] = grey
      data[idx + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)

  // Draw 50 procedural craters on top
  for (let i = 0; i < 50; i++) {
    const cx = Math.random() * width
    const cy = Math.random() * height
    const r = Math.random() * 12 + 2

    // Crater Rim shadow
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(20,20,20,0.3)'
    ctx.fill()

    // Inner bowl reflection
    ctx.beginPath()
    ctx.arc(cx - r * 0.15, cy - r * 0.15, r * 0.8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(180,180,180,0.25)'
    ctx.fill()
  }

  return finalizeCanvasTexture(canvas)
}

// Generate Venus (Cream, yellowish-acid clouds, thick atmosphere look)
export const createVenusTexture = () => {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      // Venus has heavy wind shearing bands in noise
      const windShear = Math.sin(lat * 8.0) * 0.5
      const nVal = noise.fbm2D(nx * 4.0 + windShear, ny * 4.0 + nz * 4.0, 5, 2.5, 0.45)

      // Cream and Yellow sulfur shades
      const r = Math.floor(215 + nVal * 40)
      const g = Math.floor(180 + nVal * 45)
      const b = Math.floor(120 + nVal * 30)

      const idx = (y * width + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}

// Generate Earth's detailed photorealistic surface (continents, blue oceans)
export const createEarthTexture = () => {
  const width = 1024
  const height = 512
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      // Landmass continental generation using rich fBm noise
      const landNoise = noise.fbm2D(nx * 1.8, ny * 1.8 + nz * 1.8, 6, 2.2, 0.5)

      // Temperature factor for polar ice caps and desert colors
      const tempFactor = Math.abs(lat) / (Math.PI / 2) // 0 at equator, 1 at poles

      let r, g, b

      if (landNoise > 0.45) {
        // --- Land ---
        const elevation = (landNoise - 0.45) / 0.55
        
        if (tempFactor > 0.85) {
          // Polar Ice Caps
          r = 240
          g = 245
          b = 255
        } else if (elevation > 0.7) {
          // Mountains (Snow capped / Brown)
          const snowCap = (elevation - 0.7) / 0.3
          r = Math.floor(100 + snowCap * 130)
          g = Math.floor(75 + snowCap * 155)
          b = Math.floor(60 + snowCap * 185)
        } else if (tempFactor < 0.35 && elevation < 0.25) {
          // Equatorial Sand/Desert
          r = 190
          g = 160
          b = 115
        } else {
          // Forests and Vegetation
          r = Math.floor(45 + elevation * 40)
          g = Math.floor(115 - elevation * 20)
          b = Math.floor(45 + elevation * 10)
        }
      } else {
        // --- Ocean ---
        const depth = landNoise / 0.45
        
        if (tempFactor > 0.9) {
          // Frozen polar ocean
          r = 230; g = 238; b = 250
        } else {
          // Rich, deep ocean gradients
          r = Math.floor(10 * depth)
          g = Math.floor(40 * depth + 20)
          b = Math.floor(125 * depth + 40)
        }
      }

      const idx = (y * width + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}

// Generate Earth's specularity map (glossiness for oceans, matte for land)
export const createEarthSpecularMap = () => {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      const landNoise = noise.fbm2D(nx * 1.8, ny * 1.8 + nz * 1.8, 6, 2.2, 0.5)

      let spec = 0 // Land is matte (0 specularity / high roughness)
      if (landNoise <= 0.45) {
        spec = 200 // Oceans are shiny (high specularity / low roughness)
      }

      const idx = (y * width + x) * 4
      data[idx] = spec
      data[idx + 1] = spec
      data[idx + 2] = spec
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}

// Generate Earth's moving cloud patterns (highly dynamic, transparent white clouds)
export const createEarthCloudTexture = () => {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      // Planetary wind shears stretched clouds horizontally
      const shear = Math.sin(lat * 5.0) * 0.4
      const cloudVal = noise.fbm2D(nx * 3.0 + shear, ny * 3.0, 5, 2.0, 0.5)

      // Isolate cloud masses with a threshold curve
      const density = Math.max(0, (cloudVal - 0.38) / 0.62)
      const alpha = Math.floor(density * 220)

      const idx = (y * width + x) * 4
      data[idx] = 255
      data[idx + 1] = 255
      data[idx + 2] = 255
      data[idx + 3] = alpha
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}

// Generate Mars (Iron-rich cratered red surface with dual polar ice caps)
export const createMarsTexture = () => {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      // Mars details: dusty red deserts, darker volcanic lowlands
      const nVal = noise.fbm2D(nx * 4.0, ny * 4.0 + nz * 4.0, 5, 2.2, 0.5)
      
      const tempFactor = Math.abs(lat) / (Math.PI / 2)

      let r, g, b

      if (tempFactor > 0.88) {
        // Martian Polar Ice Cap (CO2 / Water ice)
        r = 248; g = 250; b = 255
      } else {
        // Standard volcanic rust sands
        r = Math.floor(155 + nVal * 60)
        g = Math.floor(65 + nVal * 45)
        b = Math.floor(35 + nVal * 30)
      }

      const idx = (y * width + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}

// Generate Jupiter (Gas bands, turbulent cyclonic waves, and the Great Red Spot)
export const createJupiterTexture = () => {
  const width = 1024
  const height = 512
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  // Jupiter coordinates for the Great Red Spot
  // Located at roughly 22 degrees south latitude (y ~ 62%) and 180 degrees longitude (x ~ 50%)
  const grsLat = -22 * (Math.PI / 180)
  const grsLon = Math.PI // 180 degrees in radians

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      // Jovian banded atmosphere wind shear
      const bandFreq = 16.0
      const bandWave = Math.sin(lat * bandFreq + noise.noise2D(nx * 2.0, ny * 2.0) * 0.4)
      const bandVal = (bandWave + 1.0) / 2.0 // Map [-1, 1] to [0, 1]

      // Subtle localized turbulence
      const turbulence = noise.fbm2D(nx * 8.0, ny * 8.0 + nz * 8.0, 4)

      // Blending colors based on band value and turbulence
      let r = Math.floor(180 + bandVal * 45 - turbulence * 30)
      let g = Math.floor(145 + bandVal * 20 - turbulence * 25)
      let b = Math.floor(110 + bandVal * 20 - turbulence * 20)

      // --- Draw the Great Red Spot (GRS) storm swirl ---
      const dx = lon - grsLon
      const dy = lat - grsLat
      
      // Calculate normalized ellipsoidal distance from storm center
      const rx = dx / 0.18 // Longitude radius
      const ry = dy / 0.11 // Latitude radius
      const distSq = rx * rx + ry * ry

      if (distSq < 1.0) {
        const factor = Math.sqrt(distSq) // 0 at center, 1 at boundary
        
        // Intense copper-red center, blending outward with swirling brown/cream
        const grsR = Math.floor(185 - factor * 40)
        const grsG = Math.floor(65 + factor * 60)
        const grsB = Math.floor(45 + factor * 60)

        // Interpolate GRS color with background band color
        const blendFactor = Math.pow(1.0 - factor, 0.8) // Strong central storm shape
        r = Math.floor(r * (1.0 - blendFactor) + grsR * blendFactor)
        g = Math.floor(g * (1.0 - blendFactor) + grsG * blendFactor)
        b = Math.floor(b * (1.0 - blendFactor) + grsB * blendFactor)
      }

      const idx = (y * width + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}

// Generate Saturn (Muted beige/gold gas giant stripes)
export const createSaturnTexture = () => {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      const bandVal = (Math.sin(lat * 12.0) + 1.0) / 2.0
      const nVal = noise.fbm2D(nx * 5.0, ny * 5.0 + nz * 5.0, 3)

      // Gold / Beige / Light tan colors
      const r = Math.floor(215 + bandVal * 25 + nVal * 15)
      const g = Math.floor(190 + bandVal * 25 + nVal * 10)
      const b = Math.floor(140 + bandVal * 30 + nVal * 10)

      const idx = (y * width + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}

// Generate Saturn's photorealistic concentric ring texture
export const createSaturnRingsTexture = () => {
  const width = 512
  const height = 512
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const cx = width / 2
  const cy = height / 2

  // Draw smooth black background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  // Maximum outer ring radius
  const maxRadius = width / 2 - 4

  // Draw thousands of ultra-fine concentric circles representing Saturn's dust bands
  for (let r = 50; r < maxRadius; r++) {
    const norm = r / maxRadius

    // Saturn ring profile curves (A Ring, B Ring, Cassini Division, C Ring)
    let opacity = 0

    if (norm > 0.45 && norm < 0.65) {
      // Inner B Ring (Very dense and bright)
      opacity = 0.85 - Math.sin(norm * 120.0) * 0.12
    } else if (norm >= 0.65 && norm <= 0.70) {
      // Cassini Division (Empty gap)
      opacity = 0.04
    } else if (norm > 0.70 && norm < 0.94) {
      // Outer A Ring (Medium density)
      opacity = 0.6 - Math.sin(norm * 80.0) * 0.08
    } else if (norm > 0.3 && norm <= 0.45) {
      // Semi-transparent C Ring (Crepe ring)
      opacity = 0.2 + Math.cos(norm * 50.0) * 0.05
    }

    // Add subtle fine-dust noise variations
    const fineNoise = Math.sin(r * 2.5) * 0.06
    opacity = Math.max(0, Math.min(1.0, opacity + fineNoise))

    // Draw the dust circular track
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    
    // Warm pale-gold dust color
    ctx.strokeStyle = `rgba(225, 205, 160, ${opacity})`
    ctx.lineWidth = 1.2
    ctx.stroke()
  }

  return finalizeCanvasTexture(canvas)
}

// Generate Uranus (Soft pastel pale-cyan/mint gas layers)
export const createUranusTexture = () => {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      const bandVal = (Math.sin(lat * 4.0) + 1.0) / 2.0
      const nVal = noise.fbm2D(nx * 3.0, ny * 3.0 + nz * 3.0, 2)

      // Pale Cyan / Muted Aquamarine
      const r = Math.floor(155 + bandVal * 15 + nVal * 10)
      const g = Math.floor(205 + bandVal * 10 + nVal * 10)
      const b = Math.floor(215 + bandVal * 10 + nVal * 10)

      const idx = (y * width + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}

// Generate Neptune (Deep vibrant royal blue with thin dark bands and cyan storm swirls)
export const createNeptuneTexture = () => {
  const width = 512
  const height = 256
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const imgData = ctx.createImageData(width, height)
  const data = imgData.data

  for (let y = 0; y < height; y++) {
    const lat = (y / height) * Math.PI - Math.PI / 2
    const cosLat = Math.cos(lat)

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * Math.PI * 2
      const nx = Math.cos(lon) * cosLat
      const ny = Math.sin(lon) * cosLat
      const nz = Math.sin(lat)

      const bandVal = (Math.sin(lat * 8.0) + 1.0) / 2.0
      const nVal = noise.fbm2D(nx * 5.0, ny * 5.0 + nz * 5.0, 4)

      // Deep, rich vibrant royal blues
      const r = Math.floor(35 + bandVal * 15 + nVal * 10)
      const g = Math.floor(75 + bandVal * 30 + nVal * 15)
      const b = Math.floor(205 + bandVal * 40 + nVal * 10)

      const idx = (y * width + x) * 4
      data[idx] = r
      data[idx + 1] = g
      data[idx + 2] = b
      data[idx + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return finalizeCanvasTexture(canvas)
}
