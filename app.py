from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
import os
import requests
import PyPDF2
import io
import logging
from werkzeug.utils import secure_filename
import json

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Load environment variables from .env
load_dotenv()

# Configuration
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {'pdf'}
XAI_API_KEY = os.getenv('XAI_API_KEY')
XAI_API_URL = 'https://api.x.ai/v1/chat/completions'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_api_key():
    if not XAI_API_KEY:
        raise ValueError("XAI API key is not configured. Please set XAI_API_KEY in .env file.")

def call_grok(prompt):
    try:
        validate_api_key()
        headers = {
            'Authorization': f'Bearer {XAI_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            'model': 'grok-3-latest',
            'messages': [
                {'role': 'system', 'content': 'You are a career advisor chatbot.'},
                {'role': 'user', 'content': prompt}
            ],
            'max_tokens': 500,
            'stream': False,
            'temperature': 0
        }
        response = requests.post(XAI_API_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json().get('choices', [{}])[0].get('message', {}).get('content', 'Sorry, I couldn\'t process that.')
    except requests.RequestException as e:
        logger.error(f"API request failed: {str(e)}")
        raise Exception(f"Error contacting AI service: {str(e)}")
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        raise Exception("Invalid response from AI service")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise Exception(f"An unexpected error occurred: {str(e)}")

def extract_resume_text(pdf_file):
    try:
        if pdf_file.content_length > MAX_FILE_SIZE:
            raise ValueError("File size exceeds the 5MB limit")

        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ''
        for page in pdf_reader.pages:
            extracted_text = page.extract_text()
            if extracted_text:
                text += extracted_text
        return text if text else 'No text could be extracted from the PDF.'
    except PyPDF2.PdfReadError as e:
        logger.error(f"PDF read error: {str(e)}")
        raise ValueError("Invalid or corrupted PDF file")
    except Exception as e:
        logger.error(f"PDF processing error: {str(e)}")
        raise ValueError(f"Error processing PDF: {str(e)}")

# Route: Home page
@app.route('/')
def index():
    return render_template('index.html')

# Route: Handle chat messages
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400

        user_message = data['message'].strip()
        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400

        prompt = f'Provide helpful, professional career advice. User asked: {user_message}'
        response = call_grok(prompt)
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Route: Upload and analyze resume
@app.route('/upload_resume', methods=['POST'])
def upload_resume():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        resume_file = request.files['resume']
        if resume_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(resume_file.filename):
            return jsonify({'error': 'Invalid file type. Please upload a PDF file'}), 400

        resume_text = extract_resume_text(resume_file)
        prompt = f'Analyze this resume and suggest job roles based on the skills and experience: {resume_text}'
        response = call_grok(prompt)
        return jsonify({'response': response})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Resume upload error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Route: Recommend jobs based on user-entered skills
@app.route('/recommend_jobs', methods=['POST'])
def recommend_jobs():
    try:
        data = request.get_json()
        if not data or 'skills' not in data:
            return jsonify({'error': 'No skills provided'}), 400

        skills = data['skills'].strip()
        if not skills:
            return jsonify({'error': 'Skills cannot be empty'}), 400

        prompt = f'Based on these skills: {skills}, recommend suitable job roles and explain why.'
        response = call_grok(prompt)
        return jsonify({'response': response})
    except Exception as e:
        logger.error(f"Job recommendation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
