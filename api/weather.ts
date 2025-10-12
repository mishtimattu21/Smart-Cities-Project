/*
  Vercel Serverless API: /api/weather
  Uses Open-Meteo (no API key required).
  Query params:
    - location: city/district name (preferred)
    - latitude, longitude: optional; overrides location search if provided
*/

type WeatherResponse = {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
  };
  rainfallMmWeek: number;
  avgTempC: number;
  humidityPct: number;
  windKmh: number;
};

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const { location = "Pune", latitude, longitude } = req.query || {};

    let lat = latitude ? Number(latitude) : NaN;
    let lon = longitude ? Number(longitude) : NaN;
    let resolvedName = String(location);
    let country: string | undefined = undefined;

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      // Geocode the location name to coordinates
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        String(location)
      )}&count=1&language=en&format=json`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) {
        return res.status(502).json({ error: "Failed to geocode location" });
      }
      const geo = await geoRes.json();
      if (!geo?.results?.length) {
        return res.status(404).json({ error: "Location not found" });
      }
      lat = geo.results[0].latitude;
      lon = geo.results[0].longitude;
      resolvedName = geo.results[0].name;
      country = geo.results[0].country; 
    }

    // Fetch hourly temps for past 6 days + today, and current conditions; daily precip sums
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
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const wRes = await fetch(weatherUrl);
    if (!wRes.ok) {
      const text = await wRes.text();
      return res.status(502).json({ error: "Open-Meteo error", body: text });
    }
    const w = await wRes.json();

    // Weekly rainfall (past 6 days + today)
    const precip = Array.isArray(w?.daily?.precipitation_sum)
      ? w.daily.precipitation_sum
      : [];
    const rainfallMmWeek = Number(
      precip.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0).toFixed(1)
    );

    // Average temperature from hourly temps over same period
    const hourlyTemps = Array.isArray(w?.hourly?.temperature_2m)
      ? w.hourly.temperature_2m
      : [];
    const avgTempC = hourlyTemps.length
      ? Number(
          (
            hourlyTemps.reduce((sum: number, v: number) => sum + (Number(v) || 0), 0) /
            hourlyTemps.length
          ).toFixed(1)
        )
      : Number(w?.current?.temperature_2m ?? 0);

    const humidityPct = Number(w?.current?.relative_humidity_2m ?? 0);
    const windMs = Number(w?.current?.wind_speed_10m ?? 0);
    const windKmh = Number((windMs * 3.6).toFixed(1));

    const payload: WeatherResponse = {
      location: { name: resolvedName, latitude: lat, longitude: lon, country },
      rainfallMmWeek,
      avgTempC,
      humidityPct,
      windKmh,
    };
    return res.status(200).json(payload);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
}


