import json
import os
import sys
import traceback

# Try both pickle and joblib
try:
    import joblib  # type: ignore
except Exception:  # pragma: no cover
    joblib = None
import pickle


def _load_model(path: str):
    if joblib is not None:
        try:
            return joblib.load(path)
        except Exception:
            pass
    with open(path, "rb") as f:
        return pickle.load(f)


# Cold start: load once
MODEL_PATH = os.path.join(os.getcwd(), "onion.pkl")
MODEL = None
if os.path.exists(MODEL_PATH):
    try:
        MODEL = _load_model(MODEL_PATH)
    except Exception:
        # Leave MODEL as None; report on request
        MODEL = None


def _predict_series(model, steps: int):
    # Try common interfaces in order
    # 1) pmdarima: model.predict(n_periods=steps)
    try:
        return list(map(float, model.predict(n_periods=steps)))
    except Exception:
        pass
    # 2) statsmodels SARIMAXResults: get_forecast(steps).predicted_mean
    try:
        fc = model.get_forecast(steps=steps)
        pm = getattr(fc, "predicted_mean", None)
        if pm is not None:
            return [float(x) for x in list(pm)]
    except Exception:
        pass
    # 3) statsmodels ARIMAResults: forecast(steps)
    try:
        return [float(x) for x in list(model.forecast(steps=steps))]
    except Exception:
        pass
    # 4) sklearn-like regressors expecting feature vector per step (not supported here)
    raise RuntimeError("Unsupported model interface for automatic forecasting")


def _json(body, status=200):
    return {
        "statusCode": status,
        "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
        "body": json.dumps(body),
    }


def handler(request, response):
    # Vercel Python (legacy) shim
    if request.method == "OPTIONS":
        response.status_code = 204
        return response
    try:
        if request.method not in ("GET", "POST"):
            response.status_code = 405
            response.body = b"{}"
            return response

        if MODEL is None:
            response.status_code = 500
            response.headers["Content-Type"] = "application/json"
            response.body = json.dumps({"error": "onion.pkl not loaded on server"}).encode()
            return response

        steps = 7
        # Collect optional contextual inputs (not strictly used unless model needs them)
        payload = {}
        if request.method == "GET":
            qs = request.query
            if qs and "steps" in qs:
                try:
                    steps = max(1, min(30, int(qs.get("steps"))))
                except Exception:
                    pass
            if qs:
                for k in ("state", "district", "market", "variety", "grade", "dateISO"):
                    if k in qs:
                        payload[k] = qs.get(k)
        else:
            try:
                data = json.loads(request.body or b"{}")
                if "steps" in data:
                    steps = max(1, min(30, int(data["steps"])))
                for k in ("state", "district", "market", "variety", "grade", "dateISO"):
                    if k in data:
                        payload[k] = data[k]
            except Exception:
                pass

        # Here you can condition the model based on payload inputs if needed.
        # For now, we simply forecast 'steps' ahead.
        series = _predict_series(MODEL, steps)
        payload = {"commodity": "Onion", "steps": steps, "predictions": series}
        response.status_code = 200
        response.headers["Content-Type"] = "application/json"
        response.body = json.dumps(payload).encode()
        return response
    except Exception as e:
        response.status_code = 500
        response.headers["Content-Type"] = "application/json"
        response.body = json.dumps({"error": str(e), "trace": traceback.format_exc()}).encode()
        return response


# Vercel’s new Python runtime expects a default export named app (ASGI). Provide a minimal ASGI app too.
async def app(scope, receive, send):
    if scope["type"] != "http":
        return
    # Simple adapter: read body, call the logic above via a fake request/response
    body = b""
    while True:
        event = await receive()
        if event["type"] == "http.request":
            body += event.get("body", b"")
            if not event.get("more_body"):
                break

    class Req:
        method = scope.get("method", "GET")
        query = dict((k.decode(), v.decode()) for k, v in scope.get("query_string", b"").split(b"&") if k) if scope.get("query_string") else {}
        body = body

    class Res:
        status_code = 200
        headers = {}
        body = b""

    res = Res()
    handler(Req, res)

    await send({
        "type": "http.response.start",
        "status": res.status_code,
        "headers": [(k.encode(), v.encode()) for k, v in res.headers.items()],
    })
    await send({"type": "http.response.body", "body": res.body})


