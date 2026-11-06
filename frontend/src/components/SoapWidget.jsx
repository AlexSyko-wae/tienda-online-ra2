import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '../api/client';
export function SoapWidget() {
  const [number, setNumber] = useState('125'); const [result, setResult] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);
  async function convert(event) {
    event.preventDefault(); setError(''); setResult(null);
    if (!/^\d+$/.test(number) || Number(number) > 999999) { setError('Escribe un entero de 0 a 999999.'); return; }
    requestRef.current?.abort(); const controller = new AbortController(); requestRef.current = controller;
    setLoading(true);
    try { setResult(await apiRequest(`/integrations/soap/number-to-words/?number=${encodeURIComponent(number)}`, { signal: controller.signal })); }
    catch (err) { if (err.name !== 'AbortError') setError(err.message); }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }
  return <section className="panel soap-panel" aria-labelledby="soap-title"><p className="eyebrow">PEQUEÑAS HERRAMIENTAS</p><h2 id="soap-title">Los números, en palabras.</h2><p className="muted">Convierte una cantidad a texto en inglés.</p><form onSubmit={convert} className="convert-form"><label htmlFor="soap-number">Cantidad</label><div><input id="soap-number" type="number" min="0" max="999999" step="1" value={number} onChange={(e) => { setNumber(e.target.value); setResult(null); }} required /><button type="submit" disabled={loading}>{loading ? 'Consultando…' : 'Convertir ↗'}</button></div></form>
    {error && <p role="alert" className="error-message">{error}</p>}
    {result && <div className="soap-result" role="status"><span>{result.number} EN PALABRAS</span><p>{result.words}</p><small>Respuesta recibida desde DataAccess · SOAP</small></div>}
    <p className="provider-link">Servicio de conversión de DataAccess</p>
    {result && <details className="technical-detail"><summary>Ver respuesta del servicio</summary><pre>{JSON.stringify(result, null, 2)}</pre></details>}
  </section>;
}
