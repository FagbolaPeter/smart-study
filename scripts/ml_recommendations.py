import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import json
from datetime import datetime, timedelta
import random

# Generate sample study data for training
def generate_sample_data(n_samples=1000):
    """Generate synthetic study data for ML training"""
    data = []
    
    for _ in range(n_samples):
        # User characteristics
        study_hours_per_day = random.uniform(2, 8)
        difficulty_preference = random.uniform(0.3, 1.0)
        time_of_day_pref = random.choice([0, 1, 2])  # 0=morning, 1=afternoon, 2=evening
        
        # Study session characteristics
        session_duration = random.uniform(0.5, 3.0)  # hours
        subject_difficulty = random.uniform(0.4, 1.0)
        break_frequency = random.uniform(0.1, 0.5)  # breaks per hour
        
        # Calculate performance score (target variable)
        performance = (
            study_hours_per_day * 0.2 +
            (1 - abs(difficulty_preference - subject_difficulty)) * 0.3 +
            session_duration * 0.15 +
            (1 - break_frequency) * 0.1 +
            random.uniform(-0.2, 0.2)  # noise
        )
        performance = max(0, min(1, performance))  # clamp between 0 and 1
        
        data.append({
            'study_hours_per_day': study_hours_per_day,
            'difficulty_preference': difficulty_preference,
            'time_of_day_pref': time_of_day_pref,
            'session_duration': session_duration,
            'subject_difficulty': subject_difficulty,
            'break_frequency': break_frequency,
            'performance': performance
        })
    
    return pd.DataFrame(data)

# Train ML models
def train_models():
    """Train decision tree and linear regression models"""
    print("Generating training data...")
    df = generate_sample_data(1000)
    
    # Prepare features and target
    features = ['study_hours_per_day', 'difficulty_preference', 'time_of_day_pref', 
                'session_duration', 'subject_difficulty', 'break_frequency']
    X = df[features]
    y = df['performance']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features for linear regression
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Decision Tree
    print("Training Decision Tree...")
    dt_model = DecisionTreeRegressor(max_depth=10, random_state=42)
    dt_model.fit(X_train, y_train)
    dt_score = dt_model.score(X_test, y_test)
    print(f"Decision Tree R² Score: {dt_score:.3f}")
    
    # Train Linear Regression
    print("Training Linear Regression...")
    lr_model = LinearRegression()
    lr_model.fit(X_train_scaled, y_train)
    lr_score = lr_model.score(X_test_scaled, y_test)
    print(f"Linear Regression R² Score: {lr_score:.3f}")
    
    return {
        'decision_tree': dt_model,
        'linear_regression': lr_model,
        'scaler': scaler,
        'feature_names': features,
        'dt_score': dt_score,
        'lr_score': lr_score
    }

# Generate study recommendations
def generate_recommendations(user_profile, models):
    """Generate personalized study recommendations"""
    
    # Extract user preferences
    study_hours = user_profile.get('preferred_study_hours', 4)
    difficulty_pref = user_profile.get('difficulty_preference', 0.7)
    time_pref = user_profile.get('time_of_day_preference', 1)
    
    recommendations = []
    
    # Test different session configurations
    for duration in [1.0, 1.5, 2.0, 2.5]:
        for difficulty in [0.4, 0.6, 0.8]:
            for break_freq in [0.2, 0.3, 0.4]:
                
                # Prepare input for prediction
                input_data = np.array([[
                    study_hours,
                    difficulty_pref,
                    time_pref,
                    duration,
                    difficulty,
                    break_freq
                ]])
                
                # Get predictions from both models
                dt_pred = models['decision_tree'].predict(input_data)[0]
                
                input_scaled = models['scaler'].transform(input_data)
                lr_pred = models['linear_regression'].predict(input_scaled)[0]
                
                # Average the predictions
                avg_performance = (dt_pred + lr_pred) / 2
                
                recommendations.append({
                    'session_duration': duration,
                    'subject_difficulty': difficulty,
                    'break_frequency': break_freq,
                    'predicted_performance': avg_performance,
                    'optimal_time': get_optimal_time(time_pref)
                })
    
    # Sort by predicted performance and return top recommendations
    recommendations.sort(key=lambda x: x['predicted_performance'], reverse=True)
    return recommendations[:5]

def get_optimal_time(time_pref):
    """Convert time preference to readable format"""
    time_map = {
        0: "Morning (8-11 AM)",
        1: "Afternoon (1-4 PM)", 
        2: "Evening (6-9 PM)"
    }
    return time_map.get(time_pref, "Afternoon (1-4 PM)")

# Main execution
if __name__ == "__main__":
    print("🤖 Training SmartStudy ML Models...")
    models = train_models()
    
    # Example user profile
    sample_user = {
        'preferred_study_hours': 5,
        'difficulty_preference': 0.8,
        'time_of_day_preference': 1
    }
    
    print("\n📊 Generating recommendations for sample user...")
    recommendations = generate_recommendations(sample_user, models)
    
    print("\n🎯 Top Study Recommendations:")
    for i, rec in enumerate(recommendations, 1):
        print(f"{i}. Duration: {rec['session_duration']}h, "
              f"Difficulty: {rec['subject_difficulty']:.1f}, "
              f"Performance: {rec['predicted_performance']:.3f}, "
              f"Time: {rec['optimal_time']}")
    
    print("\n✅ ML models trained successfully!")
