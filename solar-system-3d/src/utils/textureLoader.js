import * as THREE from 'three'

const loader = new THREE.TextureLoader()

// Cache to avoid loading the same texture twice
const textureCache = {}

const loadTexture = (path) => {
  if (textureCache[path]) return textureCache[path]
  
  const texture = loader.load(path)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  
  textureCache[path] = texture
  return texture
}

// All textures served from /textures/ (public dir)
// Source: Solar System Scope (CC-BY 4.0) — https://www.solarsystemscope.com/textures/
export const loadPlanetTextures = () => ({
  Sun:          loadTexture('/textures/2k_sun.jpg'),
  Mercury:      loadTexture('/textures/2k_mercury.jpg'),
  Venus:        loadTexture('/textures/2k_venus_atmosphere.jpg'),
  Earth:        loadTexture('/textures/2k_earth_daymap.jpg'),
  EarthNight:   loadTexture('/textures/2k_earth_nightmap.jpg'),
  EarthClouds:  loadTexture('/textures/2k_earth_clouds.jpg'),
  EarthNormal:  loadTexture('/textures/earth_normal_2048.jpg'),
  EarthSpecular:loadTexture('/textures/earth_specular_2048.jpg'),
  Mars:         loadTexture('/textures/2k_mars.jpg'),
  Jupiter:      loadTexture('/textures/2k_jupiter.jpg'),
  Saturn:       loadTexture('/textures/2k_saturn.jpg'),
  SaturnRings:  loadTexture('/textures/2k_saturn_ring_alpha.png'),
  Uranus:       loadTexture('/textures/2k_uranus.jpg'),
  Neptune:      loadTexture('/textures/2k_neptune.jpg'),
  Stars:        loadTexture('/textures/2k_stars_milky_way.jpg'),
})
