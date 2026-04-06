import sys
from backend.recommender import CarRecommender

try:
    recommender = CarRecommender('data/final_latest_variety_500.csv')
    user_pref_dict = {
        'price': 1200000,
        'body_type': 'SUV',
        'fuel_type': 'Petrol',
        'fuel_economy': 40,
        'safety_rating': 5
    }
    recs = recommender.recommend(user_pref_dict)
    print("Success")
    print(recs[0])
except Exception as e:
    import traceback
    traceback.print_exc()
