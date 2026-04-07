import pandas as pd
import os
import difflib

# Configuration
csv_path = 'c:/Users/Vaibhav/Videos/car-recommender/data/final_500_cars_dataset.csv'
images_dir = 'c:/Users/Vaibhav/Videos/car-recommender/frontend/public/cars'

# Load unique filenames from disk
disk_files = os.listdir(images_dir)
disk_files = [f for f in disk_files if f.endswith(('.jpg', '.png', '.jpeg'))]
print(f"Files on disk: {len(disk_files)}")

def find_best_file(row):
    # Try brand + name
    brand = str(row['brand']).lower().replace(' ', '_')
    name = str(row.get('name', '')).lower().replace(' ', '_')
    model = str(row.get('model', '')).lower().replace(' ', '_')
    combined = (brand + "_" + (name or model)).replace('__', '_')
    
    # Precise match attempt first
    for f in disk_files:
        if combined in f.lower() or f.lower() in combined:
            return f
            
    # Fuzzy match fallback
    matches = difflib.get_close_matches(combined + ".jpg", disk_files, n=1, cutoff=0.1)
    if matches:
        return matches[0]
        
    return "default.jpg"

# Read CSV
df = pd.read_csv(csv_path)

# Apply fix
print("Updating CSV image URLs...")
df['image_url'] = df.apply(find_best_file, axis=1)

# Debug: check first few
print(df[['name', 'image_url']].head(5))

# Save back
df.to_csv(csv_path, index=False)
print("CSV updated successfully!")
