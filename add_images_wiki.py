import pandas as pd
import requests
import time

print("Starting Wiki Image Fetcher...")
csv_path = "data/final_latest_variety_500.csv"
df = pd.read_csv(csv_path)

cache = {}
image_urls = []

for index, row in df.iterrows():
    brand = str(row['brand']).split()[0] # e.g. "Tata"
    model = str(row['name']).replace(brand, "").strip().split()[0] # e.g. "Safari"
    car_name = f"{brand} {model}"
    
    if car_name in cache:
        image_urls.append(cache[car_name])
        continue
        
    print(f"Fetching: {car_name}")
    try:
        url = f"https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles={brand}_{model}"
        headers = {"User-Agent": "ZenithAutomotive/1.0 (Contact: mail@example.com)"}
        res = requests.get(url, headers=headers).json()
        
        pages = res.get("query", {}).get("pages", {})
        page_val = list(pages.values())[0]
        
        if "original" in page_val and "source" in page_val["original"]:
            img_url = page_val["original"]["source"]
        else:
            # Fallback to general search Unsplash just in case
            img_url = f"https://cdn.imagin.studio/getImage?make={brand}&modelFamily={model}"
            
        cache[car_name] = img_url
        image_urls.append(img_url)
    except Exception as e:
        cache[car_name] = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600"
        image_urls.append(cache[car_name])
        
    time.sleep(0.1)

df["image_url"] = image_urls
df.to_csv("cars_with_images.csv", index=False)

import os
import shutil
shutil.move("cars_with_images.csv", csv_path)

print("✅ Done! Replaced dataset seamlessly.")
