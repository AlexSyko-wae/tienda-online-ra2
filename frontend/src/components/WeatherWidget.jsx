import { useEffect, useState } from 'react';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=32.46&longitude=-114.77&current=temperature_2m,relative_humidity_2m,weather_code&timezone=America%2FHermosillo';
function condition(code) {
  if (code === 0) return 'Cielo despejado';
  if (code <= 3) return 'Parcialmente nublado';
  if (code <= 48) return 'Niebla';
  if (code <= 67) return 'Lluvia';
  if (code <= 77) return 'Nieve';
  return 'Chubascos o tormenta';
}
export function WeatherWidget() {
  const [weather, setWeather] = useState(null); const [error, setError] = useState(''); const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); let active = true;
    setError(''); setWeather(null);
    const timer = setTimeout(() => controller.abort(), 15000);
    async function load() {
      try {
        const response = await fetch(WEATHER_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('El proveedor del clima no está disponible.');
        const data = await response.json();
        if (typeof data.current?.temperature_2m !== 'number') throw new Error('El clima llegó incompleto.');
        if (active) setWeather(data.current);
      } catch (err) { if (active) setError(err.name === 'AbortError' ? 'La consulta tardó demasiado.' : 'No pudimos cargar el clima. Comprueba tu conexión.'); }
      finally { clearTimeout(timer); }
    }
    load(); return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [attempt]);
  return <section className="panel weather-panel" aria-labelledby="weather-title"><div className="panel-heading"><p className="eyebrow">AFUERA, AHORA</p><span className="weather-icon" aria-hidden="true">☀</span></div><h2 id="weather-title">San Luis Río Colorado</h2>
    {!weather && !error && <p role="status">Consultando el clima…</p>}
    {error && <div role="alert"><p>{error}</p><button className="text-button" onClick={() => setAttempt(attempt + 1)}>Volver a consultar ↗</button></div>}
    {weather && <><div className="temperature">{Math.round(weather.temperature_2m)}<span>°C</span></div><p className="weather-condition">{condition(weather.weather_code)}</p><div className="weather-meta"><span>Humedad <strong>{weather.relative_humidity_2m}%</strong></span><span>Hora local <strong>{weather.time.slice(11, 16)}</strong></span></div></>}
    <a className="provider-link" href="https://open-meteo.com/" target="_blank" rel="noreferrer">Datos meteorológicos de Open-Meteo ↗</a>
  </section>;
}
