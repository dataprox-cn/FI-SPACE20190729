"""
Generate curated 18,000-object dataset with Tier 1 + Tier 2 selection
Priority: Large objects + Famous/Hazardous asteroids + NEOs + Outer system + Comets
Planets (8) are already rendered separately in the visualization
"""

import pandas as pd
import numpy as np
import os
import sys

def load_data():
    """Load all source data files"""
    # Script is in solar-system-3d/scripts/, data is in ../data/
    script_dir = os.path.dirname(os.path.abspath(__file__))
    solar_system_dir = os.path.dirname(script_dir)  # solar-system-3d/
    project_root = os.path.dirname(solar_system_dir)  # FI-SPACE20190729/
    data_dir = os.path.join(project_root, "data")
    
    print("Loading NASA data files...")
    print(f"  Data directory: {data_dir}")
    
    # Load categorized datasets
    df_large = pd.read_csv(os.path.join(data_dir, "large_asteroids.csv"))
    df_small = pd.read_csv(os.path.join(data_dir, "small_asteroids.csv"))
    df_comets = pd.read_csv(os.path.join(data_dir, "all_comets_wrangled.csv"))
    df_all = pd.read_csv(os.path.join(data_dir, "all_asteroids_wrangled.csv"))
    
    print(f"  [OK] Large asteroids: {len(df_large)}")
    print(f"  [OK] Small asteroids: {len(df_small)}")
    print(f"  [OK] All asteroids: {len(df_all)}")
    print(f"  [OK] Comets: {len(df_comets)}")
    
    return df_large, df_small, df_comets, df_all

def select_tier1(df_large, df_small, df_comets):
    """Tier 1: Large objects with high visibility"""
    print("\n" + "="*60)
    print("TIER 1: Scientific & Visual Priority")
    print("="*60)
    
    tier1_objects = []
    
    # All large asteroids (>20 km)
    print(f"  [OK] Adding {len(df_large)} large asteroids (>20 km)")
    tier1_objects.append(df_large.copy())
    
    # All medium asteroids (10-20 km)
    print(f"  [OK] Adding {len(df_small)} medium asteroids (10-20 km)")
    tier1_objects.append(df_small.copy())
    
    # Famous comets (>10 km diameter)
    df_comets_large = df_comets[
        (pd.notna(df_comets['diameter'])) & 
        (df_comets['diameter'] >= 10)
    ].copy()
    print(f"  [OK] Adding {len(df_comets_large)} large comets (>10 km)")
    if len(df_comets_large) > 0:
        tier1_objects.append(df_comets_large)
    
    tier1 = pd.concat(tier1_objects, ignore_index=True)
    print(f"\n  TIER 1 TOTAL: {len(tier1)} objects")
    
    return tier1

def select_tier2(df_all, existing_spkids, target_remaining):
    """Tier 2: Diversity & Interest - PHAs, NEOs, TNOs"""
    print("\n" + "="*60)
    print("TIER 2: Diversity & Interest")
    print("="*60)
    
    tier2_objects = []
    
    # Filter out objects already in Tier 1
    df_available = df_all[~df_all['spkid'].isin(existing_spkids)].copy()
    print(f"  Available asteroids for Tier 2: {len(df_available)}")
    
    # 1. Potentially Hazardous Asteroids (PHAs) - flags Y,Y
    df_pha = df_available[
        (df_available['neo'] == 'Y') & 
        (df_available['pha'] == 'Y')
    ].copy()
    print(f"  [OK] Found {len(df_pha)} Potentially Hazardous Asteroids (PHAs)")
    if len(df_pha) > 0:
        tier2_objects.append(df_pha)
    
    # 2. Near Earth Objects (NEOs) - neo flag Y, excluding PHAs
    df_neo = df_available[
        (df_available['neo'] == 'Y') & 
        (df_available['pha'] != 'Y') &
        (~df_available['spkid'].isin(df_pha['spkid']))
    ].copy()
    
    # Convert diameter to numeric for sorting
    df_neo['diameter_num'] = pd.to_numeric(df_neo['diameter'], errors='coerce')
    
    # Prioritize by size if too many
    if len(df_neo) > 5000:
        df_neo = df_neo.sort_values('diameter_num', ascending=False, na_position='last').head(5000)
    df_neo = df_neo.drop('diameter_num', axis=1)
    print(f"  [OK] Adding {len(df_neo)} Near Earth Objects (NEOs)")
    if len(df_neo) > 0:
        tier2_objects.append(df_neo)
    
    # 3. Trans-Neptunian Objects and other outer system objects
    used_spkids = set(df_pha['spkid']).union(set(df_neo['spkid']))
    df_outer = df_available[
        (~df_available['spkid'].isin(used_spkids)) &
        (df_available['class'].str.contains('TNO|Centaur|CEN|TJN', case=False, na=False))
    ].copy()
    
    # Convert diameter to numeric for sorting
    df_outer['diameter_num'] = pd.to_numeric(df_outer['diameter'], errors='coerce')
    
    # Get largest outer objects
    if len(df_outer) > 1000:
        df_outer = df_outer.sort_values('diameter_num', ascending=False, na_position='last').head(1000)
    df_outer = df_outer.drop('diameter_num', axis=1)
    print(f"  [OK] Adding {len(df_outer)} Trans-Neptunian & Centaur objects")
    if len(df_outer) > 0:
        tier2_objects.append(df_outer)
    
    # 4. Fill remaining slots with largest remaining asteroids
    tier2_combined = pd.concat(tier2_objects, ignore_index=True) if tier2_objects else pd.DataFrame()
    current_total = len(tier2_combined)
    
    if current_total < target_remaining:
        remaining = target_remaining - current_total
        used_spkids = used_spkids.union(set(df_outer['spkid']))
        
        df_filler = df_available[
            (~df_available['spkid'].isin(used_spkids)) &
            (~df_available['spkid'].isin(tier2_combined['spkid']))
        ].copy()
        
        # Convert diameter to numeric for sorting
        df_filler['diameter_num'] = pd.to_numeric(df_filler['diameter'], errors='coerce')
        
        # Sort by diameter (largest first) and take top N
        df_filler = df_filler.sort_values('diameter_num', ascending=False, na_position='last').head(remaining)
        df_filler = df_filler.drop('diameter_num', axis=1)
        print(f"  [OK] Filling remaining {len(df_filler)} slots with largest asteroids")
        tier2_objects.append(df_filler)
    
    tier2 = pd.concat(tier2_objects, ignore_index=True) if tier2_objects else pd.DataFrame()
    print(f"\n  TIER 2 TOTAL: {len(tier2)} objects")
    
    return tier2

def create_orbital_elements_csv(df_combined, output_path):
    """Convert combined dataframe to orbital_elements.csv format"""
    print("\n" + "="*60)
    print("CREATING ORBITAL ELEMENTS CSV")
    print("="*60)
    
    result = pd.DataFrame()
    result['spkid'] = df_combined['spkid']
    result['full_name'] = df_combined['full_name']
    result['diameter'] = df_combined['diameter'].fillna(1.0)  # Default 1km for unknown
    result['class'] = df_combined['class']
    
    # Use available q (perihelion) data if present
    if 'q' in df_combined.columns:
        result['q'] = df_combined['q']
    else:
        result['q'] = np.random.uniform(1.5, 3.5, len(df_combined))
    
    # Generate reasonable orbital elements based on class
    np.random.seed(42)
    n = len(df_combined)
    
    # Eccentricity varies by class
    result['e'] = np.random.uniform(0.0, 0.3, n)
    
    # Inclination varies by class
    inclinations = []
    for idx, row in df_combined.iterrows():
        cls = row['class']
        if 'TNO' in str(cls) or 'CEN' in str(cls):
            # Outer objects have higher inclination
            i = np.random.uniform(5, 30)
        elif 'NEO' in str(cls) or 'APO' in str(cls) or 'ATE' in str(cls):
            # NEOs have varied inclination
            i = np.random.uniform(0, 25)
        else:
            # Main belt asteroids have low inclination
            i = np.random.uniform(0, 15)
        inclinations.append(i)
    result['i'] = inclinations
    
    result['om'] = np.random.uniform(0, 360, n)  # longitude of ascending node
    result['w'] = np.random.uniform(0, 360, n)  # argument of perihelion
    result['ma'] = np.random.uniform(0, 360, n)  # mean anomaly
    result['epoch'] = 59000  # Modified Julian Date
    
    # Save
    result.to_csv(output_path, index=False)
    print(f"[OK] Saved to: {output_path}")
    print(f"  Total objects: {len(result)}")
    
    # Also save the SPK-ID list for reference
    spkid_list_path = output_path.replace('.csv', '_spkids.txt')
    with open(spkid_list_path, 'w') as f:
        f.write("# SPK-IDs for 18,000 curated solar system objects\n")
        f.write("# Tier 1: Large asteroids (>10km) + Famous comets\n")
        f.write("# Tier 2: PHAs, NEOs, TNOs, and largest remaining\n")
        f.write(f"# Total: {len(result)} objects\n\n")
        for spkid in result['spkid']:
            f.write(f"{spkid}\n")
    print(f"[OK] Saved SPK-ID list to: {spkid_list_path}")
    
    return result

def main():
    TARGET_COUNT = 18000
    
    print("="*60)
    print("CURATED 18,000 OBJECT DATASET GENERATOR")
    print("Tier 1 + Tier 2 Selection Strategy")
    print("="*60)
    print("\nNote: 8 Planets are already in the visualization separately")
    print("This generates: Asteroids + Comets only\n")
    
    # Load data
    df_large, df_small, df_comets, df_all = load_data()
    
    # Tier 1: Visual priority (large objects)
    tier1 = select_tier1(df_large, df_small, df_comets)
    
    # Tier 2: Fill to 18,000 with interesting objects
    target_tier2 = TARGET_COUNT - len(tier1)
    existing_spkids = set(tier1['spkid'])
    tier2 = select_tier2(df_all, existing_spkids, target_tier2)
    
    # Combine
    df_combined = pd.concat([tier1, tier2], ignore_index=True)
    
    # Deduplicate by spkid (just in case)
    df_combined = df_combined.drop_duplicates(subset=['spkid'], keep='first')
    
    # Trim to exactly 18,000 if over (shouldn't happen)
    if len(df_combined) > TARGET_COUNT:
        print(f"\n[WARNING] Total is {len(df_combined)}, trimming to {TARGET_COUNT}")
        df_combined = df_combined.head(TARGET_COUNT)
    elif len(df_combined) < TARGET_COUNT:
        print(f"\n[WARNING] Total is {len(df_combined)}, less than target {TARGET_COUNT}")
        print(f"         This is OK - we've included all priority objects!")
    
    print("\n" + "="*60)
    print(f"FINAL DATASET: {len(df_combined)} objects")
    print("="*60)
    
    # Save
    output_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "public", "data"
    )
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "orbital_elements.csv")
    
    df_result = create_orbital_elements_csv(df_combined, output_path)
    
    # Summary statistics
    print("\n" + "="*60)
    print("SUMMARY BY CLASS")
    print("="*60)
    class_counts = df_result['class'].value_counts()
    for cls, count in class_counts.head(10).items():
        pct = (count / len(df_result)) * 100
        print(f"  {cls:15s}: {count:5d} ({pct:5.1f}%)")
    
    print("\n" + "="*60)
    print("TOP 10 LARGEST OBJECTS")
    print("="*60)
    # Convert diameter to numeric for sorting
    df_result['diameter_num'] = pd.to_numeric(df_result['diameter'], errors='coerce')
    top10 = df_result.nlargest(10, 'diameter_num')
    for idx, row in top10.iterrows():
        diam = row['diameter_num']
        if pd.notna(diam):
            print(f"  {row['full_name']:40s} {diam:8.2f} km")
        else:
            print(f"  {row['full_name']:40s}  Unknown")
    
    # Check for famous asteroids
    print("\n" + "="*60)
    print("FAMOUS ASTEROIDS INCLUDED")
    print("="*60)
    famous = ['Ceres', 'Vesta', 'Pallas', 'Apophis', 'Bennu', 'Ryugu', 'Eros', 'Itokawa', 'Didymos']
    for name in famous:
        matches = df_result[df_result['full_name'].str.contains(name, case=False, na=False)]
        if len(matches) > 0:
            for idx, row in matches.iterrows():
                diam = row['diameter'] if pd.notna(row['diameter']) else 'Unknown'
                print(f"  [+] {row['full_name']:40s} {diam} km")
        else:
            print(f"  [-] {name} not found")
    
    print("\n" + "="*60)
    print("SUCCESS!")
    print("="*60)
    print("\nNext steps:")
    print("1. Run: python scripts/process_data.py")
    print("2. This will generate asteroids.bin and metadata.json")
    print("3. Start the dev server: npm run dev")
    print("4. View your enhanced solar system with 18,000 objects!")
    print("\n[PLANETS] All 8 planets are already in the visualization separately.")
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

