"""
如果当时 — 平行人生模拟器
Flask Backend Server - AI API Proxy
"""

import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from frontend

# API Key from environment variable (NEVER hardcode)
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'


@app.route('/api/generate', methods=['POST'])
def generate():
    """Proxy endpoint for AI story generation."""
    try:
        data = request.get_json()

        if not data or 'messages' not in data:
            return jsonify({'error': 'Missing messages field'}), 400

        if not OPENAI_API_KEY:
            return jsonify({'error': 'API key not configured on server'}), 500

        # Forward request to OpenAI
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {OPENAI_API_KEY}',
        }

        payload = {
            'model': data.get('model', 'gpt-4o-mini'),
            'messages': data['messages'],
            'temperature': data.get('temperature', 0.8),
            'max_tokens': data.get('max_tokens', 3000),
            'response_format': data.get('response_format', {'type': 'json_object'}),
        }

        response = requests.post(
            OPENAI_API_URL,
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

        result = response.json()
        return jsonify(result)

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
        'api_key_configured': bool(OPENAI_API_KEY),
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(host='0.0.0.0', port=port, debug=debug)
