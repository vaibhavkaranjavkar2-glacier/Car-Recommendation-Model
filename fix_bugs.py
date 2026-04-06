import os
import re
import pandas as pd

# Fix JSX paths
src_dir = 'c:/Users/Vaibhav/Videos/car-recommender/frontend/src'
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.jsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as f_in:
                content = f_in.read()
            
            if 'http://localhost:8000' in content:
                if 'import { API_BASE } from' not in content:
                    prefix = "import { API_BASE } from '../config';\n"
                    content = prefix + content
                
                content = content.replace("'http://localhost:8000", "`${API_BASE}")
                content = content.replace("`${API_BASE}/recommend'", "`${API_BASE}/recommend`")
                content = content.replace("`${API_BASE}/cars'", "`${API_BASE}/cars`")
                content = content.replace("`${API_BASE}/chat'", "`${API_BASE}/chat`")
                content = content.replace("`${API_BASE}/compare'", "`${API_BASE}/compare`")
                content = content.replace("`${API_BASE}/analytics'", "`${API_BASE}/analytics`")
                
                with open(path, 'w', encoding='utf-8') as f_out:
                    f_out.write(content)

print("Fixed JSX files.")

# Fix Dataset
csv_path = 'c:/Users/Vaibhav/Videos/car-recommender/data/final_latest_variety_500.csv'
df = pd.read_csv(csv_path)

# Filter out rows where price < 50000 (B-17)
df = df[df['price'] >= 50000]

# Fill missing data properly (B-02)
# Recommender does some of this but we want an actually clean CSV
numeric_cols = ['engine_cc', 'seating_capacity', 'safety_rating', 'year', 'rating']
for col in numeric_cols:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
        df[col] = df[col].fillna(df[col].mean())

cat_cols = ['use_case', 'features', 'image_url']
for col in cat_cols:
    if col in df.columns:
        df[col] = df[col].fillna('Standard')

df.to_csv(csv_path, index=False)
print("Fixed dataset.")
