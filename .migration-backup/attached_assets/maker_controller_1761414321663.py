
from flask import Blueprint, request, jsonify
from services.maker_match_service import match_makers
from services.mock_data import MOCK_MAKERS

bp = Blueprint("maker", __name__)

@bp.get("/makers")
def list_makers():
    # simple listing for MVP
    return jsonify({"makers": MOCK_MAKERS})

@bp.post("/custom-request")
def create_custom_request():
    body = request.get_json(force=True)
    matches = match_makers(body)
    # In MVP, pretend RFQs are sent
    return jsonify({"request": body, "matched_makers": matches})

@bp.post("/quote")
def submit_quote():
    # MVP stub; echo back
    body = request.get_json(force=True)
    body["status"] = "sent"
    return jsonify(body)
