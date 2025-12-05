import * as THREE from 'three'

export const loadAsteroidData = async () => {
  try {
    const [binResponse, metaResponse] = await Promise.all([
      fetch('/data/asteroids.bin'),
      fetch('/data/metadata.json')
    ])

    if (!binResponse.ok) {
      throw new Error(`Failed to load asteroids.bin: ${binResponse.status}`)
    }
    if (!metaResponse.ok) {
      throw new Error(`Failed to load metadata.json: ${metaResponse.status}`)
    }

    const buffer = await binResponse.arrayBuffer()
    const meta = await metaResponse.json()

    const float32Data = new Float32Array(buffer)
    const numAsteroids = float32Data.length / 9
    
    // Verify data integrity
    if (float32Data.length % 9 !== 0) {
      console.error("Binary data size mismatch")
      throw new Error("Binary data size mismatch")
    }

    console.log(`Loaded ${numAsteroids} asteroids`)

    return {
      data: float32Data,
      count: numAsteroids,
      meta: meta
    }
  } catch (error) {
    console.error('Error loading asteroid data:', error)
    throw error
  }
}

