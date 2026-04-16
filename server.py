"""
如果当时 - 平行人生模拟器
Flask Backend Server - DeepSeek API Proxy
"""

import os

from dotenv import load_dotenv
from flask import Flask, abort, jsonify, request, send_from_directory
from flask_cors import CORS
import requests

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend.

# API key from environment variable or local .env file. Never put it in frontend code.
DEEPSEEK_API_KEY = os.environ.get('DEEPSEEK_API_KEY', '')
DEEPSEEK_API_URL = os.environ.get(
    'DEEPSEEK_API_URL',
    'https://api.deepseek.com/chat/completions',
)
DEFAULT_MODEL = os.environ.get('DEEPSEEK_MODEL', 'deepseek-chat')
FRONTEND_FILES = {'index.html', 'app.js', 'style.css'}


@app.route('/', methods=['GET'])
def index():
    """Serve the frontend when visiting the Flask server root."""
    return send_from_directory(BASE_DIR, 'index.html')


@app.route('/<path:filename>', methods=['GET'])
def frontend_file(filename):
    """Serve the small set of frontend assets used by index.html."""
    if filename in FRONTEND_FILES:
        return send_from_directory(BASE_DIR, filename)
    abort(404)


@app.route('/api/generate', methods=['POST'])
def generate():
    """Proxy endpoint for AI story generation."""
    try:
        data = request.get_json()

        if not data or 'messages' not in data:
            return jsonify({'error': 'Missing messages field'}), 400

        if not DEEPSEEK_API_KEY:
            return jsonify({'error': 'DeepSeek API key not configured on server'}), 500

        # Forward request to DeepSeek's OpenAI-compatible chat endpoint.
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
        }

        payload = {
            'model': data.get('model', DEFAULT_MODEL),
            'messages': data['messages'],
            'temperature': data.get('temperature', 0.8),
            'max_tokens': data.get('max_tokens', 3000),
            'response_format': data.get('response_format', {'type': 'json_object'}),
        }

        response = requests.post(
            DEEPSEEK_API_URL,
            headers=headers,
            json=payload,
            timeout=60,
        )

        if not response.ok:
            error_detail = response.text[:500]
            return jsonify({
                'error': f'Upstream API error: {response.status_code}',
                'detail': error_detail,
            }), response.status_code

        return jsonify(response.json())

    except requests.exceptions.Timeout:
        return jsonify({'error': 'Request to AI service timed out'}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Network error: {str(e)}'}), 502
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'provider': 'deepseek',
        'model': DEFAULT_MODEL,
        'api_key_configured': bool(DEEPSEEK_API_KEY),
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
