import * as THREE from 'three'

/**
 * Dynamically generates a high-quality tangent-space normal map from a diffuse/albedo texture
 * using a Sobel filter. Built-in horizontal wrap-around ensures zero seams on spherical mappings.
 * 
 * @param {THREE.Texture} diffuseTexture The preloaded albedo texture
 * @param {number} strength Intensity factor of the normal vectors (default 2.0)
 * @returns {THREE.CanvasTexture} A standard WebGL-compatible normal map texture
 */
export const generateNormalMapFromTexture = (diffuseTexture, strength = 2.0) => {
  const image = diffuseTexture.image
  if (!image) {
    console.warn('Cannot generate normal map: image is not loaded yet')
    return null
  }

  const width = image.width || image.videoWidth || 1024
  const height = image.height || image.videoHeight || 512

  // Create temporary offscreen canvases
  const inputCanvas = document.createElement('canvas')
  inputCanvas.width = width
  inputCanvas.height = height
  const inputCtx = inputCanvas.getContext('2d')
  inputCtx.drawImage(image, 0, 0, width, height)

  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = width
  outputCanvas.height = height
  const outputCtx = outputCanvas.getContext('2d')

  const inputData = inputCtx.getImageData(0, 0, width, height)
  const outputData = outputCtx.createImageData(width, height)
  
  const src = inputData.data
  const dst = outputData.data

  // Calculate pixel luminance helper
  const getLuminance = (x, y) => {
    // Seamless horizontal wrap-around for planetary cylindrical textures
    const wrappedX = (x + width) % width
    // Clamp Y to prevent reading out of bounds vertically
    const clampedY = Math.max(0, Math.min(height - 1, y))
    const idx = (clampedY * width + wrappedX) * 4
    return (0.299 * src[idx] + 0.587 * src[idx + 1] + 0.114 * src[idx + 2]) / 255.0
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Sobel Kernels:
      // dx = [ -1 0 1 ]   dy = [ -1 -2 -1 ]
      //      [ -2 0 2 ]        [  0  0  0 ]
      //      [ -1 0 1 ]        [  1  2  1 ]
      
      const tl = getLuminance(x - 1, y - 1)
      const t  = getLuminance(x,     y - 1)
      const tr = getLuminance(x + 1, y - 1)
      
      const l  = getLuminance(x - 1, y)
      const r  = getLuminance(x + 1, y)
      
      const bl = getLuminance(x - 1, y + 1)
      const b  = getLuminance(x,     y + 1)
      const br = getLuminance(x + 1, y + 1)

      const dx = (tr + 2.0 * r + br) - (tl + 2.0 * l + bl)
      const dy = (bl + 2.0 * b + br) - (tl + 2.0 * t + tr)

      // Calculate tangent space normal vector (nx, ny, nz)
      let nx = -dx * strength
      let ny = -dy * strength
      let nz = 1.0

      // Normalize the vector
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz)
      nx /= length
      ny /= length
      nz /= length

      // Map normal vector [-1.0, 1.0] to standard RGB color space [0, 255]
      const idx = (y * width + x) * 4
      dst[idx]     = Math.floor((nx + 1.0) * 127.5) // Red = X
      dst[idx + 1] = Math.floor((ny + 1.0) * 127.5) // Green = Y
      dst[idx + 2] = Math.floor((nz + 1.0) * 127.5) // Blue = Z
      dst[idx + 3] = 255 // Alpha
    }
  }

  outputCtx.putImageData(outputData, 0, 0)

  // Create CanvasTexture and mirror standard wrap behaviors
  const normalTexture = new THREE.CanvasTexture(outputCanvas)
  normalTexture.wrapS = THREE.RepeatWrapping
  normalTexture.wrapT = THREE.ClampToEdgeWrapping
  normalTexture.minFilter = THREE.LinearMipmapLinearFilter
  normalTexture.magFilter = THREE.LinearFilter
  normalTexture.generateMipmaps = true

  return normalTexture
}
