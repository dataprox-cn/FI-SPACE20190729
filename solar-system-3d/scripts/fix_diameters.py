"""
Fix diameter values in orbital_elements.csv using real NASA data
"""

import pandas as pd
import os

def fix_diameters():
    # Paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    nasa_data_file = os.path.join(base_dir, "data", "all_asteroids_wrangled.csv")
    orbital_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "data", "orbital_elements.csv")
    output_file = orbital_file  # Overwrite the same file
    
    # Check if files exist
    if not os.path.exists(nasa_data_file):
        print(f"Error: NASA data file not found: {nasa_data_file}")
        return False
    
    if not os.path.exists(orbital_file):
        print(f"Error: Orbital elements file not found: {orbital_file}")
        return False
    
    print(f"Reading NASA diameter data from: {nasa_data_file}")
    df_nasa = pd.read_csv(nasa_data_file)
    print(f"Loaded {len(df_nasa)} asteroids from NASA dataset")
    
    print(f"\nReading orbital elements from: {orbital_file}")
    df_orbital = pd.read_csv(orbital_file)
    print(f"Loaded {len(df_orbital)} asteroids from orbital elements file")
    
    # Create a diameter lookup dictionary from NASA data
    # Key: spkid (as string), Value: diameter
    diameter_lookup = {}
    for idx, row in df_nasa.iterrows():
        spkid = str(row['spkid'])
        diameter = row['diameter']
        # Only add if diameter is not NaN
        if pd.notna(diameter) and diameter > 0:
            diameter_lookup[spkid] = diameter
    
    print(f"\nCreated diameter lookup with {len(diameter_lookup)} entries")
    print(f"Sample entries: {list(diameter_lookup.items())[:5]}")
    
    # Update diameters in orbital elements
    updates = 0
    for idx, row in df_orbital.iterrows():
        spkid = str(row['spkid'])
        if spkid in diameter_lookup:
            # Update diameter
            new_diameter = diameter_lookup[spkid]
            old_diameter = row['diameter']
            if pd.isna(old_diameter) or old_diameter != new_diameter:
                df_orbital.at[idx, 'diameter'] = new_diameter
                updates += 1
                if updates <= 5:  # Show first 5 updates
                    print(f"  Updated SPKID {spkid}: {old_diameter} -> {new_diameter} km")
    
    print(f"\nUpdated {updates} asteroid diameters")
    
    # Save the updated file
    print(f"\nSaving updated orbital elements to: {output_file}")
    df_orbital.to_csv(output_file, index=False)
    print("Done!")
    
    # Show some key asteroids
    print("\n" + "="*60)
    print("Verification - Key asteroids:")
    print("="*60)
    for spkid in ['2000001', '2000002', '2000003', '2000004']:  # Ceres, Pallas, Juno, Vesta
        row = df_orbital[df_orbital['spkid'] == int(spkid)]
        if not row.empty:
            name = row.iloc[0]['full_name']
            diameter = row.iloc[0]['diameter']
            print(f"  {spkid} ({name}): {diameter} km")
    
    return True

if __name__ == "__main__":
    import sys
    success = fix_diameters()
    sys.exit(0 if success else 1)



