# 3D Solar System Explorer

An interactive 3D visualization of the solar system, built with React Three Fiber. This project renders over 18,000 asteroids and comets in real-time using GPU-accelerated instancing and Keplerian physics.

## 🚀 Features

### Core Simulation
- **Real-time Orbit Propagation**: Solves Kepler's Equation on the GPU (Vertex Shader) to animate thousands of objects at 60fps.
- **Massive Scale**: Renders 18,000+ individual asteroids using `InstancedMesh`.
- **Accurate Data**: Uses orbital elements (eccentricity, semi-major axis, inclination, etc.) to calculate precise positions.

### Visuals
- **Glow Effects**: Custom sprite-based glow textures with additive blending for a cinematic look.
- **Color Coding**: Asteroids are colored by their spectral class (Main Belt = Teal, NEOs = Green, etc.), matching the original 2D map's palette.
- **Planets**: Includes all 8 major planets with labels and orbital paths.

### User Interface (HUD)
- **Glassmorphism Design**: Modern, transparent UI cards.
- **Interactive Selection**: Click any object to view detailed info (Name, Diameter, Class, Orbit Period).
- **Time Controls**: Pause, play, and speed up time (up to 100x).
- **Filtering**: Toggle visibility of different asteroid classes.
- **Search**: "Fly to" functionality (placeholder) for finding specific objects.
- **Statistics**: Live counter of objects and FPS performance.

## 🛠 Tech Stack

- **Frontend**: React, Vite
- **3D Engine**: Three.js, React Three Fiber (@react-three/fiber)
- **Performance**: 
  - `InstancedMesh` for single-draw-call rendering.
  - Custom GLSL Shaders for position calculation.
  - Binary data format (`.bin`) for fast loading of 2MB+ datasets.
- **Data Pipeline**: Python scripts (`scripts/`) to fetch and process NASA JPL data.

## 📂 Project Structure

```
solar-system-3d/
├── public/
│   └── data/
│       ├── asteroids.bin       # Optimized binary orbit data
│       └── metadata.json       # Names and IDs
├── scripts/
│   ├── fetch_data.py          # Fetches raw data from NASA SBDB
│   └── process_data.py        # Converts CSV to binary format
├── src/
│   ├── components/
│   │   ├── SolarSystem.jsx    # Main 3D scene coordinator
│   │   ├── AsteroidField.jsx  # GPU InstancedMesh & Shaders
│   │   ├── Planets.jsx        # Major planets visualization
│   │   ├── HUD.jsx            # 2D UI Overlay manager
│   │   └── ui/                # Individual UI cards (Stats, Details, etc.)
│   ├── utils/
│   │   ├── orbitalMath.js     # JS-side physics for raycasting
│   │   └── dataLoader.js      # Binary file parser
│   └── App.jsx
└── vite.config.js
```

## 🔧 Setup & Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🧪 Data Pipeline

To update the asteroid data:

1. Run the fetch script (generates mock data if NASA API fails):
   ```bash
   python scripts/fetch_data.py
   ```
2. Process into binary format:
   ```bash
   python scripts/process_data.py
   ```

## 📝 Development Progress

- [x] **Phase 1: Data Engine**
  - Implemented binary data pipeline.
  - Created Keplerian orbital propagator.
- [x] **Phase 2: Core Rendering**
  - Set up React Three Fiber scene.
  - Implemented `AsteroidField` with custom shaders.
- [x] **Phase 3: Interaction**
  - Added Raycasting for selecting small dots.
  - Implemented Camera controls (OrbitControls).
- [x] **Phase 4: Visual Polish**
  - Added Glow/Bloom effects.
  - Implemented Color Palette mapping.
  - Added Planets and Labels.
- [x] **Phase 5: UI/UX**
  - Built Glassmorphic HUD.
  - Added Stats, Details, and Time controls.


