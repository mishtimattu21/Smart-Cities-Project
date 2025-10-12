from __future__ import annotations

import json
import os
from typing import Any, Dict

from flask import Flask, jsonify, request
from flask_cors import CORS

try:
    import joblib  # type: ignore
except Exception:  # pragma: no cover
    joblib = None
import pickle


def load_model(path: str):
    if joblib is not None:
        try:
            return joblib.load(path)
        except Exception:
            pass
    with open(path, "rb") as f:
        return pickle.load(f)


def predict_series(model: Any, steps: int) -> list[float]:
    # 1) pmdarima
    try:
        return list(map(float, model.predict(n_periods=steps)))
    except Exception:
        pass
    # 2) statsmodels SARIMAXResults
    try:
        fc = model.get_forecast(steps=steps)
        pm = getattr(fc, "predicted_mean", None)
        if pm is not None:
            return [float(x) for x in list(pm)]
    except Exception:
        pass
    # 3) statsmodels ARIMAResults
    try:
        return [float(x) for x in list(model.forecast(steps=steps))]
    except Exception:
        pass
    raise RuntimeError("Unsupported model interface for automatic forecasting")


def create_app(model_path: str = None) -> Flask:
    app = Flask(__name__)
    CORS(app)

    # Load models for all supported commodities if present
    base = os.getcwd()
    model_files = {
        "onion": os.path.abspath(model_path) if model_path else os.path.join(base, "onion.pkl"),
        "potato": os.path.join(base, "potato.pkl"),
        "wheat": os.path.join(base, "wheat.pkl"),
        "rice": os.path.join(base, "rice.pkl"),
    }
    models = {}
    for name, p in model_files.items():
        try:
            if os.path.exists(p):
                models[name] = load_model(p)
        except Exception:
            pass
    # Fallback: if some models missing, reuse onion model when available
    if "onion" in models:
        for k in model_files.keys():
            models.setdefault(k, models["onion"])
    app.config["MODELS"] = models
    app.config["PRICE_BOUNDS"] = {}

    def compute_price_bounds(commodity: str):
        commodity = commodity.lower()
        if commodity in app.config["PRICE_BOUNDS"]:
            return app.config["PRICE_BOUNDS"][commodity]
        csv_path = os.path.join(os.getcwd(), f"{commodity}.csv")
        bounds = {"min": None, "max": None}
        if os.path.exists(csv_path):
            try:
                with open(csv_path, "r", encoding="utf-8") as f:
                    header = f.readline().strip().split(",")
                    # Normalize headers
                    lower = [h.strip().strip('"').lower() for h in header]
                    idx_min = None
                    idx_max = None
                    idx_modal = None
                    for i, h in enumerate(lower):
                        if h in ("min_price", "min price", "min"):
                            idx_min = i
                        if h in ("max_price", "max price", "max"):
                            idx_max = i
                        if h in ("modal_price", "modal price", "price"):
                            idx_modal = i
                    local_min = None
                    local_max = None
                    for line in f:
                        if not line.strip():
                            continue
                        parts = [p.strip().strip('"') for p in line.strip().split(",")]
                        vals = []
                        for idx in (idx_min, idx_modal, idx_max):
                            if idx is not None and idx < len(parts):
                                try:
                                    vals.append(float(parts[idx]))
                                except Exception:
                                    pass
                        if not vals:
                            continue
                        vmin = min(vals)
                        vmax = max(vals)
                        local_min = vmin if local_min is None else min(local_min, vmin)
                        local_max = vmax if local_max is None else max(local_max, vmax)
                    if local_min is not None and local_max is not None:
                        bounds = {"min": float(local_min), "max": float(local_max)}
            except Exception:
                pass
        # Reasonable fallbacks if CSV missing or unreadable
        if bounds["min"] is None or bounds["max"] is None:
            defaults = {
                "onion": {"min": 200.0, "max": 7000.0},
                "potato": {"min": 200.0, "max": 6000.0},
                "wheat": {"min": 1000.0, "max": 4000.0},
                "rice": {"min": 1500.0, "max": 6000.0},
            }
            bounds = defaults.get(commodity, {"min": 0.0, "max": 10000.0})
        app.config["PRICE_BOUNDS"][commodity] = bounds
        return bounds

    def read_meta(commodity: str, scope: str, state_filter: str = "", district_filter: str = ""):
        commodity = commodity.lower()
        csv_path = os.path.join(os.getcwd(), f"{commodity}.csv")
        items: Dict[str, int] = {}
        if not os.path.exists(csv_path):
            return []
        try:
            with open(csv_path, "r", encoding="utf-8") as f:
                header = f.readline().strip().split(",")
                lower = [h.strip().strip('"').lower() for h in header]
                def idx_of(names):
                    for i, h in enumerate(lower):
                        if h in names:
                            return i
                    return -1
                i_state = idx_of({"your_state", "state"})
                i_district = idx_of({"your_district", "district"})
                i_market = idx_of({"your_market", "market"})
                i_variety = idx_of({"your_variety", "variety"})
                for line in f:
                    if not line.strip():
                        continue
                    parts = [p.strip().strip('"') for p in line.strip().split(",")]
                    state = parts[i_state] if 0 <= i_state < len(parts) else ""
                    district = parts[i_district] if 0 <= i_district < len(parts) else ""
                    market = parts[i_market] if 0 <= i_market < len(parts) else ""
                    variety = parts[i_variety] if 0 <= i_variety < len(parts) else ""
                    if state_filter and state.lower() != state_filter.lower():
                        continue
                    if district_filter and district.lower() != district_filter.lower():
                        continue
                    key = ""
                    if scope == "states":
                        key = state
                    elif scope == "districts":
                        key = district
                    elif scope == "markets":
                        key = market
                    else:
                        key = variety
                    if key:
                        items[key] = items.get(key, 0) + 1
        except Exception:
            return []
        return sorted(items.keys(), key=lambda x: x.lower())

    @app.get("/")
    def root() -> Any:
        return jsonify({"status": "ok", "model_path": app.config["MODEL_PATH"]})

    @app.post("/predict")
    def predict() -> Any:
        body: Dict[str, Any] = request.get_json(silent=True) or {}
        steps = int(body.get("steps", 7))
        # Optional context
        ctx = {k: body.get(k) for k in ["state", "district", "market", "variety", "grade", "dateISO"]}
        commodity = (body.get("commodity") or "Onion").lower()
        bounds = compute_price_bounds(commodity)
        model = app.config["MODELS"].get(commodity)
        if model is None:
            # Last resort fallback: raise error for client-side fallback
            raise RuntimeError("Model not loaded for commodity: " + commodity)
        series = predict_series(model, steps)
        return jsonify({
            "commodity": commodity.capitalize(),
            "steps": steps,
            "predictions": series,
            "priceBounds": bounds,
            "context": ctx,
        })

    @app.get("/meta")
    def meta() -> Any:
        commodity = (request.args.get("commodity") or "onion").lower()
        scope = (request.args.get("scope") or "states").lower()
        state_filter = request.args.get("state") or ""
        district_filter = request.args.get("district") or ""
        items = read_meta(commodity, scope, state_filter, district_filter)
        return jsonify({"commodity": commodity, "scope": scope, "items": items})

    return app


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app = create_app()
    app.run(host="127.0.0.1", port=port, debug=True)


