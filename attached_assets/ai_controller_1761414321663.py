
from flask import Blueprint, request, jsonify
from services.ai_parser import analyze_user_text

bp = Blueprint("ai", __name__)

@bp.post("/analyze_profile")
def analyze_profile():
    body = request.get_json(force=True)
    text = body.get("text", "")
    parsed = analyze_user_text(text)
    return jsonify(parsed)
