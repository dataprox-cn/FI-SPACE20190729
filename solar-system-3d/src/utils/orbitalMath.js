
export const solveKepler = (M, e, tolerance = 1e-6) => {
  let E = M
  for (let i = 0; i < 10; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
    E -= dE
    if (Math.abs(dE) < tolerance) break
  }
  return E
}

export const getAsteroidPosition = (orbit, time) => {
  // orbit: { e, q, i, om, w, ma, epoch }
  // time: days since J2000 (or relative)
  
  const { e, q, i, om, w, ma, epoch } = orbit
  
  const a = q / (1 - e)
  const mu = 0.0002959122
  const n = Math.sqrt(mu / Math.pow(a, 3))
  
  const dt = time - (epoch - 59000.0) // Assuming uTime is 0 at start? 
  // In shader: M = ma + n * uTime. 
  // Shader ignores epoch diff if we assume uTime starts at data epoch.
  // For simplicity, match shader:
  const M = ma + n * time
  
  const E = solveKepler(M, e)
  
  const P = a * (Math.cos(E) - e)
  const Q = a * Math.sqrt(1 - e * e) * Math.sin(E)
  
  // Rotate
  // P, Q, 0
  let x = P
  let y = Q
  let z = 0
  
  // Rotate Z (w)
  let tx = x * Math.cos(w) - y * Math.sin(w)
  let ty = x * Math.sin(w) + y * Math.cos(w)
  x = tx; y = ty;
  
  // Rotate X (i)
  let ty2 = y * Math.cos(i) - z * Math.sin(i)
  let tz2 = y * Math.sin(i) + z * Math.cos(i)
  y = ty2; z = tz2;
  
  // Rotate Z (om)
  let tx3 = x * Math.cos(om) - y * Math.sin(om)
  let ty3 = x * Math.sin(om) + y * Math.cos(om)
  x = tx3; y = ty3;
  
  return { x, y, z }
}

