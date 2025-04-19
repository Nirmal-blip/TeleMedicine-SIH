# import requests
# import json
# from datetime import datetime

# # Google Gemini API Key (Replace with your own API Key)
# GEMINI_API_KEY = "AIzaSyDlpNK9Csn0h-B5YHWM3LU2W3o6wJGlda0"
# GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# # Function to get a response from Gemini API
# def gemini_response(prompt):
#     headers = {"Content-Type": "application/json"}
#     payload = {
#         "contents": [{"parts": [{"text": prompt}]}]
#     }

#     response = requests.post(GEMINI_API_URL, headers=headers, json=payload)

#     if response.status_code == 200:
#         response_data = response.json()
#         try:
#             return response_data["candidates"][0]["content"]["parts"][0]["text"]
#         except KeyError:
#             return "I'm sorry, but I couldn't process your request. Please try again."
#     else:
#         return f"Error: {response.status_code}, {response.text}"

# # Recommendation Engine (Do’s and Don’ts)
# recommendations = {
#     "fever": {
#         "do": ["Stay hydrated", "Get plenty of rest", "Take paracetamol if necessary", "Monitor your temperature"],
#         "dont": ["Avoid caffeine", "Don’t overexert yourself", "Avoid cold drinks", "Don’t ignore high fever"]
#     },
#     "cold": {
#         "do": ["Drink warm fluids", "Rest well", "Use a humidifier", "Take vitamin C"],
#         "dont": ["Avoid dairy", "Don’t go outside without warm clothes", "Avoid cold beverages", "Don’t touch your face often"]
#     },
#     "diabetes": {
#         "do": ["Maintain a healthy diet", "Exercise regularly", "Monitor blood sugar levels", "Stay hydrated"],
#         "dont": ["Avoid sugary foods", "Limit processed carbs", "Don’t skip meals", "Avoid alcohol"]
#     }
# }

# # Function to provide recommendations based on detected disease
# def get_recommendations(disease):
#     if disease in recommendations:
#         dos = "\n✔ " + "\n✔ ".join(recommendations[disease]["do"])
#         donts = "\n❌ " + "\n❌ ".join(recommendations[disease]["dont"])
#         return f"**Do's:**{dos}\n\n**Don'ts:**{donts}"
#     return "No specific recommendations available."

# # Appointment booking simulation
# def book_appointment():
#     appointment_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#     return f"Your appointment is scheduled for {appointment_time}. Please check your messages for confirmation."

# # Main chatbot loop
# def chatbot():
#     while True:
#         user_input = input("You: ")
#         if user_input.lower() in ["exit", "quit"]:
#             print("Chatbot: Take care! If you need further assistance, feel free to ask.")
#             break

#         # Get response from Gemini API
#         response = gemini_response(user_input)

#         # Extract disease from response
#         detected_disease = None
#         for disease in recommendations.keys():
#             if disease in response.lower():
#                 detected_disease = disease
#                 break

#         # Focused response on solving the disease
#         if detected_disease:
#             response = f"To treat {detected_disease}, follow these steps:\n\n{response}\n\n{get_recommendations(detected_disease)}"
#         else:
#             response = f"{response}\n\nGeneral advice: Stay hydrated and rest well."

#         print(f"\nChatbot: {response}\n")

#         # Ask for appointment
#         user_choice = input("Would you like to book an appointment? (Yes/No): ").strip().lower()
#         if user_choice == "yes":
#             print(f"\nChatbot: {book_appointment()} Thank you!\n")
#         else:
#             print("\nChatbot: Thank you! Stay safe and take care.\n")

# # Run chatbot
# if __name__ == "__main__":
#     chatbot()

# from flask import Flask, request, jsonify
# import requests
# import json
# from datetime import datetime
# from flask_cors import CORS  # Import Flask-CORS

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# # Google Gemini API Key (Replace with your own API Key)
# GEMINI_API_KEY = "AIzaSyDlpNK9Csn0h-B5YHWM3LU2W3o6wJGlda0"
# GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# # Function to get a response from Gemini API
# def gemini_response(prompt):
#     headers = {"Content-Type": "application/json"}
#     payload = {"contents": [{"parts": [{"text": prompt}]}]}
#     response = requests.post(GEMINI_API_URL, headers=headers, json=payload)
    
#     if response.status_code == 200:
#         response_data = response.json()
#         try:
#             return response_data["candidates"][0]["content"]["parts"][0]["text"]
#         except KeyError:
#             return "I'm sorry, but I couldn't process your request. Please try again."
#     else:
#         return f"Error: {response.status_code}, {response.text}"

# # Recommendation Engine (Do’s and Don’ts)
# recommendations = {
#     "fever": {
#         "do": ["Stay hydrated", "Get plenty of rest", "Take paracetamol if necessary", "Monitor your temperature"],
#         "dont": ["Avoid caffeine", "Don’t overexert yourself", "Avoid cold drinks", "Don’t ignore high fever"]
#     },
#     "cold": {
#         "do": ["Drink warm fluids", "Rest well", "Use a humidifier", "Take vitamin C"],
#         "dont": ["Avoid dairy", "Don’t go outside without warm clothes", "Avoid cold beverages", "Don’t touch your face often"]
#     },
#     "diabetes": {
#         "do": ["Maintain a healthy diet", "Exercise regularly", "Monitor blood sugar levels", "Stay hydrated"],
#         "dont": ["Avoid sugary foods", "Limit processed carbs", "Don’t skip meals", "Avoid alcohol"]
#     }
# }

# # Function to provide recommendations based on detected disease
# def get_recommendations(disease):
#     if disease in recommendations:
#         dos = "\n✔ " + "\n✔ ".join(recommendations[disease]["do"])
#         donts = "\n❌ " + "\n❌ ".join(recommendations[disease]["dont"])
#         return f"**Do's:**{dos}\n\n**Don'ts:**{donts}"
#     return "No specific recommendations available."

# # Appointment booking simulation
# def book_appointment():
#     appointment_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
#     return f"Your appointment is scheduled for {appointment_time}. Please check your messages for confirmation."

# # API endpoint to handle user input
# @app.route('/chat', methods=['POST'])
# def chat():
#     user_input = request.json.get('input')
#     if not user_input:
#         return jsonify({"error": "No input provided"}), 400

#     # Get response from Gemini API
#     response = gemini_response(user_input)

#     # Extract disease from response
#     detected_disease = None
#     for disease in recommendations.keys():
#         if disease in response.lower():
#             detected_disease = disease
#             break

#     # Focused response on solving the disease
#     if detected_disease:
#         response = f"To treat {detected_disease}, follow these steps:\n\n{response}\n\n{get_recommendations(detected_disease)}"
#     else:
#         response = f"{response}\n\nGeneral advice: Stay hydrated and rest well."

#     return jsonify({"response": response})

# # Run the Flask app
# if __name__ == "__main__":
#     app.run(debug=True)

from flask import Flask, request, jsonify
import requests
import json
from datetime import datetime
from flask_cors import CORS  # Import Flask-CORS
import speech_recognition as sr  # For speech recognition
import pyttsx3  # For text-to-speech conversion

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize text-to-speech engine
engine = pyttsx3.init()

# Google Gemini API Key (Replace with your own API Key)
GEMINI_API_KEY = "AIzaSyDlpNK9Csn0h-B5YHWM3LU2W3o6wJGlda0"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# Function to get a response from Gemini API
def gemini_response(prompt):
    headers = {"Content-Type": "application/json"}
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    response = requests.post(GEMINI_API_URL, headers=headers, json=payload)
    
    if response.status_code == 200:
        response_data = response.json()
        try:
            return response_data["candidates"][0]["content"]["parts"][0]["text"]
        except KeyError:
            return "I'm sorry, but I couldn't process your request. Please try again."
    else:
        return f"Error: {response.status_code}, {response.text}"

# Recommendation Engine (Do’s and Don’ts)
recommendations = {
    "fever": {
        "do": ["Stay hydrated", "Get plenty of rest", "Take paracetamol if necessary", "Monitor your temperature"],
        "dont": ["Avoid caffeine", "Don’t overexert yourself", "Avoid cold drinks", "Don’t ignore high fever"]
    },
    "cold": {
        "do": ["Drink warm fluids", "Rest well", "Use a humidifier", "Take vitamin C"],
        "dont": ["Avoid dairy", "Don’t go outside without warm clothes", "Avoid cold beverages", "Don’t touch your face often"]
    },
    "diabetes": {
        "do": ["Maintain a healthy diet", "Exercise regularly", "Monitor blood sugar levels", "Stay hydrated"],
        "dont": ["Avoid sugary foods", "Limit processed carbs", "Don’t skip meals", "Avoid alcohol"]
    }
}

# Function to provide recommendations based on detected disease
def get_recommendations(disease):
    if disease in recommendations:
        dos = "\n✔ " + "\n✔ ".join(recommendations[disease]["do"])
        donts = "\n❌ " + "\n❌ ".join(recommendations[disease]["dont"])
        return f"*Do's:{dos}\n\nDon'ts:*{donts}"
    return "No specific recommendations available."

# Appointment booking function
def book_appointment():
    appointment_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return f"Your appointment is scheduled for {appointment_time}. Please check your messages for confirmation."

# API endpoint to handle user input
@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('input')
    if not user_input:
        return jsonify({"error": "No input provided"}), 400

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
        response = f"To treat {detected_disease}, follow these steps:\n\n{response}\n\n{get_recommendations(detected_disease)}"

    # Automatically book an appointment
    appointment_info = book_appointment()

    # Final response including chatbot-generated text and appointment details
    response += f"\n\n{appointment_info}"

    # Convert response to speech
    engine.say(response)
    engine.runAndWait()

    return jsonify({"response": response})

# Voice input processing endpoint
@app.route('/voice-chat', methods=['POST'])
def voice_chat():
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        try:
            audio = recognizer.listen(source)
            user_input = recognizer.recognize_google(audio)
            print("User said:", user_input)
            return chat()
        except sr.UnknownValueError:
            return jsonify({"error": "Could not understand audio"})
        except sr.RequestError:
            return jsonify({"error": "Could not request results from Google Speech Recognition service"})

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
