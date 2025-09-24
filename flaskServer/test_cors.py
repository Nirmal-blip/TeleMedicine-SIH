#!/usr/bin/env python3
"""
Simple test script to verify CORS configuration
"""
import requests
import json

def test_cors():
    """Test CORS configuration for medicine recommendation endpoint"""
    
    # Test data
    test_data = {
        "medicine_name": "paracetamol"
    }
    
    # Test URL
    url = "http://localhost:8000/api/medicine/recommend"
    
    # Headers that simulate the frontend request
    headers = {
        "Content-Type": "application/json",
        "Origin": "http://localhost:5173"
    }
    
    try:
        print("Testing CORS configuration...")
        print(f"URL: {url}")
        print(f"Headers: {headers}")
        print(f"Data: {test_data}")
        
        # Make the request
        response = requests.post(url, json=test_data, headers=headers)
        
        print(f"\nResponse Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ CORS test successful!")
            print(f"Response: {response.json()}")
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to Flask server. Make sure it's running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_cors()
