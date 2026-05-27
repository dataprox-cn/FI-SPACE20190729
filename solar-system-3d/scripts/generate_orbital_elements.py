"""
Generate orbital_elements.csv from the real NASA data in ../data/
This ensures the 3D visualization uses accurate diameter and orbital data.
"""

import pandas as pd
import os
import sys

def generate_orbital_elements():
    # Path to the real NASA data (parent directory)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    source_file = os.path.join(base_dir, "data", "all_asteroids_wrangled.csv")
    output_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "data", "orbital_elements.csv")
    
    if not os.path.exists(source_file):
        print(f"Error: Source file not found: {source_file}")
        print("Please ensure the data/all_asteroids_wrangled.csv file exists.")
        return False
    
    print(f"Reading real NASA data from: {source_file}")
    try:
        # Read the source data
        df = pd.read_csv(source_file)
        print(f"Loaded {len(df)} asteroids from NASA dataset")
        
        # Check available columns
        print(f"Available columns: {df.columns.tolist()}")
        
        # We need: spkid, full_name, diameter, class, e, q, i, om, w, ma, epoch
        # The source file has: id,spkid,full_name,pdes,name,neo,pha,diameter,prefix,q,per,class
        
        # We need to fetch orbital elements (e, i, om, w, ma, epoch) from HORIZONS data
        # For now, let's work with what we have: spkid, full_name, diameter, q, class
        # We'll need to look at the individual asteroid files in data/large_asteroids/ etc.
        
        # Let's try a different approach: check if there's orbital data in the large_asteroids folder
        large_asteroids_file = os.path.join(base_dir, "data", "large_asteroids.csv")
        if os.path.exists(large_asteroids_file):
            print(f"\nFound large_asteroids.csv")
            df_large = pd.read_csv(large_asteroids_file)
            print(f"Large asteroids columns: {df_large.columns.tolist()}")
            print(f"Sample row:\n{df_large.iloc[0]}")
        
        # The all_asteroids_wrangled.csv doesn't have full orbital elements (e, i, om, w, ma)
        # We need to extract those from the individual HORIZONS CSV files
        print("\nNote: The all_asteroids_wrangled.csv contains diameter but not all orbital elements.")
        print("To get complete orbital elements (e, i, om, w, ma, epoch), we need to:")
        print("1. Download fresh data from JPL SBDB Query Tool: https://ssd.jpl.nasa.gov/tools/sbdb_query.html")
        print("2. Select fields: SPK-ID, Full Name, Diameter, Orbit Class, e, q, i, om, w, M, epoch")
        print("3. Save as orbital_elements.csv")
        
        # For now, let's create a mapping of spkid -> diameter from the real data
        # This can be used to patch the existing orbital_elements.csv
        diameter_map_file = os.path.join(os.path.dirname(output_file), "diameter_mapping.csv")
        diameter_df = df[['spkid', 'full_name', 'diameter']].copy()
        diameter_df.to_csv(diameter_map_file, index=False)
        print(f"\nCreated diameter mapping file: {diameter_map_file}")
        print(f"This file contains accurate diameter data for {len(diameter_df)} asteroids.")
        
        return True
        
    except Exception as e:
        print(f"Error processing data: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = generate_orbital_elements()
    if success:
        print("\n" + "="*60)
        print("NEXT STEPS:")
        print("="*60)
        print("The real issue is that orbital_elements.csv needs BOTH:")
        print("1. Diameter data (from all_asteroids_wrangled.csv) ✓ Available")
        print("2. Orbital elements: e, i, om, w, ma, epoch ✗ Not in this file")
        print("\nTo fix completely:")
        print("Option A: Download complete data from NASA JPL SBDB")
        print("Option B: Parse individual HORIZONS files in data/*/")
        print("="*60)
    sys.exit(0 if success else 1)



