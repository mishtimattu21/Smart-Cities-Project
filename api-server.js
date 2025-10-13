import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Weather API endpoint
app.get('/api/weather', async (req, res) => {
  try {
    const { location = "Chennai", latitude, longitude } = req.query;

    let lat = latitude ? Number(latitude) : NaN;
    let lon = longitude ? Number(longitude) : NaN;
    let resolvedName = String(location);
    let country = undefined;

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

    // Fetch weather data from Open-Meteo
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

    // Process weather data
    const precip = Array.isArray(w?.daily?.precipitation_sum)
      ? w.daily.precipitation_sum
      : [];
    const rainfallMmWeek = Number(
      precip.reduce((sum, val) => sum + (Number(val) || 0), 0).toFixed(1)
    );

    const hourlyTemps = Array.isArray(w?.hourly?.temperature_2m)
      ? w.hourly.temperature_2m
      : [];
    const avgTempC = hourlyTemps.length
      ? Number(
          (
            hourlyTemps.reduce((sum, v) => sum + (Number(v) || 0), 0) /
            hourlyTemps.length
          ).toFixed(1)
        )
      : Number(w?.current?.temperature_2m ?? 0);

    const humidityPct = Number(w?.current?.relative_humidity_2m ?? 0);
    const windMs = Number(w?.current?.wind_speed_10m ?? 0);
    const windKmh = Number((windMs * 3.6).toFixed(1));

    const payload = {
      location: { name: resolvedName, latitude: lat, longitude: lon, country },
      rainfallMmWeek,
      avgTempC,
      humidityPct,
      windKmh,
    };
    return res.status(200).json(payload);
  } catch (error) {
    console.error('Weather API error:', error);
    return res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Weather API server is running' });
});

app.listen(PORT, () => {
  console.log(`Weather API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Weather API: http://localhost:${PORT}/api/weather`);
});
