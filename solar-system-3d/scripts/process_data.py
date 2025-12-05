import pandas as pd
import numpy as np
import struct
import json
import os
import math

def process_data():
    # Use relative paths assuming script is run from project root (solar-system-3d/)
    # or handle absolute paths
    base_dir = os.getcwd()
    # Check if we are in scripts dir or root
    if base_dir.endswith("scripts"):
        base_dir = os.path.dirname(base_dir)
        
    input_path = os.path.join(base_dir, "public", "data", "orbital_elements.csv")
    output_bin = os.path.join(base_dir, "public", "data", "asteroids.bin")
    output_meta = os.path.join(base_dir, "public", "data", "metadata.json")
    
    # Adjust path if running from root
    if not os.path.exists(input_path):
        # Try relative to script location if needed, but assuming running from root
        print(f"Input file {input_path} not found.")
        return

    print(f"Reading {input_path}...")
    try:
        df = pd.read_csv(input_path)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    # Filter required columns
    required_cols = ['e', 'q', 'i', 'om', 'w', 'ma', 'class', 'full_name', 'spkid']
    # Diameter might be missing or string
    
    # Clean data
    # Drop rows with missing orbital elements
    df = df.dropna(subset=['e', 'q', 'i', 'om', 'w', 'ma'])
    
    # Normalize units
    # deg -> rad for i, om, w, ma
    deg2rad = np.pi / 180.0
    df['i'] = df['i'].astype(float) * deg2rad
    df['om'] = df['om'].astype(float) * deg2rad
    df['w'] = df['w'].astype(float) * deg2rad
    df['ma'] = df['ma'].astype(float) * deg2rad
    
    # Handle Diameter
    # Replace NaN/empty with 0.1 (small default)
    # Ensure it's numeric
    if 'diameter' in df.columns:
        df['diameter'] = pd.to_numeric(df['diameter'], errors='coerce').fillna(1.0)
    else:
        df['diameter'] = 1.0

    # Map Classes to Integers
    # Get unique classes
    classes = df['class'].unique().tolist()
    class_map = {c: i for i, c in enumerate(classes)}
    df['class_id'] = df['class'].map(class_map)
    
    # Prepare Binary Buffer
    # Stride: [e, q, i, om, w, ma, epoch, diameter, class_id] (9 floats)
    # Note: 'epoch' might be missing in mock data, handle it
    if 'epoch' not in df.columns:
        df['epoch'] = 59000.0 # Default MJD
    else:
        df['epoch'] = pd.to_numeric(df['epoch'], errors='coerce').fillna(59000.0)

    # Convert to float32
    data_array = np.zeros((len(df), 9), dtype=np.float32)
    data_array[:, 0] = df['e']
    data_array[:, 1] = df['q']
    data_array[:, 2] = df['i']
    data_array[:, 3] = df['om']
    data_array[:, 4] = df['w']
    data_array[:, 5] = df['ma']
    data_array[:, 6] = df['epoch']
    data_array[:, 7] = df['diameter']
    data_array[:, 8] = df['class_id']
    
    print(f"Writing {len(df)} asteroids to binary...")
    with open(output_bin, 'wb') as f:
        f.write(data_array.tobytes())
        
    # Prepare Metadata
    # Minimal metadata to reduce size: ["Name", class_id]? 
    # Or just list of names aligned with index.
    # To keep it small: just names. class is in binary.
    # We also need the Class Map to decode colors.
    
    meta = {
        "classes": classes,
        "ids": df['spkid'].astype(str).tolist(),
        "names": df['full_name'].astype(str).tolist()
    }
    
    print(f"Writing metadata to {output_meta}...")
    with open(output_meta, 'w') as f:
        json.dump(meta, f)
        
    print("Processing complete.")

if __name__ == "__main__":
    process_data()

