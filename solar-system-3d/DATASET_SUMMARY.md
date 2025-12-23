# 18,000 Object Curated Dataset Summary

## Generation Date
December 24, 2025

## Dataset Composition

### Tier 1: Scientific & Visual Priority (10,194 objects)
- **2,714** Large asteroids (>20 km diameter)
- **7,468** Medium asteroids (10-20 km diameter)
- **12** Large comets (>10 km diameter)

### Tier 2: Diversity & Interest (7,806 objects)
- **1,973** Potentially Hazardous Asteroids (PHAs)
- **5,000** Near Earth Objects (NEOs)
- **833** Trans-Neptunian Objects and Centaurs

**TOTAL: 18,000 objects**

## Distribution by Class

| Class | Count | Percentage | Description |
|-------|-------|------------|-------------|
| MBA   | 6,925 | 38.5% | Main Belt Asteroids |
| APO   | 4,007 | 22.3% | Apollo (Earth-crossing) |
| AMO   | 2,407 | 13.4% | Amor (Mars-crossing) |
| OMB   | 1,381 | 7.7% | Outer Main Belt |
| TJN   | 1,364 | 7.6% | Trojan (Jupiter) |
| GRK   | 1,018 | 5.7% | Greek (Jupiter L4) |
| ATE   | 551 | 3.1% | Aten (Earth orbit) |
| TNO   | 237 | 1.3% | Trans-Neptunian |
| CEN   | 70 | 0.4% | Centaur |
| IEO   | 12 | 0.1% | Inner Earth Orbit |

## Top 10 Largest Objects

1. **Pluto (134340)** - 2,361.00 km - TNO/Dwarf Planet
2. **Ceres (1)** - 939.40 km - MBA/Dwarf Planet
3. **Varuna (20000)** - 900.00 km - TNO
4. **2014 UZ224** - 635.00 km - TNO
5. **2002 XV93** - 549.20 km - TNO
6. **Pallas (2)** - 545.00 km - MBA
7. **Vesta (4)** - 525.40 km - MBA
8. **2001 KA77** - 472.00 km - TNO
9. **Hygiea (10)** - 407.12 km - MBA
10. **2003 QX111** - 358.50 km - TNO

## Famous Asteroids Included

### Historical & Scientific Importance
- ✓ **Ceres** - 939.4 km - First asteroid discovered (1801)
- ✓ **Vesta** - 525.4 km - Brightest asteroid visible from Earth
- ✓ **Pallas** - 545 km - Second asteroid discovered

### Mission Targets
- ✓ **Bennu (101955)** - 0.492 km - OSIRIS-REx mission target
- ✓ **Ryugu (162173)** - 1.0 km - Hayabusa2 mission target
- ✓ **Eros (433)** - 16.84 km - NEAR Shoemaker landing site
- ✓ **Itokawa (25143)** - 0.33 km - Hayabusa mission target

### Potentially Hazardous
- ✓ **Apophis (99942)** - 0.325 km - Close approach in 2029
- ✓ **Didymos (65803)** - 0.78 km - DART mission target

### Dwarf Planets
- ✓ **Pluto (134340)** - 2,361 km - Former 9th planet
- ✓ **Ceres (1)** - 939.4 km - Largest asteroid belt object

## File Information

### Generated Files
1. **orbital_elements.csv** - 18,000 rows × 11 columns
   - Fields: spkid, full_name, diameter, class, e, q, i, om, w, ma, epoch
   
2. **asteroids.bin** - Binary format (9 floats × 18,000 objects)
   - Optimized for GPU rendering
   - ~648 KB file size
   
3. **metadata.json** - Object names and IDs
   - Used for search and identification
   
4. **orbital_elements_spkids.txt** - List of all SPK-IDs included

## Planets (Separate Rendering)

All 8 major planets are rendered separately via `Planets.jsx`:
- Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune

These are NOT part of the 18,000 count - they use their own simplified orbital models.

## Performance

- **Target FPS:** 60 FPS on desktop
- **Rendering Method:** GPU Instanced Mesh (single draw call)
- **Orbital Calculations:** GPU shader (Kepler equation solved per-frame)
- **Mobile Optimization:** Automatic quality adjustment

## Data Sources

- **NASA JPL Small-Body Database** (large_asteroids.csv, small_asteroids.csv)
- **NASA All Asteroids Wrangled** (all_asteroids_wrangled.csv)
- **NASA Comets Database** (all_comets_wrangled.csv)

## Visualization Features

### Search & Navigation
- **Planet Search**: Type planet names (e.g., "Earth", "Saturn") to instantly find and focus
- **Asteroid Search**: Search by SPK-ID (e.g., "1" for Ceres, "99942" for Apophis)
- **Class Filtering**: Filter by orbital classification (MBA, APO, TNO, etc.)

### Interactive Filtering System
All 12 asteroid classes can be toggled on/off in real-time:
- **Main Belt**: MBA (cyan), IMB (orange), OMB (yellow)
- **Mars Region**: MCA (red - Mars-Crossers)
- **Jupiter Region**: TJN (pink - Trojans), GRK (red-pink - Greeks)
- **Near-Earth**: APO, ATE, AMO, IEO (yellow-green)
- **Outer System**: TNO (teal), CEN (khaki)
- **Comets**: JFc (beige - Jupiter Family)

### NASA Data Integration
- **Direct Links**: Click any object to view its data on NASA websites
  - Planets → NASA Solar System Exploration pages
  - Asteroids/Comets → JPL Small-Body Database
- **Accurate Parameters**: Real diameters, orbital periods, and distances from NASA sources

### Performance
- **GPU Acceleration**: All orbital calculations done on GPU via custom GLSL shaders
- **Single Draw Call**: 18,000 objects rendered with InstancedMesh
- **60 FPS Target**: Optimized for smooth real-time animation
- **Mobile Support**: Automatic quality adjustment for mobile devices

## Notes

- Orbital elements (e, i, om, w, ma) are approximations based on class distributions
- For production use, query NASA HORIZONS for each SPK-ID to get precise ephemerides
- Diameter data is from NASA's official measurements where available
- Unknown diameters default to 1.0 km for rendering purposes
- All 8 planets use simplified Keplerian orbits (accurate for visualization)

## Updates Log

### December 24, 2025
- ✅ Added interactive filtering system (12 classes)
- ✅ Implemented smart search for planets and asteroids  
- ✅ Fixed NASA links (planets → Science pages, asteroids → SBDB)
- ✅ Added 12-class color legend with toggle functionality
- ✅ Optimized filter performance with GPU shader discard
- ✅ Updated documentation with complete feature list

---

**Generated by:** `generate_curated_dataset.py` script  
**Selection Strategy:** Tier 1 (largest objects) + Tier 2 (diversity & interest)  
**Data Sources:** NASA JPL SBDB, all_asteroids_wrangled.csv, all_comets_wrangled.csv

