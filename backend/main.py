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
data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/final_500_cars_dataset.csv"))
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
        "models": [],
        "body_types": [],
        "fuel_types": [],
        "transmission": None,
        "priority": "rating",
        "is_comparison": any(x in query for x in ["better", "vs", "compare", "comparison", "between", "which is best", "difference"])
    }
    
    # Extract Budget
    prices = re.findall(r'(\d+)\s*(?:lakh|lac|l)', query)
    if prices:
        val = int(prices[0])
        intents["budget"] = val * 100000 if val < 100 else val

    # Extract Brands
    possible_brands = df['make'].unique().tolist()
    intents["brands"] = [b for b in possible_brands if b.lower() in query]
    
    # Extract Models (Better partial matching)
    possible_models = df['model'].unique().tolist()
    for m in possible_models:
        m_low = m.lower()
        # If model name is in query or if significant parts of the model name are in query
        if m_low in query or (len(m_low) > 3 and m_low.split()[0] in query):
            intents["models"].append(m)

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
    # HANDLE COMPARISON INTENT
    if intents["is_comparison"]:
        # Identify the primary models for comparison
        comp_cars = df[df['model'].isin(intents["models"])].copy()
        
        # If we have brands but no specific models, find a popular model for each brand
        if intents["brands"]:
            for brand in intents["brands"]:
                if brand not in [c['make'] for _, c in comp_cars.iterrows()]:
                    brand_models = df[df['make'] == brand].sort_values(by='rating', ascending=False)
                    if not brand_models.empty:
                        comp_cars = pd.concat([comp_cars, brand_models.head(1)])
        
        comp_cars = comp_cars.drop_duplicates(subset=['make', 'model']).head(2)
        
        if len(comp_cars) >= 2:
            c1 = comp_cars.iloc[0]
            c2 = comp_cars.iloc[1]
            
            # Specs Comparison
            answer = f"Comparing the {c1['make']} {c1['model']} vs {c2['make']} {c2['model']}: "
            
            # Safety
            if c1['safety_rating'] > c2['safety_rating']:
                answer += f"The {c1['model']} is safer with a {c1['safety_rating']}-star rating. "
            elif c2['safety_rating'] > c1['safety_rating']:
                answer += f"The {c2['model']} leads in safety with {c2['safety_rating']} stars. "
            else:
                answer += f"Both offer identical safety with {c1['safety_rating']} stars. "
                
            # Price
            if c1['price'] < c2['price']:
                answer += f"Budget-wise, the {c1['model']} is more affordable at ₹{c1['price']/100000:.1f} Lakh. "
            else:
                answer += f"The {c2['model']} is the more economical choice at ₹{c2['price']/100000:.1f} Lakh. "
            
            # Fuel / Mileage
            if c1['fuel_economy'] > c2['fuel_economy']:
                answer += f"For daily runs, the {c1['model']} offers better efficiency ({c1['fuel_economy']} km/l)."
            else:
                answer += f"The {c2['model']} is more fuel-efficient with {c2['fuel_economy']} km/l."
                
            return {
                "answer": answer,
                "cars": comp_cars.to_dict(orient='records')
            }

    # DEFAULT RECOMMENDATION LOGIC
    results = df.copy()
    filters_applied = []
    
    if intents["models"]:
        results = results[results['model'].isin(intents["models"])]
        filters_applied.append(f"specifically the {', '.join(intents['models'])}")

    if intents["brands"]:
        results = results[results['make'].isin(intents["brands"])]
        filters_applied.append(f"from {', '.join(intents['brands'])}")
    
    if intents["body_types"]:
        results = results[results['body_type'].isin(intents["body_types"])]
        filters_applied.append(f"{', '.join(intents['body_types'])} models")
        
    if intents["fuel_types"]:
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
