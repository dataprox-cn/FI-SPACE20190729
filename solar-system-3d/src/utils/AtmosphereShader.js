/**
 * Custom GLSL Vertex and Fragment shaders for rendering realistic, high-fidelity
 * planetary atmospheres using Rayleigh scattering approximation and a Fresnel rim effect.
 */
export const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      // Normal vector in view/camera coordinates
      vNormal = normalize(normalMatrix * normal);
      
      // Position vector in view/camera space
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    uniform vec3 color;
    uniform float coefficient;
    uniform float power;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel effect: dot product is 1 in the center (facing camera) and 0 at the edge profile.
      // High exponent curves the falloff so the atmosphere thins out at the edges organically.
      float intensity = pow(coefficient - dot(normal, viewDir), power);
      
      // Output color with additive blend-friendly transparency
      gl_FragColor = vec4(color, 1.0) * intensity;
    }
  `
}
