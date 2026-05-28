import * as THREE from 'three'

/**
 * Procedurally draws a beautifully flared four-pointed sparkling cross-star on a canvas.
 * Uses smooth quadratic curves to create realistic tapered star spikes.
 * 
 * @returns {THREE.CanvasTexture} A texture containing the glowing cross-star
 */
export const createSparklingStarTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  // Clear canvas to fully transparent
  ctx.clearRect(0, 0, 64, 64)

  // 1. Draw soft radial glow at the center
  const centerGrad = ctx.createRadialGradient(32, 32, 0, 32, 32, 12)
  centerGrad.addColorStop(0, 'rgba(255, 255, 255, 1)')
  centerGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)')
  centerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = centerGrad
  ctx.fillRect(0, 0, 64, 64)

  // 2. Draw sharp, curved 4-pointed star spikes
  // We use quadratic curves to achieve the beautiful curved taper toward the center
  ctx.beginPath()
  ctx.moveTo(32, 2)            // Top tip
  ctx.quadraticCurveTo(32, 32, 62, 32)  // Top to Right
  ctx.quadraticCurveTo(32, 32, 32, 62)  // Right to Bottom
  ctx.quadraticCurveTo(32, 32, 2, 32)   // Bottom to Left
  ctx.quadraticCurveTo(32, 32, 32, 2)   // Left to Top
  ctx.closePath()

  // Saturated white center with slight yellow outer core for warmth
  const fillGrad = ctx.createRadialGradient(32, 32, 2, 32, 32, 28)
  fillGrad.addColorStop(0, 'rgba(255, 255, 255, 1)')
  fillGrad.addColorStop(0.2, 'rgba(255, 255, 240, 0.95)')
  fillGrad.addColorStop(0.7, 'rgba(255, 235, 180, 0.25)')
  fillGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
  
  ctx.fillStyle = fillGrad
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  
  return texture
}

/**
 * Procedurally draws a soft, high-contrast round star with standard radial glow.
 * 
 * @returns {THREE.CanvasTexture} A texture containing the glowing circular star
 */
export const createRoundStarTexture = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, 32, 32)

  const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 14)
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)')
  grad.addColorStop(0.7, 'rgba(255, 235, 210, 0.2)')
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 32, 32)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true

  return texture
}
