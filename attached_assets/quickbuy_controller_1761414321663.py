
from flask import Blueprint, request, jsonify

bp = Blueprint("quickbuy", __name__)

@bp.post("/quickbuy")
def quickbuy():
    body = request.get_json(force=True)
    product_id = body.get("product_id", "UNKNOWN")
    url = f"https://example-retailer.com/checkout?aff=DEMO&pid={product_id}"
    return jsonify({"checkout_url": url})
