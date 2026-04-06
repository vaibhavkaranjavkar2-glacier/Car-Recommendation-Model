import pandas as pd
df = pd.read_csv("data/final_latest_variety_500.csv")
wiki = df['image_url'].str.contains('upload.wikimedia', na=False).sum()
unsplash = df['image_url'].str.contains('unsplash', na=False).sum()
other = len(df) - wiki - unsplash
print(f"Wikimedia images: {wiki}")
print(f"Fallback images: {unsplash}")
print(f"Other: {other}")
print(f"Total: {len(df)}")
print(f"Unique URLs: {df['image_url'].nunique()}")
print()
print("Samples:")
for _, r in df.head(8).iterrows():
    print(f"  {r['brand']} {r['name']}: {str(r['image_url'])[:80]}")
