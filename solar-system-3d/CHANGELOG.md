# Changelog

All notable changes to the 3D Solar System Explorer project.

## [2.0.0] - 2025-12-24

### 🎉 Major Features Added

#### Interactive Filtering System
- **12 Asteroid Classes** - Added comprehensive filtering for all orbital classifications
- **Real-time Toggle** - Click legend entries to show/hide classes instantly
- **GPU-Accelerated** - Filtering done via shader fragment discard (no mesh recreation)
- **Visual Feedback** - Filtered classes appear dimmed in legend

Classes now filterable:
- Main Belt: MBA, IMB, OMB
- Mars-Crossers: MCA (the red ones!)
- Jupiter Region: TJN (Trojans), GRK (Greeks)
- Near-Earth Objects: APO, ATE, AMO, IEO
- Outer System: TNO, CEN
- Comets: JFc

#### Smart Search System
- **Planet Search** - Type "Earth", "Saturn", etc. to find and focus on planets
- **Asteroid Search** - Search by SPK-ID (e.g., "1" for Ceres)
- **Class Search** - Filter by class abbreviation (MBA, APO, TNO, etc.)
- **Details Panel** - Clicking search results now shows full object details

#### NASA Data Integration
- **Fixed Planet Links** - Planets now correctly link to NASA Solar System Exploration pages
- **Asteroid/Comet Links** - Correctly link to JPL Small-Body Database
- **Dynamic URL Generation** - Links constructed based on object type (planet vs asteroid)
- **All 8 Planets Searchable** - Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune

#### 18,000 Curated Dataset
- **Tier 1 Selection** (10,194 objects)
  - All large asteroids >20 km (2,714)
  - All medium asteroids 10-20 km (7,468)
  - All large comets >10 km (12)
- **Tier 2 Selection** (7,806 objects)
  - Potentially Hazardous Asteroids (1,973)
  - Near-Earth Objects (5,000)
  - Trans-Neptunian Objects & Centaurs (833)
- **Real NASA Data** - Accurate diameters and orbital parameters

### 🐛 Bug Fixes

#### Diameter Data Issues
- **Fixed** - Replaced mock 1km default diameters with real NASA data
- **Source** - Used `all_asteroids_wrangled.csv` from NASA JPL SBDB
- **Verification** - Ceres now correctly shows 939.4 km (was showing 1 km)

#### Planet Search & Details
- **Fixed** - Planets now show details panel when searched
- **Fixed** - Planet clicks now properly trigger selection
- **Fixed** - Consistent planet data structure across components

#### NASA Link Redirects
- **Fixed** - Planets redirecting to wrong asteroid pages
- **Root Cause** - Race condition in SolarSystem.jsx useEffect
- **Solution** - Removed `time` from dependencies, added type-based URL generation
- **Result** - All planets and asteroids now link correctly

#### Filter Toggle Not Working
- **Fixed** - Legend clicks had no effect on visibility
- **Root Cause** - Filter state not connected to rendering pipeline
- **Solution** - Lifted state to App.jsx, passed to shader via uniforms
- **Result** - Real-time GPU-accelerated filtering now works

### 📝 Documentation

#### New Files
- **README.md** - Comprehensive guide with features, usage, and architecture
- **DATASET_SUMMARY.md** - Detailed breakdown of 18,000 object dataset
- **CHANGELOG.md** - This file!

#### Updated Files
- **Root README.md** - Added link to 3D visualization
- **Removed** - NASA_LINK_FIX.md (issue resolved)
- **Removed** - PLANET_SEARCH_FIX.md (issue resolved)

### 🎨 UI/UX Improvements

- **Legend Expansion** - Added 6 new classes to legend (was 6, now 12)
- **Color Consistency** - All 12 classes now have defined colors
- **Class Names** - Improved descriptions (e.g., "Mars-Crosser" not just "MCA")
- **Favicon** - Added custom solar system SVG icon

### 🏗️ Technical Improvements

#### Performance
- **Shader-Based Filtering** - No CPU overhead for toggling visibility
- **State Management** - Lifted filter state to prevent prop drilling
- **Render Optimization** - Removed unnecessary useEffect dependencies

#### Code Quality
- **Type Consistency** - All objects now have explicit `type` field
- **Defensive Coding** - Added checks for undefined IDs before URL construction
- **Console Logging** - Added debug logs for troubleshooting (removed in production)

## [1.0.0] - 2025-12-23 (Initial Release)

### Initial Features
- Real-time 3D rendering of solar system
- GPU-accelerated orbital calculations
- InstancedMesh rendering for 18,000 objects
- Custom GLSL shaders for Kepler's equation
- Basic planet rendering
- Glassmorphic UI design
- Time controls and statistics
- Background audio
- Object selection and details panel

---

## Future Roadmap

### Planned Features
- [ ] Orbit path visualization for selected objects
- [ ] Distance measurement tool
- [ ] Date/time picker for historical positions
- [ ] Export screenshot/video
- [ ] VR/AR support
- [ ] Asteroid search autocomplete
- [ ] Favorite objects bookmarking
- [ ] Guided tours (e.g., "PHAs", "Largest TNOs")

### Performance Enhancements
- [ ] LOD system for distant objects
- [ ] Frustum culling optimization
- [ ] WebWorker for data processing
- [ ] Progressive loading for large datasets

### Data Improvements
- [ ] Real ephemerides from NASA HORIZONS API
- [ ] Historical orbital positions
- [ ] Comet tail rendering based on solar distance
- [ ] Asteroid composition data (if available)

---

**Version Format:** [Major].[Minor].[Patch]
- **Major** - Breaking changes or major feature additions
- **Minor** - New features, backward compatible
- **Patch** - Bug fixes and minor improvements

