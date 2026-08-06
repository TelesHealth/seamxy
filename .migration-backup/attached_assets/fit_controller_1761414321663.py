
from flask import Blueprint, request, jsonify

bp = Blueprint("fit", __name__)

@bp.post("/measurements")
def save_measurements():
    # In MVP, echo back what we got; persistence can be added
    data = request.get_json(force=True)
    data["saved"] = True
    return jsonify(data)

@bp.get("/health")
def health():
    return {"status": "ok"}
