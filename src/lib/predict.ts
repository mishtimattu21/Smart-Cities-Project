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
    const body = JSON.stringify({ steps, commodity: payload?.commodity || "Onion", grade: "FAQ", ...payload });
    const preferBase = (import.meta as any).env?.VITE_PREDICT_API_BASE as string | undefined;
    const base = preferBase?.replace(/\/$/, "") || "";
    const primary = base ? `${base}/predict` : `/api/predict`;
    const fallback = base ? `/api/predict` : undefined;
    let res = await fetch(primary, { method: "POST", headers: { "Content-Type": "application/json" }, body });
    if (!res.ok && fallback) {
      try { res = await fetch(fallback, { method: "POST", headers: { "Content-Type": "application/json" }, body }); } catch {}
    }
    if (!res.ok) throw new Error(String(res.status));
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) throw new Error("Non-JSON");
    return (await res.json()) as OnionForecast;
  } catch {
    // Dev/local fallback when serverless runtime isn't available
    const base = 40;
    const noise = (i: number) => Math.sin(i * 0.7) * 2.5;
    return { commodity: "Onion", steps, predictions: Array.from({ length: steps }, (_, i) => base + noise(i)) };
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
    // Prefer local Flask server if running
    const preferLocal = (import.meta as any).env?.VITE_PREDICT_API_BASE as string | undefined;
    const base = preferLocal?.replace(/\/$/, "") || "";
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


