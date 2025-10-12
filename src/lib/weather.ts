export type WeatherSummary = {
  location: { name: string; latitude: number; longitude: number; country?: string };
  rainfallMmWeek: number;
  avgTempC: number;
  humidityPct: number;
  windKmh: number;
};

async function fetchJsonSafe(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, init);
  if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // Force fallback
    throw new Error("Non-JSON response");
  }
  return res.json();
}

async function geocodeOpenMeteo(location: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to geocode location");
  const json = await res.json();
  if (!json?.results?.length) throw new Error("Location not found");
  return json.results[0] as { name: string; latitude: number; longitude: number; country?: string };
}

async function reverseGeocodeOpenMeteo(lat: number, lon: number) {
  const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json&count=1`;
  const res = await fetch(url);
  if (!res.ok) return { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, latitude: lat, longitude: lon };
  const json = await res.json();
  const item = json?.results?.[0];
  if (!item) return { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, latitude: lat, longitude: lon };
  return { name: item.name as string, latitude: lat, longitude: lon, country: item.country as string | undefined };
}

async function fetchOpenMeteoWeather(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m",
    hourly: "temperature_2m",
    daily: "precipitation_sum",
    past_days: "6",
    forecast_days: "1",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!res.ok) throw new Error("Open-Meteo error");
  const w = await res.json();

  const precip: number[] = Array.isArray(w?.daily?.precipitation_sum) ? w.daily.precipitation_sum : [];
  const rainfallMmWeek = Number(precip.reduce((s, v) => s + (Number(v) || 0), 0).toFixed(1));

  const hourlyTemps: number[] = Array.isArray(w?.hourly?.temperature_2m) ? w.hourly.temperature_2m : [];
  const avgTempC = hourlyTemps.length
    ? Number((hourlyTemps.reduce((s, v) => s + (Number(v) || 0), 0) / hourlyTemps.length).toFixed(1))
    : Number(w?.current?.temperature_2m ?? 0);

  const humidityPct = Number(w?.current?.relative_humidity_2m ?? 0);
  const windMs = Number(w?.current?.wind_speed_10m ?? 0);
  const windKmh = Number((windMs * 3.6).toFixed(1));

  return { rainfallMmWeek, avgTempC, humidityPct, windKmh };
}

export async function fetchWeather(params: { location?: string; latitude?: number; longitude?: number } = {}): Promise<WeatherSummary> {
  const qs = new URLSearchParams();
  if (params.location) qs.set("location", params.location);
  if (params.latitude != null) qs.set("latitude", String(params.latitude));
  if (params.longitude != null) qs.set("longitude", String(params.longitude));

  // Try serverless first (production)
  try {
    const json = await fetchJsonSafe(`/api/weather?${qs.toString()}`);
    return json as WeatherSummary;
  } catch {
    // Fallback for local dev: call Open-Meteo directly
    const loc = params.location ?? "Pune";
    const coords =
      params.latitude != null && params.longitude != null
        ? await reverseGeocodeOpenMeteo(params.latitude, params.longitude)
        : await geocodeOpenMeteo(loc);

    const metrics = await fetchOpenMeteoWeather(coords.latitude, coords.longitude);
    return {
      location: { name: coords.name, latitude: coords.latitude, longitude: coords.longitude },
      ...metrics,
    };
  }
}


