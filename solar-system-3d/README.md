# 3D Solar System Explorer

An interactive 3D visualization of the solar system, built with React Three Fiber. This project renders **18,000 curated asteroids and comets** in real-time using GPU-accelerated instancing and Keplerian physics, featuring accurate NASA data and a comprehensive search and filtering system.

![Version](https://img.shields.io/badge/version-2.0-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Three.js](https://img.shields.io/badge/Three.js-r169-049ef4)

## 🚀 Features

### Core Simulation
- **Real-time Orbit Propagation**: Solves Kepler's Equation on the GPU (Vertex Shader) to animate 18,000 objects at 60fps
- **Massive Scale**: Renders 18,000+ individual asteroids using `InstancedMesh` with a single draw call
- **Accurate NASA Data**: Uses real orbital elements and diameters from NASA JPL Small-Body Database
- **All 8 Planets**: Includes Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune with accurate physical parameters

### Visuals
- **Glow Effects**: Custom sprite-based glow textures with additive blending for a cinematic look
- **12 Asteroid Classes**: Color-coded by orbital classification:
  - Cyan/Teal: Main Belt Asteroids (MBA, IMB, OMB)
  - Red/Pink: Mars-Crossers (MCA), Jupiter Trojans (TJN), Greeks (GRK)
  - Yellow-Green: Near-Earth Objects (APO, ATE, AMO, IEO)
  - Teal-Green: Trans-Neptunian Objects (TNO), Centaurs (CEN)
  - Beige: Jupiter Family Comets (JFc)
- **Size Scaling**: Objects rendered proportional to real diameter on logarithmic scale
- **Background Music**: Ambient space soundtrack with volume control

### User Interface (HUD)
- **Glassmorphism Design**: Modern, transparent UI cards with backdrop blur
- **Interactive Selection**: Click any asteroid, comet, or planet to view detailed info
  - Name, Diameter, Orbital Period, Distance, Classification
  - Direct NASA link (Small-Body Database for asteroids, NASA Science pages for planets)
- **Smart Search**: Search by name, ID, or class
  - Type planet names (e.g., "Earth", "Saturn")
  - Search asteroids by SPK-ID (e.g., "1" for Ceres)
  - Filter by class (e.g., "APO", "TNO")
- **Interactive Filtering**: Toggle visibility of 12 asteroid classes
  - Click legend entries to show/hide entire classes in real-time
  - GPU-accelerated filtering with shader discard
- **Time Controls**: Pause, play, and speed up time (1x, 10x, 50x, 100x)
- **Performance Stats**: Live FPS counter and object count
- **Quality Toggle**: Switch between high/low quality rendering
- **System Overview**: Carousel of fascinating facts about the solar system

## 🛠 Tech Stack

- **Frontend**: React 18.3, Vite 6.0
- **3D Engine**: Three.js r169, React Three Fiber 8.17
- **UI Components**: Custom React components with glassmorphism design
- **Performance Optimization**: 
  - `InstancedMesh` for single-draw-call rendering of 18,000 objects
  - Custom GLSL Shaders for GPU-accelerated orbital calculations
  - Binary data format (`.bin`) for fast loading of large datasets
  - Shader-based filtering with fragment discard for real-time visibility toggling
- **Data Pipeline**: Python 3.7+ with pandas, numpy for processing NASA data
- **Data Sources**:
  - NASA JPL Small-Body Database (SBDB)
  - NASA HORIZONS System
  - NASA Planetary Physical Parameters

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

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Python 3.7+ (for data pipeline)

### Installation

1. **Clone the repository**
   ```bash
   cd solar-system-3d
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   npm run preview  # Preview production build
   ```

## 🎮 Usage

### Navigation
- **Rotate**: Left-click and drag
- **Zoom**: Scroll wheel or pinch
- **Pan**: Right-click and drag (or Ctrl+left-click drag)

### Search
- Type planet names: `Mercury`, `Venus`, `Earth`, `Mars`, `Jupiter`, `Saturn`, `Uranus`, `Neptune`
- Search asteroids by name: `Ceres`, `Vesta`, `Bennu`
- Search by SPK-ID: `1` (Ceres), `433` (Eros), `99942` (Apophis)
- Filter by class: `MBA`, `APO`, `TNO`, etc.

### Filtering
- Click any class in the **Legend & Filters** panel (bottom-right)
- Toggle visibility on/off for:
  - Main Belt (MBA, IMB, OMB)
  - Mars-Crossers (MCA) - the bright red ones!
  - Near-Earth Objects (APO, ATE, AMO)
  - Jupiter Trojans (TJN) and Greeks (GRK) - pink/red
  - Trans-Neptunian Objects (TNO)
  - Centaurs (CEN)
  - Jupiter Family Comets (JFc)

### Time Controls
- **Play/Pause**: Toggle animation
- **Speed**: 1x, 10x, 50x, 100x (bottom-left)
- Watch orbits evolve over simulated time!

### Object Details
- **Click any object** to see its information panel
- View NASA data directly:
  - **Planets**: Links to NASA Solar System Exploration pages
  - **Asteroids/Comets**: Links to JPL Small-Body Database

## 🧪 Data Pipeline

### Curated Dataset Generation

The 18,000 object dataset uses a **Tier 1 + Tier 2** selection strategy:

**Tier 1** (10,194 objects): Scientific & Visual Priority
- All asteroids >20 km (2,714)
- All asteroids 10-20 km (7,468)
- All comets >10 km (12)

**Tier 2** (7,806 objects): Diversity & Interest
- Potentially Hazardous Asteroids (PHAs)
- Near-Earth Objects (NEOs)
- Trans-Neptunian Objects & Centaurs
- Largest remaining objects

See [`DATASET_SUMMARY.md`](./DATASET_SUMMARY.md) for full details.

### Generating New Dataset

1. **Generate curated orbital elements**:
   ```bash
   cd scripts
   python generate_curated_dataset.py
   ```
   
2. **Process into binary format**:
   ```bash
   python process_data.py
   ```

3. **Output files** (in `public/data/`):
   - `orbital_elements.csv` - Human-readable data
   - `asteroids.bin` - Optimized binary for GPU
   - `metadata.json` - Names and IDs
   - `orbital_elements_spkids.txt` - List of included objects

## 🏗️ Architecture

### Component Hierarchy

```
App.jsx (State Management)
├── Canvas (Three.js Scene)
│   ├── SolarSystem.jsx (Scene Coordinator)
│   │   ├── Sun (Central marker with glow)
│   │   ├── Planets.jsx (8 major planets)
│   │   ├── AsteroidField.jsx (18,000 instances)
│   │   │   └── Custom GLSL Shaders
│   │   └── InteractionHandler (Raycasting)
│   └── OrbitControls (Camera navigation)
└── HUD.jsx (2D Overlay)
    ├── Statistics.jsx (FPS, Object count)
    ├── SearchBar.jsx (Smart search)
    ├── ObjectDetails.jsx (Selection info + NASA link)
    ├── FilterLegend.jsx (Class visibility toggles)
    ├── TimeControls.jsx (Animation speed)
    ├── SystemInfo.jsx (Facts carousel)
    └── AudioPlayer.jsx (Background music)
```

### Data Flow

1. **Load**: `dataLoader.js` fetches `asteroids.bin` and `metadata.json`
2. **Parse**: Binary data → Float32Array (9 values per object)
3. **Upload**: Data sent to GPU as `InstancedInterleavedBuffer`
4. **Render**: Vertex shader calculates positions using Kepler's equation
5. **Filter**: Fragment shader discards filtered classes based on uniform array
6. **Interact**: CPU-side raycasting for click detection (uses same orbital math)

### Performance Optimizations

- **Single Draw Call**: All 18,000 asteroids rendered with `InstancedMesh`
- **GPU Calculations**: Orbital positions computed in vertex shader (no CPU overhead)
- **Binary Format**: ~650KB file vs several MB of JSON
- **Shader-Based Filtering**: No mesh recreation, just fragment discard
- **LOD**: Glow intensity can be adjusted based on distance (future)

## 📝 Development Progress

- [x] **Phase 1: Data Engine**
  - ✅ Implemented binary data pipeline
  - ✅ Created Keplerian orbital propagator
  - ✅ Curated 18,000 object dataset with Tier 1+2 strategy
  
- [x] **Phase 2: Core Rendering**
  - ✅ Set up React Three Fiber scene
  - ✅ Implemented `AsteroidField` with custom GLSL shaders
  - ✅ GPU-accelerated orbit calculations
  
- [x] **Phase 3: Interaction**
  - ✅ Added optimized raycasting for 18,000 objects
  - ✅ Implemented camera controls (OrbitControls)
  - ✅ Click-to-select for asteroids and planets
  
- [x] **Phase 4: Visual Polish**
  - ✅ Added glow effects with custom sprite textures
  - ✅ Implemented 12-class color palette mapping
  - ✅ Added all 8 planets with labels
  - ✅ Logarithmic size scaling
  
- [x] **Phase 5: UI/UX**
  - ✅ Built glassmorphic HUD
  - ✅ Smart search (planets, asteroids, classes)
  - ✅ Interactive filtering with real-time GPU updates
  - ✅ NASA data links (SBDB for asteroids, Science pages for planets)
  - ✅ Time controls and statistics
  - ✅ Background audio with controls
  - ✅ Mobile-responsive quality adjustment

## 🌟 Notable Objects to Search

### Dwarf Planets
- `134340` or `Pluto` - 2,361 km - Largest TNO
- `1` or `Ceres` - 939.4 km - Largest asteroid

### Mission Targets
- `101955` or `Bennu` - OSIRIS-REx sample return
- `162173` or `Ryugu` - Hayabusa2 sample return  
- `433` or `Eros` - NEAR Shoemaker landing
- `25143` or `Itokawa` - Hayabusa mission

### Potentially Hazardous
- `99942` or `Apophis` - Close approach in 2029
- `65803` or `Didymos` - DART impact test target

### Largest Asteroids
- `2` or `Pallas` - 545 km
- `4` or `Vesta` - 525.4 km (brightest asteroid)
- `10` or `Hygiea` - 407 km

## 🎨 Color Legend

| Color | Classes | Description |
|-------|---------|-------------|
| 🩵 Cyan | MBA | Main Belt Asteroids |
| 🟠 Orange | IMB | Inner Main Belt |
| 🟡 Yellow | OMB | Outer Main Belt |
| 🔴 Red | MCA | Mars-Crossers |
| 🌸 Pink | TJN | Jupiter Trojans |
| 💗 Pink-Red | GRK | Greeks (Jupiter L4) |
| 🟢 Yellow-Green | APO, ATE, AMO | Near-Earth Objects |
| 💚 Teal | TNO | Trans-Neptunian Objects |
| 🟤 Khaki | CEN | Centaurs |
| 🤍 Beige | JFc | Jupiter Family Comets |

## 🐛 Troubleshooting

### Performance Issues
- Toggle to **Low Quality** mode (bottom-left button)
- Close other browser tabs
- Update graphics drivers
- Use Chrome/Edge (better WebGL performance than Firefox)

### Objects Not Visible
- Check the **Legend & Filters** panel - you may have hidden that class
- Click the class name to toggle visibility back on

### Search Not Working
- Ensure you're typing the exact name or ID
- Planet names work: `earth`, `mars`, `jupiter`, etc.
- For asteroids, use SPK-ID numbers: `1`, `433`, `99942`
- Class filters: `MBA`, `APO`, `TNO` (must be exact match)

### Blank Screen / Loading Forever
- Check browser console for errors (F12)
- Ensure `public/data/asteroids.bin` exists (~650KB)
- Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## 📚 References & Data Sources

- [NASA JPL Small-Body Database](https://ssd.jpl.nasa.gov/sbdb.cgi) - Asteroid and comet data
- [NASA HORIZONS System](https://ssd.jpl.nasa.gov/horizons.cgi) - Ephemerides and orbital elements
- [NASA Planetary Fact Sheets](https://nssdc.gsfc.nasa.gov/planetary/factsheet/) - Planet physical parameters
- Original 2D map by [Eleanor Lutz](https://github.com/eleanorlutz/asteroids_atlas_of_space) - Design inspiration

## 📄 License

**Code:** GPL-3.0 License

**Data:** Belongs to NASA JPL and is in the public domain

**This Project:** Educational and non-commercial use

## 🙏 Credits

- **Original Map Design**: [Eleanor Lutz](https://tabletopwhale.com/) - 2D asteroid map
- **Data**: NASA Jet Propulsion Laboratory
- **3D Visualization**: Built with React Three Fiber
- **Music**: Galactic Drift (ambient space soundtrack)

---

**Made with ❤️ for space exploration enthusiasts**

For questions or issues, please open an issue on GitHub.





