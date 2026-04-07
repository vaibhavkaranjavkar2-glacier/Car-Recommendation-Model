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
        # and remove trailing years (e.g. "Virtus 2023" -> "Virtus") for better deduplication
        self.df['model'] = self.df.apply(lambda x: str(x['model']).replace(str(x['make']) + ' ', '').strip(), axis=1)
        self.df['model'] = self.df['model'].str.replace(r'\s*\b\d{4}\b\s*$', '', regex=True).str.strip()
        
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
        
        # New Strict Filtering for Categorical Preferences: Must match exactly
        for pref in ['body_type', 'fuel_type', 'transmission']:
            val = user_preferences.get(pref)
            if val and val not in ['All', 'Any']:
                # Filter strictly by this category
                results = results[results[pref] == val]

        # New Strict Filtering for Electric Cars: IGNORE ALL OTHER PARAMETERS (Fallback logic)
        if user_preferences.get('fuel_type') == 'Electric':
             results = results[results['fuel_type'] == 'Electric']
        
        # Sort, deduplicate, and return top N
        recommendations = results.sort_values(by='score', ascending=False)
        recommendations = recommendations.drop_duplicates(subset=['make', 'model'], keep='first')
        recommendations = recommendations.head(top_n if user_preferences.get('fuel_type') != 'Electric' else max(top_n, len(results)))
        
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
        # 1. Dataset Overview
        overview = {
            'total_cars': int(len(self.df)),
            'total_brands': int(self.df['make'].nunique()),
            'price_min': float(self.df['price'].min()),
            'price_max': float(self.df['price'].max()),
            'avg_safety': float(self.df['safety_rating'].mean()),
            'fuel_types_count': int(self.df['fuel_type'].nunique())
        }

        # 2. Feature Distributions
        body_dist = self.df['body_type'].value_counts().reset_index()
        body_dist.columns = ['name', 'value']
        
        fuel_dist = self.df['fuel_type'].value_counts().reset_index()
        fuel_dist.columns = ['name', 'value']

        trans_dist = self.df['transmission'].value_counts().reset_index()
        trans_dist.columns = ['name', 'value']

        # 3. Price vs Mileage Scatter (Sample 50 for performance)
        scatter = self.df.sample(min(100, len(self.df)))[['price', 'fuel_economy', 'model', 'make']].to_dict(orient='records')

        # 4. Top Brands by Safety
        safety_by_brand = self.df.groupby('make')['safety_rating'].mean().sort_values(ascending=False).head(10).reset_index()
        safety_by_brand.columns = ['brand', 'safety']

        # 4.1 Average Price & Popularity by Brand
        brand_stats = self.df.groupby('make').agg({
            'price': 'mean',
            'id': 'count'
        }).reset_index().rename(columns={'id': 'popularity', 'price': 'avg_price'}).sort_values(by='popularity', ascending=False).head(12)

        # 5. Model Evaluation (Performance Score Distribution)
        # We'll simulate 50 "recommendation sessions" with random preferences to see the score spread
        all_scores = []
        for _ in range(20):
            # Pick a random "user" profile
            row = self.df.sample(1).iloc[0]
            sims = cosine_similarity(self.transformer.transform(pd.DataFrame([row.to_dict()])), self.matrix).flatten()
            all_scores.extend(sims.tolist())
        
        # Create a histogram frequencies
        counts, bins = np.histogram(all_scores, bins=10, range=(0.5, 1.0))
        eval_scores = [{'score': f"{bins[i]:.1f}-{bins[i+1]:.1f}", 'count': int(counts[i])} for i in range(len(counts))]

        analytics = {
            'overview': overview,
            'distributions': {
                'body': body_dist.to_dict(orient='records'),
                'fuel': fuel_dist.to_dict(orient='records'),
                'transmission': trans_dist.to_dict(orient='records')
            },
            'safety': safety_by_brand.to_dict(orient='records'),
            'brand_overview': brand_stats.to_dict(orient='records'),
            'scatter': scatter,
            'performance': eval_scores,
            'recommended_popular': self.df.sort_values(by='safety_rating', ascending=False).head(5)[['make', 'model', 'safety_rating']].to_dict(orient='records')
        }
        return analytics

    def get_car_by_id(self, car_id):
        match = self.df[self.df['id'] == car_id]
        if match.empty:
            return None
        return match.to_dict(orient='records')[0]

    def compare_cars(self, car_ids):
        return self.df[self.df['id'].isin(car_ids)].to_dict(orient='records')
