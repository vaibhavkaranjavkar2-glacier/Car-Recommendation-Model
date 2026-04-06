from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import pandas as pd
from recommender import CarRecommender
import uvicorn
import os
import re

app = FastAPI(title="Car Recommendation API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize recommender
data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/final_latest_variety_500.csv"))
recommender = CarRecommender(data_path)

class UserPreferences(BaseModel):
    budget: Optional[float] = None
    body_type: Optional[str] = None
    fuel_type: Optional[str] = None
    mileage_priority: Optional[bool] = False
    safety_priority: Optional[bool] = False
    transmission: Optional[str] = None
    seating_capacity: Optional[int] = None

@app.get("/")
def home():
    return {"message": "Welcome to Car Recommendation API"}

@app.get("/cars")
def get_all_cars():
    return recommender.df.to_dict(orient='records')

@app.get("/cars/{car_id}")
def get_car(car_id: int):
    try:
        car = recommender.get_car_by_id(car_id)
        if not car:
            raise ValueError()
        return car
    except:
        raise HTTPException(status_code=404, detail="Car not found")

@app.post("/recommend")
def get_recommendations(prefs: UserPreferences):
    # Map user preferences to our recommendation engine's dictionary
    user_pref_dict = {
        'price': prefs.budget if prefs.budget else recommender.df['price'].mean(),
        'body_type': prefs.body_type if prefs.body_type else recommender.df['body_type'].mode()[0],
        'fuel_type': prefs.fuel_type if prefs.fuel_type else recommender.df['fuel_type'].mode()[0],
        'fuel_economy': 40 if prefs.mileage_priority else recommender.df['fuel_economy'].mean(),
        'safety_rating': 5 if prefs.safety_priority else recommender.df['safety_rating'].mean()
    }
    
    if prefs.transmission:
        user_pref_dict['transmission'] = prefs.transmission
    if prefs.seating_capacity:
        user_pref_dict['seating_capacity'] = prefs.seating_capacity
    
    return recommender.recommend(user_pref_dict)

@app.post("/compare")
def compare_cars(car_ids: List[int]):
    return recommender.compare_cars(car_ids)

@app.get("/analytics")
def get_analytics():
    return recommender.get_analytics()

class ChatRequest(BaseModel):
    query: str

@app.post("/chat")
def ai_chat(req: ChatRequest):
    query = req.query.lower()
    df = recommender.df
    
    # 1. DISCOVER USER INTENT
    # -----------------------
    intents = {
        "budget": None,
        "brands": [],
        "body_types": [],
        "fuel_types": [],
        "transmission": None,
        "priority": "rating"
    }
    
    # Extract Budget
    prices = re.findall(r'(\d+)\s*(?:lakh|lac|l)', query)
    if prices:
        val = int(prices[0])
        intents["budget"] = val * 100000 if val < 100 else val

    # Extract Categories
    possible_brands = df['make'].unique().tolist()
    intents["brands"] = [b for b in possible_brands if b.lower() in query]
    
    body_map = {"suv": "SUV", "sedan": "Sedan", "hatch": "Hatchback", "truck": "Truck", "coupe": "Coupe"}
    intents["body_types"] = [v for k, v in body_map.items() if k in query]
    
    fuel_map = {"diesel": "Diesel", "petrol": "Petrol", "electric": "Electric", "ev": "Electric", "cng": "CNG"}
    intents["fuel_types"] = [v for k, v in fuel_map.items() if k in query]
    
    if "automatic" in query or "amt" in query: intents["transmission"] = "Automatic"
    elif "manual" in query: intents["transmission"] = "Manual"
    
    if "safe" in query or "safety" in query: intents["priority"] = "safety_rating"
    elif "mileage" in query or "efficient" in query: intents["priority"] = "fuel_economy"
    elif "power" in query or "fast" in query: intents["priority"] = "horsepower"

    # 2. PERFORM ANALYSIS
    # -------------------
    results = df.copy()
    filters_applied = []
    
    if intents["brands"]:
        results = results[results['make'].isin(intents["brands"])]
        filters_applied.append(f"from {', '.join(intents['brands'])}")
    
    if intents["body_types"]:
        results = results[results['body_type'].isin(intents["body_types"])]
        filters_applied.append(f"{', '.join(intents['body_types'])} models")
        
    if intents["fuel_types"]:
        # Safety: exclude others if fuel type is specific
        results = results[results['fuel_type'].isin(intents["fuel_types"])]
        filters_applied.append(f"with {', '.join(intents['fuel_types'])} engines")
        
    if intents["transmission"]:
        results = results[results['transmission'] == intents["transmission"]]
        filters_applied.append(f"{intents['transmission']} transmission")
        
    if intents["budget"]:
        results = results[results['price'] <= intents["budget"]]
        filters_applied.append(f"under ₹{intents['budget']/100000:.1f} Lakh")

    # 3. GENERATE HUMAN-LIKE RESPONSE
    # -------------------------------
    if results.empty:
        return {
            "answer": "I found no exact matches for that specific combination. Try broadening your criteria (e.g., removing a brand or budget constraint) or ask about general 'safe SUVs'!",
            "cars": []
        }
    
    top_results = results.sort_values(by=intents["priority"], ascending=False).drop_duplicates(subset=['make', 'model']).head(3)
    car_list = [f"{c['make']} {c['model']}" for _, c in top_results.iterrows()]
    
    if not filters_applied:
        analysis_context = "general preferences"
    else:
        analysis_context = ", ".join(filters_applied)
        
    priority_msg = {
        "safety_rating": "prioritizing maximum safety for your family",
        "fuel_economy": "optimized for the best fuel efficiency",
        "horsepower": "focused on high performance and power",
        "rating": "providing the best overall market value"
    }

    answer = f"Based on your requirements for {analysis_context}, here are the top 3 models {priority_msg[intents['priority']]}: {', '.join(car_list)}."
    
    if "hi" in query or "hello" in query:
        answer = "Hello! " + answer

    return {
        "answer": answer,
        "cars": top_results.to_dict(orient='records')
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
