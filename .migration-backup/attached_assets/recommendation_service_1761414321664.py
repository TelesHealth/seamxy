
def rank_products(products, fit_data, style_tags, budget_range):
    def style_score(p):
        tags = p.get("style_tags", [])
        if not style_tags:
            return 0.7
        inter = len(set(tags) & set(style_tags))
        return 0.6 + 0.1 * inter

    def fit_score(p):
        # MVP: if fit category matches, give boost
        user_fit = fit_data.get("category", "")
        return 0.9 if user_fit and user_fit == p.get("category") else 0.75

    def budget_score(p):
        lo, hi = budget_range
        price = p.get("price", 9999)
        if lo <= price <= hi:
            return 1.0
        # soft penalty if within 20%
        if price < lo * 0.8 or price > hi * 1.2:
            return 0.5
        return 0.8

    ranked = []
    for p in products:
        fs = fit_score(p)
        ss = style_score(p)
        bs = budget_score(p)
        total = 0.5*fs + 0.3*ss + 0.2*bs
        p2 = dict(p)
        p2.update({"fit_score": round(fs,2), "style_match": round(ss,2),
                   "budget_match": round(bs,2), "total_score": round(total,3)})
        ranked.append(p2)
    ranked.sort(key=lambda x: x["total_score"], reverse=True)
    return ranked
