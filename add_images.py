import pandas as pd
import requests
from bs4 import BeautifulSoup
import time
import os
import re
import json

print("=" * 60)
print("  CAR IMAGE DOWNLOADER - Bing Image Search")
print("=" * 60)

csv_path = "data/final_latest_variety_500.csv"
output_dir = "frontend/public/cars"
os.makedirs(output_dir, exist_ok=True)

df = pd.read_csv(csv_path)

# Get unique brand+model combos
df['_clean_model'] = df.apply(lambda r: str(r['name']).replace(str(r['brand']), '').strip(), axis=1)
unique_models = df[['brand', '_clean_model']].drop_duplicates()
print(f"\nFound {len(unique_models)} unique car models to fetch images for.\n")

downloaded = {}
failed = []

def search_bing_images(query):
    """Search Bing Images and extract image URLs from the page."""
    url = f"https://www.bing.com/images/search?q={requests.utils.quote(query)}&qft=+filterui:photo-photo&form=IRFLTR&first=1"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        image_urls = []
        
        # Method 1: Extract from 'm' attribute in anchor tags (Bing's data format)
        for a_tag in soup.find_all('a', {'class': 'iusc'}):
            m_data = a_tag.get('m')
            if m_data:
                try:
                    m_json = json.loads(m_data)
                    if 'murl' in m_json:
                        image_urls.append(m_json['murl'])
                except:
                    pass
        
        # Method 2: Extract from img tags with src
        if not image_urls:
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src') or ''
                if src.startswith('http') and ('jpg' in src or 'jpeg' in src or 'png' in src):
                    if 'bing.com' not in src and 'microsoft.com' not in src:
                        image_urls.append(src)
        
        return image_urls[:5]
    except Exception as e:
        print(f"  Search error: {e}")
        return []

def download_image(img_url, save_path):
    """Download an image and verify it's valid."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.bing.com/",
        }
        resp = requests.get(img_url, headers=headers, timeout=10, stream=True)
        
        if resp.status_code == 200:
            content_type = resp.headers.get('content-type', '')
            if 'image' in content_type or img_url.endswith(('.jpg', '.jpeg', '.png')):
                with open(save_path, 'wb') as f:
                    for chunk in resp.iter_content(8192):
                        f.write(chunk)
                
                # Verify real image (>5KB and starts with JPEG/PNG magic bytes)
                if os.path.getsize(save_path) > 5000:
                    with open(save_path, 'rb') as f:
                        header = f.read(4)
                    if header[:2] == b'\xff\xd8' or header[:4] == b'\x89PNG':
                        return True
                
                os.remove(save_path)
        return False
    except:
        if os.path.exists(save_path):
            os.remove(save_path)
        return False

for idx, (_, row) in enumerate(unique_models.iterrows()):
    brand = str(row['brand']).strip()
    model = str(row['_clean_model']).strip()
    
    # Create safe filename
    safe_name = re.sub(r'[^a-z0-9]+', '_', f"{brand}_{model}".lower()).strip('_')
    img_path = os.path.join(output_dir, f"{safe_name}.jpg")
    
    # Skip if already downloaded
    if os.path.exists(img_path) and os.path.getsize(img_path) > 5000:
        print(f"[{idx+1}/{len(unique_models)}] CACHED: {brand} {model}")
        downloaded[f"{brand}|{model}"] = f"/cars/{safe_name}.jpg"
        continue
    
    # Try multiple search variations
    search_queries = [
        f"{brand} {model} car exterior",
        f"{brand} {model} 2024 car India",
        f"{model} car photo",
    ]
    
    success = False
    for query in search_queries:
        print(f"[{idx+1}/{len(unique_models)}] Searching: {query}")
        
        image_urls = search_bing_images(query)
        
        for img_url in image_urls:
            if download_image(img_url, img_path):
                downloaded[f"{brand}|{model}"] = f"/cars/{safe_name}.jpg"
                size_kb = os.path.getsize(img_path) // 1024
                print(f"  ✓ Downloaded: {safe_name}.jpg ({size_kb}KB)")
                success = True
                break
        
        if success:
            break
        
        time.sleep(1)
    
    if not success:
        failed.append(f"{brand} {model}")
        print(f"  ✗ FAILED: {brand} {model}")
    
    time.sleep(1.5)

# Update the CSV
print("\n" + "=" * 60)
print("Updating dataset...")

def get_image_path(row):
    brand = str(row['brand']).strip()
    model = str(row['name']).replace(brand, '').strip()
    key = f"{brand}|{model}"
    return downloaded.get(key, "/cars/default.jpg")

df['image_url'] = df.apply(get_image_path, axis=1)
df = df.drop(columns=['_clean_model'], errors='ignore')
df.to_csv(csv_path, index=False)

# Download a default fallback
default_path = os.path.join(output_dir, "default.jpg")
if not os.path.exists(default_path) or os.path.getsize(default_path) < 5000:
    print("Downloading default fallback...")
    try:
        resp = requests.get(
            "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=664&q=80",
            timeout=15
        )
        with open(default_path, 'wb') as f:
            f.write(resp.content)
    except:
        print("Warning: Could not download fallback.")

print(f"\n{'=' * 60}")
print(f"✅ COMPLETE!")
print(f"   Downloaded: {len(downloaded)}/{len(unique_models)} models")
print(f"   Failed: {len(failed)}")
if failed:
    print(f"   Failed models: {', '.join(failed)}")
print(f"   Images at: {output_dir}/")
