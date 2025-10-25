
# MVP stub: parse free text into simple tags. Replace with OpenAI or HF later.
import re

def analyze_user_text(text: str):
    text_lower = text.lower()
    age = None
    m = re.search(r"(\d{2})-?year-?old|(\d{2})\s*years?\s*old", text_lower)
    if m:
        age = int(next(g for g in m.groups() if g))

    style_tags = []
    for tag in ["minimalist","smart-casual","classic","streetwear","sporty","formal","modern"]:
        if tag in text_lower:
            style_tags.append(tag)

    lifestyle = None
    for lf in ["professional","traveler","student","creative","athletic","retired"]:
        if lf in text_lower:
            lifestyle = lf
            break

    budget_min, budget_max = None, None
    m2 = re.search(r"\$(\d+)\s*[-to]+\s*\$(\d+)", text_lower)
    if m2:
        budget_min, budget_max = int(m2.group(1)), int(m2.group(2))
    elif "under $" in text_lower:
        val = int(re.search(r"under \$(\d+)", text_lower).group(1))
        budget_min, budget_max = 0, val

    return {
        "age": age,
        "lifestyle": lifestyle,
        "style_tags": style_tags,
        "budget": {"min": budget_min, "max": budget_max}
    }
