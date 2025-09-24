# -*- coding: utf-8 -*-
import os
import sys
import io
from datetime import datetime

# Fix Windows encoding issues
if os.name == 'nt':
    sys.stdout.reconfigure(encoding='utf-8')

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from thefuzz import process
from PIL import Image
import pytesseract
from dotenv import load_dotenv
import pyttsx3

# -----------------------------
# Flask App Initialization
# -----------------------------
app = Flask(__name__)
CORS(app)

# Load environment variables
backend_env_path = os.path.join(os.path.dirname(__file__), '..', 'backend', '.env')
if os.path.exists(backend_env_path):
    load_dotenv(backend_env_path)

# Initialize text-to-speech engine
try:
    engine = pyttsx3.init()
except:
    engine = None
    print("Text-to-speech engine not available")

# -----------------------------
# GLOBAL CONFIGS
# -----------------------------
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# -----------------------------
# DATA AND RECOMMENDATION LOADING
# -----------------------------
medicine_df, tfidf, tfidf_matrix = None, None, None

def load_medicine_data():
    global medicine_df, tfidf, tfidf_matrix
    try:
        file_path = os.path.join(os.path.dirname(__file__), "A_Z_medicines_dataset_of_India.csv")
        medicine_df = pd.read_csv(file_path)
        medicine_df["short_composition2"] = medicine_df["short_composition2"].fillna("")
        medicine_df["full_composition"] = medicine_df["short_composition1"].str.lower() + " " + medicine_df["short_composition2"].str.lower()
        tfidf = TfidfVectorizer(stop_words="english", max_features=5000)
        tfidf_matrix = tfidf.fit_transform(medicine_df["full_composition"])
        print("Medicine data loaded successfully")
        return True
    except Exception as e:
        print(f"Error loading medicine data: {e}")
        return False

# Additional CSVs
def load_additional_csvs():
    try:
        diet_df = pd.read_csv(os.path.join(os.path.dirname(__file__), "diet.csv"))
        precautions_df = pd.read_csv(os.path.join(os.path.dirname(__file__), "precautions.csv"))
        workout_df = pd.read_csv(os.path.join(os.path.dirname(__file__), "workout.csv"))
        print("Additional CSV files loaded successfully")
        return diet_df, precautions_df, workout_df
    except Exception as e:
        print(f"Warning: Could not load additional CSVs: {e}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

diet_df, precautions_df, workout_df = load_additional_csvs()

# -----------------------------
# INITIALIZATION FUNCTION
# -----------------------------
def initialize_app():
    print("Initializing Flask AI/ML Services...")
    load_medicine_data()
    print("[OK] Chatbot and Hospital services initialized")
    print("Flask AI/ML Services ready!")

# -----------------------------
# HEALTH CHECK ENDPOINT
# -----------------------------
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "services": {
            "chatbot": "available" if GEMINI_API_KEY else "unavailable - missing API key",
            "medicine_recommendations": "available" if medicine_df is not None else "unavailable",
            "hospital_maps": "available",
            "ocr": "available" if pytesseract.get_tesseract_version() else "unavailable"
        },
        "timestamp": datetime.now().isoformat()
    })

# -----------------------------
# ROOT ENDPOINT
# -----------------------------
@app.route('/', methods=['GET'])
def index():
    return "Telemedicine API is live! Use /health or /api endpoints."

# -----------------------------
# MEDICINE RECOMMENDATION ENDPOINT
# -----------------------------
@app.route("/api/medicine/recommend", methods=["POST"])
def recommend():
    data = request.get_json()
    medicine_name = data.get("medicine_name", "")
    if not medicine_name:
        return jsonify({"error": "Medicine name is required"}), 400

    # Fuzzy match
    result = process.extractOne(medicine_name, medicine_df["name"]) if medicine_df is not None else None
    if result and result[1] > 70:
        best_match = result[0]
        idx = medicine_df[medicine_df["name"] == best_match].index[0]
        sim_scores = cosine_similarity(tfidf_matrix[idx], tfidf_matrix).flatten()
        top_indices = sim_scores.argsort()[-6:-1][::-1]
        recommendations = medicine_df.iloc[top_indices][["name", "manufacturer_name", "price(₹)"]].to_dict(orient="records")
        return jsonify({"search": best_match, "recommendations": recommendations})
    else:
        return jsonify({"error": f"No close match found for '{medicine_name}'"}), 404

# -----------------------------
# HOSPITALS ENDPOINT
# -----------------------------
@app.route('/api/hospitals', methods=['GET'])
def hospitals():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat is None or lon is None:
        return jsonify({"error": "Latitude and Longitude are required"}), 400
    try:
        overpass_url = "http://overpass-api.de/api/interpreter"
        query = f"""
        [out:json];
        node["amenity"="hospital"](around:20000,{lat},{lon});
        out;
        """
        response = requests.get(overpass_url, params={"data": query}, timeout=15)
        data = response.json()
        hospitals_list = [
            {
                "name": el.get("tags", {}).get("name", "Unknown Hospital"),
                "lat": el["lat"],
                "lon": el["lon"],
                "maps_url": f"https://www.google.com/maps/search/?api=1&query={el['lat']},{el['lon']}"
            } for el in data.get("elements", [])
        ]
        return jsonify({"hospitals": hospitals_list})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# RUN APP
# -----------------------------
if __name__ == "__main__":
    initialize_app()
    port = int(os.environ.get("PORT", 8000))  # Use Render's dynamic port
    app.run(debug=True, host='0.0.0.0', port=port)
