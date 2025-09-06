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
import pytesseract
from PIL import Image
import io

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
    # Enhanced prompt for better medical formatting
    enhanced_prompt = f"""You are a professional medical AI assistant. Please provide a well-structured, professional response in English only.

User Question: {prompt}

Please format your response with:
- Clear medical information
- Professional terminology
- Bullet points for lists
- Include disclaimer about consulting healthcare professionals
- Keep response concise and informative
- NO mixed languages - English only

Provide practical medical guidance while emphasizing the need for professional medical consultation."""
    
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": enhanced_prompt}]}]}
    
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=payload, timeout=10)
        
        if response.status_code == 200:
            response_data = response.json()
            try:
                ai_response = response_data["candidates"][0]["content"]["parts"][0]["text"]
                return format_medical_response(ai_response)
            except KeyError:
                return "I'm sorry, but I couldn't process your request. Please try again."
        else:
            return f"Error: {response.status_code}, {response.text}"
    except Exception as e:
        return f"I'm sorry, there was an error processing your request: {str(e)}"

def format_medical_response(response):
    """Format and clean the medical response for better readability"""
    import re
    
    # Remove any mixed language content and clean up formatting
    cleaned_response = response
    
    # Remove non-English characters and common mixed language patterns
    cleaned_response = re.sub(r'[^\x00-\x7F]+', '', cleaned_response)  # Remove non-ASCII
    
    # Clean up excessive whitespace
    cleaned_response = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned_response)
    cleaned_response = re.sub(r'\s+', ' ', cleaned_response)
    cleaned_response = cleaned_response.strip()
    
    return cleaned_response

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

# Function to find medicine name from extracted OCR text
def find_best_match_medicine(extracted_text):
    """Find the best matching medicine name from OCR extracted text"""
    if medicine_df is None:
        return None
    
    # Clean the extracted text
    text_lower = extracted_text.lower()
    words = text_lower.split()
    
    # Try to find medicine names in the extracted text
    best_match = None
    best_score = 0
    
    # Check each word and combination of words
    for i in range(len(words)):
        for j in range(i + 1, min(i + 4, len(words) + 1)):  # Check up to 3-word combinations
            phrase = " ".join(words[i:j])
            if len(phrase) > 2:  # Only check phrases longer than 2 characters
                result = process.extractOne(phrase, medicine_df["name"])
                if result and result[1] > best_score and result[1] > 60:  # Lower threshold for OCR
                    best_match = result[0]
                    best_score = result[1]
    
    return best_match if best_score > 60 else None

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
            
            # Generate Google Maps URL as per Maps.py format
            maps_url = f"https://www.google.com/maps/search/?api=1&query={hospital_lat},{hospital_lon}"
            
            hospitals.append({
                "name": name, 
                "lat": hospital_lat, 
                "lon": hospital_lon,
                "maps_url": maps_url
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
    # Test OCR availability
    ocr_status = "unavailable"
    try:
        # Create a simple test image with text
        from PIL import Image, ImageDraw, ImageFont
        test_img = Image.new('RGB', (200, 100), color='white')
        draw = ImageDraw.Draw(test_img)
        draw.text((10, 30), "TEST", fill='black')
        
        # Test OCR
        test_text = pytesseract.image_to_string(test_img).strip()
        ocr_status = "available" if test_text else "limited"
    except Exception as e:
        ocr_status = f"unavailable - {str(e)}"
    
    return jsonify({
        "status": "healthy",
        "services": {
            "chatbot": "available" if GEMINI_API_KEY else "unavailable - missing API key",
            "medicine_recommendations": "available" if medicine_df is not None else "unavailable",
            "hospital_maps": "available",
            "ocr": ocr_status
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
        
        # Generate formatted response based on disease detection
        if detected_disease:
            additional_recs = get_additional_recommendations(detected_disease)
            formatted_response = f"**{detected_disease.title()} Treatment Guidelines**\n\n{response}\n\n"
            
            # Add structured recommendations
            recommendations_text = get_recommendations(detected_disease)
            formatted_response += f"**Immediate Care Instructions:**\n{recommendations_text}\n\n"
            
            # Add additional recommendations with proper formatting
            if additional_recs.get('diet'):
                diet_items = '\n• '.join(additional_recs.get('diet', []))
                formatted_response += f"**📋 Dietary Recommendations:**\n• {diet_items}\n\n"
            if additional_recs.get('precautions'):
                precaution_items = '\n• '.join(additional_recs.get('precautions', []))
                formatted_response += f"**⚠️ Important Precautions:**\n• {precaution_items}\n\n"
            if additional_recs.get('workout'):
                workout_items = '\n• '.join(additional_recs.get('workout', []))
                formatted_response += f"**💪 Exercise Guidelines:**\n• {workout_items}\n\n"
            
            response = formatted_response
        
        # Add professional disclaimer
        response += "\n**⚠️ Medical Disclaimer:**\nThis information is for educational purposes only. Please consult with a healthcare professional for proper medical diagnosis and treatment.\n\n"

        # Automatically book an appointment with better formatting
        appointment_info = book_appointment()
        response += f"**📅 Appointment Information:**\n{appointment_info}"

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
                
                # Generate formatted response based on disease detection
                if detected_disease:
                    additional_recs = get_additional_recommendations(detected_disease)
                    formatted_response = f"**{detected_disease.title()} Treatment Guidelines**\n\n{response}\n\n"
                    
                    # Add structured recommendations
                    recommendations_text = get_recommendations(detected_disease)
                    formatted_response += f"**Immediate Care Instructions:**\n{recommendations_text}\n\n"
                    
                    # Add additional recommendations with proper formatting
                    if additional_recs.get('diet'):
                        diet_items = '\n• '.join(additional_recs.get('diet', []))
                        formatted_response += f"**📋 Dietary Recommendations:**\n• {diet_items}\n\n"
                    if additional_recs.get('precautions'):
                        precaution_items = '\n• '.join(additional_recs.get('precautions', []))
                        formatted_response += f"**⚠️ Important Precautions:**\n• {precaution_items}\n\n"
                    if additional_recs.get('workout'):
                        workout_items = '\n• '.join(additional_recs.get('workout', []))
                        formatted_response += f"**💪 Exercise Guidelines:**\n• {workout_items}\n\n"
                    
                    response = formatted_response
                
                # Add professional disclaimer
                response += "\n**⚠️ Medical Disclaimer:**\nThis information is for educational purposes only. Please consult with a healthcare professional for proper medical diagnosis and treatment.\n\n"

                # Automatically book an appointment with better formatting
                appointment_info = book_appointment()
                response += f"**📅 Appointment Information:**\n{appointment_info}"

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

@app.route("/api/medicine/recommend-image", methods=["POST"])
def recommend_image():
    """OCR-based medicine recommendation endpoint"""
    try:
        if "file" not in request.files:
            return jsonify({"error": "Image file is required"}), 400

        file = request.files["file"]
        if not file or file.filename == '':
            return jsonify({"error": "Invalid file"}), 400

        # Validate file type
        if not file.content_type.startswith('image/'):
            return jsonify({"error": "Please upload a valid image file"}), 400

        # Read and preprocess image
        image_data = file.read()
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize image if too small (improve OCR accuracy)
        width, height = image.size
        if width < 300 or height < 300:
            # Scale up small images
            scale_factor = max(300/width, 300/height)
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Extract text using OCR with custom configuration
        custom_config = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '
        
        try:
            # Try with custom config first
            extracted_text = pytesseract.image_to_string(image, config=custom_config).strip()
            
            # If no text found, try with default settings
            if not extracted_text:
                extracted_text = pytesseract.image_to_string(image).strip()
                
            # If still no text, try with different PSM mode
            if not extracted_text:
                extracted_text = pytesseract.image_to_string(image, config='--psm 8').strip()
                
        except Exception as ocr_error:
            print(f"OCR Error: {ocr_error}")
            error_msg = str(ocr_error)
            if "tesseract" in error_msg.lower() or "not found" in error_msg.lower():
                return jsonify({
                    "error": "Tesseract OCR engine is not installed or not found in PATH.",
                    "suggestions": [
                        "Install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki",
                        "For Windows: Download and install from the GitHub releases",
                        "For macOS: Run 'brew install tesseract'",
                        "For Ubuntu: Run 'sudo apt install tesseract-ocr'",
                        "Make sure Tesseract is added to your system PATH",
                        "Restart the Flask server after installation"
                    ]
                }), 500
            else:
                return jsonify({"error": f"OCR processing failed: {error_msg}"}), 500
        
        if not extracted_text:
            return jsonify({
                "error": "No text could be extracted from the image. Please try with a clearer image with visible text.",
                "suggestions": [
                    "Ensure the image has good lighting",
                    "Make sure text is clearly visible",
                    "Try cropping the image to focus on the medicine name",
                    "Use a higher resolution image"
                ]
            }), 400

        print(f"Extracted text: {extracted_text}")  # Debug log

        # Try to find a medicine name in extracted text
        best_match = find_best_match_medicine(extracted_text)
        if not best_match:
            return jsonify({
                "error": "No valid medicine name detected from image",
                "extracted_text": extracted_text,
                "suggestions": [
                    "Try uploading an image with a clearer view of the medicine name",
                    "Ensure the medicine name is in English",
                    "Check if the text in the image is readable"
                ]
            }), 404

        # Recommend alternatives
        recommendations, matched_name = recommend_medicine(best_match)
        if recommendations:
            return jsonify({
                "extracted_text": extracted_text,
                "search": matched_name,
                "recommendations": recommendations
            })
        else:
            return jsonify({"error": matched_name}), 404
    except Exception as e:
        print(f"OCR endpoint error: {str(e)}")  # Debug log
        return jsonify({"error": f"OCR medicine recommendation error: {str(e)}"}), 500

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
    app.run(debug=True, host='0.0.0.0', port=8000)
