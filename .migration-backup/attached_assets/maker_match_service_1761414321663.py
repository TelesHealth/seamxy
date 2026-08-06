
from services.mock_data import MOCK_MAKERS

def match_makers(request_payload):
    desired_tags = set(request_payload.get("style_tags", []))
    budget_min = request_payload.get("budget_min", 0)
    budget_max = request_payload.get("budget_max", 999999)
    item_type = request_payload.get("item_type","").lower()

    matches = []
    for m in MOCK_MAKERS:
        tags = set(m.get("style_tags", []))
        overlap = len(tags & desired_tags)
        style_overlap = 0.4 if overlap else 0.2
        budget_ok = (m["budget_min"] <= budget_max and m["budget_max"] >= budget_min)
        budget_score = 0.3 if budget_ok else 0.1
        expertise = 0.2 if item_type in [s.lower() for s in m.get("specialties",[])] else 0.05
        lead = m.get("lead_time_days", 21)
        lead_score = 0.1 if lead <= 21 else 0.05
        total = style_overlap + budget_score + expertise + lead_score
        m2 = dict(m)
        m2["match_score"] = round(total,3)
        matches.append(m2)

    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches[:10]
