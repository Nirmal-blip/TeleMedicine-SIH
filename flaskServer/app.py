# -*- coding: utf-8 -*-
import os
import sys
# Fix Windows encoding issues
if os.name == 'nt':
    sys.stdout.reconfigure(encoding='utf-8')

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from datetime import datetime
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from thefuzz import process
import speech_recognition as sr
import pyttsx3
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load environment variables from backend .env file (if it exists)
backend_env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
if os.path.exists(backend_env_path):
    try:
        load_dotenv(backend_env_path)
    except UnicodeDecodeError:
        print(f"Warning: Could not load .env file due to encoding issues. Using fallback values.")

# Initialize text-to-speech engine (only if available)
try:
    engine = pyttsx3.init()
except:
    engine = None
    print("Text-to-speech engine not available")

# =============================================================================
# CHATBOT MODULE
# =============================================================================

# Google Gemini API Key (loaded from backend .env file or fallback)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyDlpNK9Csn0h-B5YHWM3LU2W3o6wJGlda0')
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables and no fallback available.")
    GEMINI_API_KEY = ""

GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# Function to get a response from Gemini API
def gemini_response(prompt):
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            response_data = response.json()
            try:
                return response_data["candidates"][0]["content"]["parts"][0]["text"]
            except KeyError:
                return "I'm sorry, but I couldn't process your request. Please try again."
        else:
            return f"Error: {response.status_code}, {response.text}"
    except Exception as e:
        return f"I'm sorry, there was an error processing your request: {str(e)}"

# Function to simulate streaming response (since Gemini doesn't support streaming)
def stream_response(text, chunk_size=6):
    """Simulate streaming by yielding chunks of text"""
    import time
    words = text.split()
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        if i > 0:
            chunk = " " + chunk
        yield chunk
        time.sleep(0.05)  # Small delay to simulate typing

# Recommendation Engine (Do's and Don'ts)
recommendations = {
    "fever": {
        "do": ["Stay hydrated", "Get plenty of rest", "Take paracetamol if necessary", "Monitor your temperature"],
        "dont": ["Avoid caffeine", "Don't overexert yourself", "Avoid cold drinks", "Don't ignore high fever"]
    },
    "cold": {
        "do": ["Drink warm fluids", "Rest well", "Use a humidifier", "Take vitamin C"],
        "dont": ["Avoid dairy", "Don't go outside without warm clothes", "Avoid cold beverages", "Don't touch your face often"]
    },
    "diabetes": {
        "do": ["Maintain a healthy diet", "Exercise regularly", "Monitor blood sugar levels", "Stay hydrated"],
        "dont": ["Avoid sugary foods", "Limit processed carbs", "Don't skip meals", "Avoid alcohol"]
    }
}

# Function to provide recommendations based on detected disease
def get_recommendations(disease):
    if disease in recommendations:
        dos = "\n✔ " + "\n✔ ".join(recommendations[disease]["do"])
        donts = "\n❌ " + "\n❌ ".join(recommendations[disease]["dont"])
        return f"**Do's:**{dos}\n\n**Don'ts:**{donts}"
    return "No specific recommendations available."

# Appointment booking function
def book_appointment():
    appointment_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return f"Your appointment is scheduled for {appointment_time}. Please check your messages for confirmation."

# =============================================================================
# MEDICINE RECOMMENDATION MODULE
# =============================================================================

# Load Medicine Data
medicine_df = None
tfidf = None
tfidf_matrix = None

def load_medicine_data():
    global medicine_df, tfidf, tfidf_matrix
    try:
        file_path = os.path.join(os.path.dirname(__file__), "A_Z_medicines_dataset_of_India.csv")
        medicine_df = pd.read_csv(file_path)
        
        medicine_df["short_composition2"] = medicine_df["short_composition2"].fillna("")
        medicine_df["full_composition"] = medicine_df["short_composition1"].str.lower() + " " + medicine_df["short_composition2"].str.lower()
        
        # Convert Composition to Vector
        tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
        tfidf_matrix = tfidf.fit_transform(medicine_df["full_composition"])
        
        print("Medicine data loaded successfully")
        return True
    except Exception as e:
        print(f"Error loading medicine data: {e}")
        return False

# Function to Match Closest Medicine
def find_best_match(partial_name):
    if medicine_df is None:
        return None
    
    result = process.extractOne(partial_name, medicine_df["name"])
    if result:
        best_match = result[0]  # Extract medicine name
        score = result[1]       # Extract similarity score
        return best_match if score > 70 else None
    return None

# Function to Recommend Alternatives
def recommend_medicine(partial_name, top_n=5):
    if medicine_df is None or tfidf_matrix is None:
        return None, "Medicine database not available."
    
    best_match = find_best_match(partial_name)
    if not best_match:
        return None, f"No close match found for '{partial_name}'."

    idx = medicine_df[medicine_df["name"] == best_match].index[0]
    sim_scores = cosine_similarity(tfidf_matrix[idx], tfidf_matrix).flatten()
    similar_indices = sim_scores.argsort()[-top_n-1:-1][::-1]
    recommendations = medicine_df.iloc[similar_indices][["name", "manufacturer_name", "price(₹)"]].to_dict(orient="records")

    return recommendations, best_match

# ----------------------------
# Load additional CSVs
# ----------------------------
try:
    diet_df = pd.read_csv(os.path.join(os.path.dirname(__file__), "diet.csv"))
    precautions_df = pd.read_csv(os.path.join(os.path.dirname(__file__), "precautions.csv"))
    workout_df = pd.read_csv(os.path.join(os.path.dirname(__file__), "workout.csv"))
    print("Additional CSV files loaded successfully")
except Exception as e:
    print(f"Warning: Could not load additional CSV files: {e}")
    diet_df = pd.DataFrame()
    precautions_df = pd.DataFrame()
    workout_df = pd.DataFrame()

def get_additional_recommendations(disease):
    try:
        diet = diet_df[diet_df["disease"] == disease]["recommendation"].tolist() if not diet_df.empty else []
        precautions = precautions_df[precautions_df["disease"] == disease]["recommendation"].tolist() if not precautions_df.empty else []
        workout = workout_df[workout_df["disease"] == disease]["recommendation"].tolist() if not workout_df.empty else []
        return {
            "diet": diet,
            "precautions": precautions,
            "workout": workout
        }
    except Exception as e:
        print(f"Error getting additional recommendations: {e}")
        return {
            "diet": [],
            "precautions": [],
            "workout": []
        }


# =============================================================================
# HOSPITAL MAPS MODULE
# =============================================================================

# Function to fetch nearby hospitals using OpenStreetMap Overpass API
def get_nearby_hospitals(lat, lon, radius=20000):  # 20km radius
    try:
        overpass_url = "http://overpass-api.de/api/interpreter"
        query = f"""
        [out:json];
        node["amenity"="hospital"](around:{radius},{lat},{lon});
        out;
        """
        response = requests.get(overpass_url, params={"data": query}, timeout=15)
        data = response.json()

        hospitals = []
        for element in data.get("elements", []):
            name = element.get("tags", {}).get("name", "Unknown Hospital")
            hospital_lat, hospital_lon = element["lat"], element["lon"]
            
            # Calculate Google Maps direction URL
            google_maps_url = f"https://www.google.com/maps/dir/?api=1&origin={lat},{lon}&destination={hospital_lat},{hospital_lon}&travelmode=driving"
            
            hospitals.append({
                "name": name, 
                "lat": hospital_lat, 
                "lon": hospital_lon,
                "directions_url": google_maps_url
            })
        
        return hospitals
    except Exception as e:
        print(f"Error fetching hospitals: {e}")
        return []

# =============================================================================
# API ROUTES
# =============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "services": {
            "chatbot": "available" if GEMINI_API_KEY else "unavailable - missing API key",
            "medicine_recommendations": "available" if medicine_df is not None else "unavailable",
            "hospital_maps": "available"
        },
        "config": {
            "gemini_api_configured": bool(GEMINI_API_KEY),
            "env_file_path": backend_env_path,
            "env_file_exists": os.path.exists(backend_env_path)
        },
        "timestamp": datetime.now().isoformat()
    })

# Chatbot endpoints
@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint with Gemini AI integration"""
    try:
        user_input = request.json.get('input')
        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        # Check if API key is configured
        if not GEMINI_API_KEY:
            return jsonify({"error": "Gemini API key not configured. Please add GEMINI_API_KEY to backend/.env file"}), 503

        # Get response from Gemini API
        response = gemini_response(user_input)

        # Extract disease from response
        detected_disease = None
        for disease in recommendations.keys():
            if disease in response.lower():
                detected_disease = disease
                break
        
        # Generate response based on disease detection
        if detected_disease:
            additional_recs = get_additional_recommendations(detected_disease)
            response = f"To treat {detected_disease}, follow these steps:\n\n{response}\n\n{get_recommendations(detected_disease)}"
            
            if additional_recs.get('diet'):
                response += f"\nDiet: {', '.join(additional_recs.get('diet', []))}"
            if additional_recs.get('precautions'):
                response += f"\nPrecautions: {', '.join(additional_recs.get('precautions', []))}"
            if additional_recs.get('workout'):
                response += f"\nWorkout: {', '.join(additional_recs.get('workout', []))}"

        # Automatically book an appointment
        appointment_info = book_appointment()
        response += f"\n\n{appointment_info}"

        # Convert response to speech if engine is available
        if engine:
            try:
                engine.say(response)
                engine.runAndWait()
            except:
                pass  # Ignore TTS errors

        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": f"Chat service error: {str(e)}"}), 500

@app.route('/api/chat/stream', methods=['POST'])
def chat_stream():
    """Streaming chat endpoint with Gemini AI integration"""
    try:
        user_input = request.json.get('input')
        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        # Check if API key is configured
        if not GEMINI_API_KEY:
            return jsonify({"error": "Gemini API key not configured"}), 503

        def generate():
            try:
                # Get response from Gemini API
                response = gemini_response(user_input)

                # Extract disease from response
                detected_disease = None
                for disease in recommendations.keys():
                    if disease in response.lower():
                        detected_disease = disease
                        break
                
                # Generate response based on disease detection
                if detected_disease:
                    additional_recs = get_additional_recommendations(detected_disease)
                    response = f"To treat {detected_disease}, follow these steps:\n\n{response}\n\n{get_recommendations(detected_disease)}"
                    
                    if additional_recs.get('diet'):
                        response += f"\nDiet: {', '.join(additional_recs.get('diet', []))}"
                    if additional_recs.get('precautions'):
                        response += f"\nPrecautions: {', '.join(additional_recs.get('precautions', []))}"
                    if additional_recs.get('workout'):
                        response += f"\nWorkout: {', '.join(additional_recs.get('workout', []))}"

                # Automatically book an appointment
                appointment_info = book_appointment()
                response += f"\n\n{appointment_info}"

                # Stream the response
                for chunk in stream_response(response):
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"
                
                # Signal end of stream
                yield f"data: {json.dumps({'done': True})}\n\n"
                
            except Exception as e:
                yield f"data: {json.dumps({'error': f'Chat service error: {str(e)}'})}\n\n"

        return app.response_class(
            generate(),
            mimetype='text/plain',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Content-Type': 'text/plain; charset=utf-8'
            }
        )
    except Exception as e:
        return jsonify({"error": f"Chat service error: {str(e)}"}), 500

@app.route('/api/voice-chat', methods=['POST'])
def voice_chat():
    """Voice input processing endpoint"""
    try:
        recognizer = sr.Recognizer()
        with sr.Microphone() as source:
            print("Listening...")
            audio = recognizer.listen(source, timeout=5)
            user_input = recognizer.recognize_google(audio)
            print("User said:", user_input)
            
            # Process the recognized speech through chat
            request.json = {'input': user_input}
            return chat()
    except sr.UnknownValueError:
        return jsonify({"error": "Could not understand audio"}), 400
    except sr.RequestError:
        return jsonify({"error": "Could not request results from Google Speech Recognition service"}), 500
    except Exception as e:
        return jsonify({"error": f"Voice processing error: {str(e)}"}), 500

# Medicine recommendation endpoints
@app.route("/api/medicine/recommend", methods=["POST"])
def recommend():
    """Medicine recommendation endpoint"""
    try:
        data = request.get_json()
        medicine_name = data.get("medicine_name", "")

        if not medicine_name:
            return jsonify({"error": "Medicine name is required"}), 400

        recommendations, best_match = recommend_medicine(medicine_name)
        if recommendations:
            return jsonify({"search": best_match, "recommendations": recommendations})
        else:
            return jsonify({"error": best_match}), 404
    except Exception as e:
        return jsonify({"error": f"Medicine recommendation error: {str(e)}"}), 500

# Hospital maps endpoints
@app.route('/api/hospitals', methods=['GET'])
def hospitals():
    """Get nearby hospitals endpoint"""
    try:
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)

        if lat is None or lon is None:
            return jsonify({"error": "Latitude and Longitude are required"}), 400

        hospitals_list = get_nearby_hospitals(lat, lon)
        return jsonify({"hospitals": hospitals_list})
    except Exception as e:
        return jsonify({"error": f"Hospital search error: {str(e)}"}), 500

# =============================================================================
# APPLICATION STARTUP
# =============================================================================

def initialize_app():
    """Initialize the Flask application with all services"""
    print("Initializing Flask AI/ML Services...")
    
    # Load medicine data
    if load_medicine_data():
        print("[OK] Medicine recommendation service initialized")
    else:
        print("[ERROR] Medicine recommendation service failed to initialize")
    
    print("[OK] Chatbot service initialized")
    print("[OK] Hospital maps service initialized")
    print("Flask AI/ML Services ready!")

if __name__ == "__main__":
    initialize_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
