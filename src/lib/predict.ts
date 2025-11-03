export type OnionForecast = {
  commodity: "Onion" | "Potato" | "Wheat" | "Rice";
  steps: number;
  predictions: number[];
  priceBounds?: { min: number; max: number };
};

export async function predictOnion(steps = 7, payload?: {
  state: string;
  district: string;
  market?: string;
  variety: string;
  grade?: string; // default FAQ
  dateISO: string; // prediction date
  commodity?: "Onion" | "Potato" | "Wheat" | "Rice";
}): Promise<OnionForecast> {
  // Prefer serverless endpoint if available
  try {
    const dateISO = payload?.dateISO;
    const date = dateISO ? new Date(dateISO).toISOString().slice(0, 10) : undefined; // YYYY-MM-DD
    const body = JSON.stringify({ steps, commodity: payload?.commodity || "Onion", grade: "FAQ", ...payload, date, dateISO });
    const base = "https://acb69f591085.ngrok-free.app";
    const url = `${base}/predict`;
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!res.ok) throw new Error(String(res.status));
    try {
      const raw = await res.json();
      // Normalize various possible shapes into OnionForecast
      let predictions: number[] | undefined = Array.isArray(raw?.predictions)
        ? raw.predictions
        : undefined;
      if (!predictions) {
        if (Array.isArray(raw?.prices)) predictions = raw.prices;
        else if (Array.isArray(raw?.predicted)) predictions = raw.predicted;
        else if (typeof raw?.price === "number") predictions = [Number(raw.price)];
        else if (typeof raw?.prediction === "number") predictions = [Number(raw.prediction)];
        else if (typeof raw?.predicted_price === "number") predictions = [Number(raw.predicted_price)];
      }
      const commodity = (raw?.commodity as string) || (payload?.commodity || "Onion");
      const stepsNum = Number(raw?.steps) || (Array.isArray(predictions) ? predictions.length || steps : steps);
      if (!predictions || predictions.length === 0) {
        return { commodity, steps: stepsNum, predictions: [] } as OnionForecast;
      }
      return { commodity, steps: stepsNum, predictions, priceBounds: raw?.priceBounds } as OnionForecast;
    } catch {
      const text = await res.text();
      try { return JSON.parse(text) as OnionForecast; } catch {
        throw new Error("Unexpected response from prediction API");
      }
    }
  } catch (err) {
    // Surface real errors to the UI instead of returning placeholder data
    throw err instanceof Error ? err : new Error("Prediction request failed");
  }
}

export async function fetchOnionMeta(scope: "states" | "districts" | "varieties" | "markets", filters?: { state?: string; district?: string }) {
  const qs = new URLSearchParams({ scope });
  if (filters?.state) qs.set("state", filters.state);
  if (filters?.district) qs.set("district", filters.district);
  try {
    const res = await fetch(`/api/onion_meta?${qs.toString()}`);
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as { scope: string; items: string[] };
  } catch {
    // Fallback: parse onion.csv directly in the browser
    try {
      const csvRes = await fetch(`/onion.csv`);
      if (!csvRes.ok) throw new Error("missing csv");
      const text = await csvRes.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return { scope, items: [] };
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      const idx = {
        state: headers.findIndex(h => h.toLowerCase() === "your_state" || h.toLowerCase() === "state"),
        district: headers.findIndex(h => h.toLowerCase() === "your_district" || h.toLowerCase() === "district"),
        market: headers.findIndex(h => h.toLowerCase() === "your_market" || h.toLowerCase() === "market"),
        variety: headers.findIndex(h => h.toLowerCase() === "your_variety" || h.toLowerCase() === "variety"),
      };
      const get = (line: string, i: number) => {
        const parts = line.split(",");
        const v = i >= 0 && i < parts.length ? parts[i] : "";
        return v.trim().replace(/^"|"$/g, "");
      };
      const set = new Set<string>();
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const s = get(line, idx.state);
        const d = get(line, idx.district);
        const m = get(line, idx.market);
        const v = get(line, idx.variety);
        if (filters?.state && s.toLowerCase() !== filters.state.toLowerCase()) continue;
        if (filters?.district && d.toLowerCase() !== filters.district.toLowerCase()) continue;
        let key = "";
        if (scope === "states") key = s;
        else if (scope === "districts") key = d;
        else if (scope === "markets") key = m;
        else key = v;
        if (key) set.add(key);
      }
      return { scope, items: Array.from(set).sort() };
    } catch {
      return { scope, items: [] };
    }
  }
}

export async function fetchCommodityMeta(
  commodity: "onion" | "potato" | "wheat" | "rice",
  scope: "states" | "districts" | "varieties" | "markets",
  filters?: { state?: string; district?: string }
) {
  const qs = new URLSearchParams({ commodity, scope });
  if (filters?.state) qs.set("state", filters.state);
  if (filters?.district) qs.set("district", filters.district);
  try {
    // Prefer configured/external API base, fallback to local proxy
    const base = "https://acb69f591085.ngrok-free.app";
    const url = base ? `${base}/meta?${qs.toString()}` : `/api/commodity_meta?${qs.toString()}`;
    const alt = base ? `/api/commodity_meta?${qs.toString()}` : undefined;
    let res = await fetch(url);
    if (!res.ok && alt) {
      try { res = await fetch(alt); } catch {}
    }
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()) as { commodity: string; scope: string; items: string[] };
  } catch {
    // Client fallback: parse CSV directly
    try {
      const csvRes = await fetch(`/${commodity}.csv`);
      if (!csvRes.ok) throw new Error("missing csv");
      const text = await csvRes.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return { commodity, scope, items: [] };
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      const idx = {
        state: headers.findIndex(h => h.toLowerCase() === "your_state" || h.toLowerCase() === "state"),
        district: headers.findIndex(h => h.toLowerCase() === "your_district" || h.toLowerCase() === "district"),
        market: headers.findIndex(h => h.toLowerCase() === "your_market" || h.toLowerCase() === "market"),
        variety: headers.findIndex(h => h.toLowerCase() === "your_variety" || h.toLowerCase() === "variety"),
      };
      const get = (line: string, i: number) => {
        const parts = line.split(",");
        const v = i >= 0 && i < parts.length ? parts[i] : "";
        return v.trim().replace(/^"|"$/g, "");
      };
      const set = new Set<string>();
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const s = get(line, idx.state);
        const d = get(line, idx.district);
        const m = get(line, idx.market);
        const v = get(line, idx.variety);
        if (filters?.state && s.toLowerCase() != filters.state.toLowerCase()) continue;
        if (filters?.district && d.toLowerCase() != filters.district.toLowerCase()) continue;
        let key = "";
        if (scope === "states") key = s;
        else if (scope === "districts") key = d;
        else if (scope === "markets") key = m;
        else key = v;
        if (key) set.add(key);
      }
      return { commodity, scope, items: Array.from(set).sort() };
    } catch {
      return { commodity, scope, items: [] };
    }
  }
}


