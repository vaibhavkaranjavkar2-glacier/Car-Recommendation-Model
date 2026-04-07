import os
import sys

# Add backend to path
backend_path = "c:/Users/Vaibhav/Videos/car-recommender/backend"
sys.path.append(backend_path)
from recommender import CarRecommender

data_path = "c:/Users/Vaibhav/Videos/car-recommender/data/final_latest_variety_500.csv"
recommender = CarRecommender(data_path)

# Test preferences
prefs = {
    'price': 1200000,
    'body_type': 'SUV',
    'fuel_type': 'Electric',
    'fuel_economy': 40,
    'safety_rating': 5,
    'transmission': 'Any',
    'seating_capacity': 5
}

recommendations = recommender.recommend(prefs)
print(f"Number of recommendations: {len(recommendations)}")
for i, rec in enumerate(recommendations[:5]):
    print(f"{i+1}. {rec['make']} {rec['model']} - {rec['fuel_type']} - Score: {rec.get('score', 'N/A')}")
