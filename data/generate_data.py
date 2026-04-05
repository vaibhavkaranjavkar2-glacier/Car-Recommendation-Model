import pandas as pd
import numpy as np

# Seed for reproducibility
np.random.seed(42)

makes = ['Toyota', 'Honda', 'Ford', 'Tesla', 'BMW', 'Mercedes-Benz', 'Audi', 'Hyundai', 'Kia', 'Chevrolet']
models = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape', 'Mach-E'],
    'Tesla': ['Model 3', 'Model Y', 'Model S', 'Model X'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'M3'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'S-Class'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7', 'e-tron'],
    'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Ioniq 5'],
    'Kia': ['Forte', 'K5', 'Sportage', 'Sorento', 'EV6'],
    'Chevrolet': ['Silverado', 'Equinox', 'Tahoe', 'Malibu', 'Corvette']
}

body_types = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Truck', 'Coupe']
fuel_types = ['Petrol', 'Diesel', 'Electric', 'Hybrid']
transmissions = ['Automatic', 'Manual']
features_list = ['Sunroof', 'Leather Seats', 'Cruise Control', 'Backup Camera', 'Navigation System', 'Heated Seats', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Blind Spot Monitor']

data = []
for i in range(1, 501):  # Generate 500 cars
    make = np.random.choice(makes)
    model = np.random.choice(models[make])
    year = np.random.randint(2019, 2025)
    
    # Logic to make price somewhat realistic based on make
    base_price = 20000
    if make in ['BMW', 'Mercedes-Benz', 'Audi', 'Tesla']:
        base_price = 45000
    elif make == 'Chevrolet' and model in ['Silverado', 'Tahoe', 'Corvette']:
        base_price = 55000
    
    price = base_price + np.random.randint(5000, 30000)
    
    body_type = 'SUV' if 'X' in model or 'Q' in model or 'Explorer' in model or 'Tucson' in model or 'RAV4' in model or 'CR-V' in model else np.random.choice(body_types)
    if 'Model' in model: body_type = 'Sedan' if '3' in model or 'S' in model else 'SUV'
    if model == 'F-150' or model == 'Silverado': body_type = 'Truck'
    if model == 'Corvette' or model == 'Mustang' or model == 'M3': body_type = 'Coupe'
    
    fuel_type = 'Electric' if make == 'Tesla' or 'e-tron' in model or 'Ioniq 5' in model or 'EV6' in model or 'Mach-E' in model else np.random.choice(fuel_types, p=[0.6, 0.1, 0.05, 0.25])
    
    transmission = 'Automatic' if fuel_type == 'Electric' else np.random.choice(transmissions, p=[0.8, 0.2])
    
    engine_size = 0.0 if fuel_type == 'Electric' else round(np.random.uniform(1.2, 5.0), 1)
    horsepower = np.random.randint(120, 600)
    if fuel_type == 'Electric': horsepower = np.random.randint(250, 800)
    
    seating_capacity = 5
    if body_type == 'SUV' and np.random.random() > 0.6: seating_capacity = 7
    if body_type == 'Truck': seating_capacity = 3 if np.random.random() > 0.7 else 5
    if body_type == 'Coupe': seating_capacity = 2 if np.random.random() > 0.5 else 4
    
    fuel_economy = np.random.randint(20, 45)
    if fuel_type == 'Electric': fuel_economy = np.random.randint(90, 130) # MPGe
    if body_type == 'Truck': fuel_economy = np.random.randint(15, 25)
    
    safety_rating = np.random.randint(3, 6)
    
    # Randomly pick 3-6 features
    num_features = np.random.randint(3, 7)
    selected_features = np.random.choice(features_list, num_features, replace=False)
    features_str = ', '.join(selected_features)
    
    description = f"The {year} {make} {model} is a premium {body_type} offering exceptional performance and modern features like {selected_features[0]} and {selected_features[1]}."
    
    data.append([
        i, make, model, year, price, body_type, fuel_type, transmission, 
        engine_size, horsepower, seating_capacity, fuel_economy, safety_rating, 
        features_str, description
    ])

df = pd.DataFrame(data, columns=[
    'id', 'make', 'model', 'year', 'price', 'body_type', 'fuel_type', 'transmission', 
    'engine_size', 'horsepower', 'seating_capacity', 'fuel_economy', 'safety_rating', 
    'features', 'description'
])

df.to_csv('c:/Users/Vaibhav/Videos/car-recommender/data/car_dataset.csv', index=False)
print("Dataset generated successfully!")
