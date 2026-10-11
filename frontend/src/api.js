// Cliente HTTP del backend. La URL se configura con VITE_API_URL (fallback: desarrollo local).
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

async function request(path, options = {}) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error('No hay conexión con el servidor. Revisa tu señal e inténtalo de nuevo.')
  }
  if (!res.ok) {
    let detalle = `Error ${res.status}`
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') detalle = body.detail
      else if (Array.isArray(body.detail)) detalle = body.detail.map((d) => d.msg).join('. ')
    } catch { /* respuesta sin JSON */ }
    throw new Error(detalle)
  }
  return res.json()
}

export const api = {
  equipos: () => request('/equipos'),
  crearEquipo: (data) => request('/equipos', { method: 'POST', body: JSON.stringify(data) }),
  mediciones: ({ equipoId, limit = 100 } = {}) => {
    const p = new URLSearchParams({ limit })
    if (equipoId) p.set('equipo_id', equipoId)
    return request(`/mediciones?${p}`)
  },
  crearMedicion: (data) => request('/mediciones', { method: 'POST', body: JSON.stringify(data) }),
  dashboard: () => request('/dashboard/stats'),
}
