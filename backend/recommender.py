import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler, OneHotEncoder, MinMaxScaler
from sklearn.compose import ColumnTransformer
import numpy as np

class CarRecommender:
    def __init__(self, data_path):
        self.df = pd.read_csv(data_path)
        
        # Initial cleanup: Drop rows that are completely empty or missing critical fields
        self.df = self.df.dropna(subset=['name', 'brand', 'price'])
        
        # Schema Mapping for the new final_latest_variety_500.csv
        column_mapping = {
            'brand': 'make',
            'name': 'model',
            'mileage': 'fuel_economy',
            'engine_cc': 'engine_size'
        }
        self.df = self.df.rename(columns=column_mapping)
        
        # Data Cleaning
        # Convert numeric columns, forcing errors to NaN then filling
        numeric_cols = ['price', 'fuel_economy', 'engine_size', 'seating_capacity', 'safety_rating', 'year']
        for col in numeric_cols:
            if col in self.df.columns:
                self.df[col] = pd.to_numeric(self.df[col], errors='coerce')
                self.df[col] = self.df[col].fillna(self.df[col].mean() if not self.df[col].isna().all() else 0)
        
        # Fill missing categoricals
        cat_cols = ['make', 'model', 'body_type', 'fuel_type', 'transmission', 'use_case', 'features']
        for col in cat_cols:
            if col in self.df.columns:
                self.df[col] = self.df[col].fillna('Unknown')
        
        # Guaranteed unique ID for React keys and lookups
        self.df['id'] = range(len(self.df))
        
        # Clean model name to avoid double brand (e.g., "Toyota Toyota Fortuner" -> "Toyota Fortuner")
        self.df['model'] = self.df.apply(lambda x: str(x['model']).replace(str(x['make']) + ' ', ''), axis=1)
        
        # Ensure description exists for the frontend
        if 'description' not in self.df.columns:
            self.df['description'] = self.df.apply(
                lambda x: f"The {int(x['year'])} {x['make']} {x['model']} is a {x['body_type']} perfect for {x['use_case']}. It features {x.get('features', 'advanced tech')} and a {x['engine_size']}cc engine.", 
                axis=1
            )

        # Engine size is already correctly defined. We removed the incorrect horsepower alias.

        # Final JSON-safe cleanup for API stability
        self.df = self.df.replace([np.inf, -np.inf], np.nan)
        for col in self.df.columns:
            if self.df[col].dtype == 'object':
                self.df[col] = self.df[col].fillna('')
            else:
                self.df[col] = self.df[col].fillna(0)

        self.processed_data = None
        self.transformer = None
        self._prepare_data()

    def _prepare_data(self):
        # Selected features for recommendations
        categorical_features = ['make', 'body_type', 'fuel_type', 'transmission']
        numerical_features = ['price', 'engine_size', 'seating_capacity', 'fuel_economy', 'safety_rating']
        
        # Transformer
        # Preprocessing: OneHot for cats, StandardScale for nums
        self.transformer = ColumnTransformer([
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', StandardScaler(), numerical_features)
        ])
        
        # We also need features like "Sunroof" to be part of the logic
        # For simplicity, we'll use the main categorical and numerical features for the similarity matrix
        self.matrix = self.transformer.fit_transform(self.df)

    def recommend(self, user_preferences, top_n=6):
        """
        user_preferences: dict with keys matching columns + desired values
        """
        # Create a dummy dataframe for the user preference
        pref_df = pd.DataFrame([user_preferences])
        
        # Fill missing values with defaults from dataset
        for col in ['make', 'body_type', 'fuel_type', 'transmission', 'price', 'engine_size', 'seating_capacity', 'fuel_economy', 'safety_rating']:
            if col not in pref_df.columns:
                if self.df[col].dtype != 'object':
                    pref_df[col] = self.df[col].mean()
                else:
                    pref_df[col] = self.df[col].mode()[0]
        
        # Vectorize user preference
        user_vector = self.transformer.transform(pref_df)
        
        # Calculate cosine similarity scores
        similarities = cosine_similarity(user_vector, self.matrix).flatten()
        
        # Add similarities to a copy of the dataframe
        results = self.df.copy()
        results['score'] = similarities
        
        # Sort, deduplicate, and return top N
        recommendations = results.sort_values(by='score', ascending=False)
        recommendations = recommendations.drop_duplicates(subset=['make', 'model'], keep='first')
        recommendations = recommendations.head(top_n)
        
        # Add reasons based on preference match
        recommendations['reason'] = recommendations.apply(lambda row: self._generate_reason(row, user_preferences), axis=1)
        
        return recommendations.to_dict(orient='records')

    def _generate_reason(self, row, pref):
        reasons = []
        if 'body_type' in pref and row['body_type'] == pref['body_type']:
            reasons.append(f"Ideal {row['body_type']} configuration")
        if 'fuel_type' in pref and row['fuel_type'] == pref['fuel_type']:
            reasons.append(f"Matches {row['fuel_type']} efficiency preference")
        if 'price' in pref:
            # Adjusting tolerance for the new price scale
            if abs(row['price'] - pref['price']) < 100000:
                reasons.append("Optimized for your budget segment")
            elif row['price'] < pref['price']:
                reasons.append("Excellent value-to-cost ratio")
        
        if row['safety_rating'] >= 5:
            reasons.append("Top-tier safety architecture")
        
        if pref.get('fuel_economy', 0) >= 35 and row['fuel_economy'] > self.df['fuel_economy'].mean():
            reasons.append("High-efficiency powertrain")

        return " | ".join(reasons[:2]) if reasons else "Selected for high structural compatibility"

    def get_analytics(self):
        analytics = {
            'avg_price_by_make': self.df.groupby('make')['price'].mean().fillna(0).to_dict(),
            'body_type_distribution': self.df['body_type'].value_counts().to_dict(),
            'fuel_type_distribution': self.df['fuel_type'].value_counts().to_dict(),
            'avg_mileage_by_fuel': self.df.groupby('fuel_type')['fuel_economy'].mean().fillna(0).to_dict(),
            'price_vs_hp': self.df[['price', 'engine_size', 'model']].fillna(0).to_dict(orient='records')
        }
        return analytics

    def get_car_by_id(self, car_id):
        match = self.df[self.df['id'] == car_id]
        if match.empty:
            return None
        return match.to_dict(orient='records')[0]

    def compare_cars(self, car_ids):
        return self.df[self.df['id'].isin(car_ids)].to_dict(orient='records')
