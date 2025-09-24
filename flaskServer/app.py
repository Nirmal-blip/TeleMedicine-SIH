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

# #initialised app
# initialize_app()


# Google Gemini API Key (loaded from backend .env file or fallback)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBjQmMBZT7eBD6oos14CJLbPvC-e22mDFw')
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables and no fallback available.")
    GEMINI_API_KEY = ""

GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# Function to get a response from Gemini API
def gemini_response(prompt, language='en', response_language='en'):
    # Language-specific prompts for Indian languages
    language_prompts = {
        'hi': {
            'system': 'आप एक पेशेवर मेडिकल AI सहायक हैं। कृपया हिंदी में एक अच्छी तरह से संरचित, पेशेवर उत्तर प्रदान करें।',
            'instructions': '''कृपया अपना उत्तर इस तरह से प्रारूपित करें:
- स्पष्ट चिकित्सा जानकारी
- पेशेवर शब्दावली
- सूची के लिए बुलेट पॉइंट्स
- स्वास्थ्य पेशेवरों से परामर्श लेने की अस्वीकरण शामिल करें
- उत्तर संक्षिप्त और जानकारीपूर्ण रखें
- केवल हिंदी में उत्तर दें

पेशेवर चिकित्सा परामर्श की आवश्यकता पर जोर देते हुए व्यावहारिक चिकित्सा मार्गदर्शन प्रदान करें।'''
        },
        'ta': {
            'system': 'நீங்கள் ஒரு தொழில்முறை மருத்துவ AI உதவியாளர். தயவுசெய்து தமிழில் நல்ல முறையில் கட்டமைக்கப்பட்ட, தொழில்முறை பதிலை வழங்கவும்.',
            'instructions': '''தயவுசெய்து உங்கள் பதிலை இப்படி வடிவமைக்கவும்:
- தெளிவான மருத்துவ தகவல்கள்
- தொழில்முறை சொற்கள்
- பட்டியலுக்கு புள்ளிகள்
- சுகாதார நிபுணர்களிடம் ஆலோசனை பெறுவது பற்றிய மறுப்பு அறிக்கை
- பதிலை சுருக்கமாகவும் தகவல் நிறைந்ததாகவும் வைக்கவும்
- தமிழில் மட்டுமே பதிலளிக்கவும்

தொழில்முறை மருத்துவ ஆலோசனையின் தேவையை வலியுறுத்தும் போது நடைமுறை மருத்துவ வழிகாட்டுதலை வழங்கவும்.'''
        },
        'te': {
            'system': 'మీరు ఒక వృత్తిపరమైన వైద్య AI సహాయకుడు. దయచేసి తెలుగులో బాగా నిర్మాణాత్మకమైన, వృత్తిపరమైన సమాధానం అందించండి.',
            'instructions': '''దయచేసి మీ సమాధానాన్ని ఈ విధంగా ఫార్మాట్ చేయండి:
- స్పష్టమైన వైద్య సమాచారం
- వృత్తిపరమైన పరిభాష
- జాబితాల కోసం బుల్లెట్ పాయింట్లు
- ఆరోగ్య నిపుణులను సంప్రదించడం గురించి నిరాకరణ చేర్చండి
- సమాధానాన్ని సంక్షిప్తంగా మరియు సమాచారంతో ఉంచండి
- తెలుగులో మాత్రమే సమాధానం ఇవ్వండి

వృత్తిపరమైన వైద్య సలహా అవసరాన్ని నొక్కిచెప్పేటప్పుడు ఆచరణాత్మక వైద్య మార్గదర్శకత్వం అందించండి.'''
        },
        'bn': {
            'system': 'আপনি একজন পেশাদার চিকিৎসা AI সহায়ক। দয়া করে বাংলায় একটি সুগঠিত, পেশাদার উত্তর প্রদান করুন।',
            'instructions': '''দয়া করে আপনার উত্তরটি এভাবে ফরম্যাট করুন:
- স্পষ্ট চিকিৎসা তথ্য
- পেশাদার পরিভাষা
- তালিকার জন্য বুলেট পয়েন্ট
- স্বাস্থ্য পেশাদারদের সাথে পরামর্শ নেওয়ার বিষয়ে দাবিত্যাগ অন্তর্ভুক্ত করুন
- উত্তর সংক্ষিপ্ত এবং তথ্যপূর্ণ রাখুন
- শুধুমাত্র বাংলায় উত্তর দিন

পেশাদার চিকিৎসা পরামর্শের প্রয়োজনীয়তার উপর জোর দিয়ে ব্যবহারিক চিকিৎসা নির্দেশনা প্রদান করুন।'''
        },
        'en': {
            'system': 'You are a professional medical AI assistant. Please provide a well-structured, professional response in English.',
            'instructions': '''Please format your response with:
- Clear medical information
- Professional terminology
- Bullet points for lists
- Include disclaimer about consulting healthcare professionals
- Keep response concise and informative
- Respond ONLY in English

Provide practical medical guidance while emphasizing the need for professional medical consultation.'''
        }
    }
    
    # Get language-specific prompt or default to English
    lang_config = language_prompts.get(response_language, language_prompts['en'])
    
    # Enhanced prompt for better medical formatting with language support
    enhanced_prompt = f"""{lang_config['system']}

User Question: {prompt}

{lang_config['instructions']}"""
    
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
    
    # Clean up the response while preserving non-ASCII characters (for Hindi, etc.)
    cleaned_response = response
    
    # Clean up excessive whitespace and newlines only
    cleaned_response = re.sub(r'\n\s*\n\s*\n+', '\n\n', cleaned_response)
    cleaned_response = re.sub(r'[ \t]+', ' ', cleaned_response)  # Clean spaces/tabs but preserve newlines
    cleaned_response = cleaned_response.strip()
    
    return cleaned_response

# Function to simulate streaming response (since Gemini doesn't support streaming)
def stream_response(text, chunk_size=10):
    """Simulate streaming by yielding chunks of text"""
    import time
    
    # For Hindi and other non-Latin scripts, preserve words better
    # Split by sentences first, then by words if needed
    sentences = text.split('.')
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        words = sentence.split()
        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i + chunk_size])
            if i > 0:
                chunk = " " + chunk
            
            # Add sentence ending if this is the last chunk of a sentence
            if i + chunk_size >= len(words) and sentence != sentences[-1]:
                chunk += "."
                
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
        language = request.json.get('language', 'en')  # Input language
        response_language = request.json.get('responseLanguage', language)  # Response language
        
        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        # Check if API key is configured
        if not GEMINI_API_KEY:
            return jsonify({"error": "Gemini API key not configured. Please add GEMINI_API_KEY to backend/.env file"}), 503

        # Get response from Gemini API with language support
        response = gemini_response(user_input, language, response_language)

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
        
        # Add professional disclaimer in appropriate language
        disclaimers = {
            'hi': "\n**⚠️ चिकित्सा अस्वीकरण:**\nयह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। उचित चिकित्सा निदान और उपचार के लिए कृपया किसी स्वास्थ्य पेशेवर से सलाह लें।\n\n",
            'ta': "\n**⚠️ மருத்துவ மறுப்பு:**\nஇந்த தகவல் கல்வி நோக்கங்களுக்காக மட்டுமே. சரியான மருத்துவ கண்டறிதல் மற்றும் சிகிச்சைக்கு தயவுசெய்து ஒரு சுகாதார நிபுணரை ஆலோசிக்கவும்।\n\n",
            'te': "\n**⚠️ వైద్య నిరాకరణ:**\nఈ సమాచారం కేవలం విద్యా ప్రయోజనాల కోసం మాత్రమే. సరైన వైద్య నిర్ధారణ మరియు చికిత్స కోసం దయచేసి ఆరోగ్య నిపుణుడిని సంప్రదించండి।\n\n",
            'bn': "\n**⚠️ চিকিৎসা দাবিত্যাগ:**\nএই তথ্য শুধুমাত্র শিক্ষাগত উদ্দেশ্যে। যথাযথ চিকিৎসা নির্ণয় এবং চিকিৎসার জন্য দয়া করে একজন স্বাস্থ্য পেশাদারের সাথে পরামর্শ করুন।\n\n",
            'en': "\n**⚠️ Medical Disclaimer:**\nThis information is for educational purposes only. Please consult with a healthcare professional for proper medical diagnosis and treatment.\n\n"
        }
        
        appointment_labels = {
            'hi': "**📅 अपॉइंटमेंट की जानकारी:**\n",
            'ta': "**📅 நியமன தகவல்:**\n",
            'te': "**📅 అపాయింట్మెంట్ సమాచారం:**\n",
            'bn': "**📅 অ্যাপয়েন্টমেন্ট তথ্য:**\n",
            'en': "**📅 Appointment Information:**\n"
        }
        
        response += disclaimers.get(response_language, disclaimers['en'])

        # Automatically book an appointment with better formatting
        appointment_info = book_appointment()
        response += appointment_labels.get(response_language, appointment_labels['en']) + appointment_info

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
        language = request.json.get('language', 'en')  # Input language
        response_language = request.json.get('responseLanguage', language)  # Response language
        
        if not user_input:
            return jsonify({"error": "No input provided"}), 400

        # Check if API key is configured
        if not GEMINI_API_KEY:
            return jsonify({"error": "Gemini API key not configured"}), 503

        def generate():
            try:
                # Get response from Gemini API with language support
                response = gemini_response(user_input, language, response_language)

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
                
                # Add professional disclaimer in appropriate language
                disclaimers = {
                    'hi': "\n**⚠️ चिकित्सा अस्वीकरण:**\nयह जानकारी केवल शैक्षिक उद्देश्यों के लिए है। उचित चिकित्सा निदान और उपचार के लिए कृपया किसी स्वास्थ्य पेशेवर से सलाह लें।\n\n",
                    'ta': "\n**⚠️ மருத்துவ மறுப்பு:**\nஇந்த தகவல் கல்வி நோக்கங்களுக்காக மட்டுமே. சரியான மருத்துவ கண்டறிதல் மற்றும் சிகிச்சைக்கு தயவுசெய்து ஒரு சுகாதார நிபுணரை ஆலோசிக்கவும்।\n\n",
                    'te': "\n**⚠️ వైద్య నిరాకరణ:**\nఈ సమాచారం కేవలం విద్యా ప్రయోజనాల కోసం మాత్రమే. సరైన వైద్య నిర్ధారణ మరియు చికిత్స కోసం దయచేసి ఆరోగ్య నిపుణుడిని సంప్రదించండి।\n\n",
                    'bn': "\n**⚠️ চিকিৎসা দাবিত্যাগ:**\nএই তথ্য শুধুমাত্র শিক্ষাগত উদ্দেশ্যে। যথাযথ চিকিৎসা নির্ণয় এবং চিকিৎসার জন্য দয়া করে একজন স্বাস্থ্য পেশাদারের সাথে পরামর্শ করুন।\n\n",
                    'en': "\n**⚠️ Medical Disclaimer:**\nThis information is for educational purposes only. Please consult with a healthcare professional for proper medical diagnosis and treatment.\n\n"
                }
                
                appointment_labels = {
                    'hi': "**📅 अपॉइंटमेंट की जानकारी:**\n",
                    'ta': "**📅 நியமன தகவல்:**\n",
                    'te': "**📅 అపాయింట్మెంట్ సమాచారం:**\n",
                    'bn': "**📅 অ্যাপয়েন্টমেন্ট তথ্য:**\n",
                    'en': "**📅 Appointment Information:**\n"
                }
                
                response += disclaimers.get(response_language, disclaimers['en'])

                # Automatically book an appointment with better formatting
                appointment_info = book_appointment()
                response += appointment_labels.get(response_language, appointment_labels['en']) + appointment_info

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

# Ensure initialization when running under a WSGI server (e.g., Render/Gunicorn)
@app.before_first_request
def _initialize_on_first_request():
    try:
        if globals().get('medicine_df') is None:
            initialize_app()
    except Exception as _e:
        # Avoid crashing startup; errors will surface via /health and route responses
        print(f"Initialization error on first request: {_e}")
