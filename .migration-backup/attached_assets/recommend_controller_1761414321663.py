
from flask import Blueprint, request, jsonify
from services.recommendation_service import rank_products
from services.mock_data import MOCK_PRODUCTS

bp = Blueprint("recommend", __name__)

@bp.post("/recommend")
def recommend():
    body = request.get_json(force=True)
    fit = body.get("fit", {})
    style_tags = body.get("style_tags", [])
    budget = body.get("budget_range", [0, 9999])
    products = rank_products(MOCK_PRODUCTS, fit, style_tags, budget)
    # attach mock checkout_url for Quick Buy
    for p in products:
        p["checkout_url"] = f"https://example-retailer.com/checkout?aff=DEMO&pid={p['id']}"
    return jsonify({"results": products[:20]})
