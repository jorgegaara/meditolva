// Piezas visuales compartidas entre páginas.
import { AlertCircle, Loader2 } from 'lucide-react'

export const ESTADOS = {
  ok: { label: 'Operativo', cls: 'bg-emerald-50 text-emerald-800', dot: 'bg-emerald-600' },
  warn: { label: 'Precaución', cls: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  danger: { label: 'Crítico', cls: 'bg-red-50 text-red-700', dot: 'bg-red-600' },
}

export function EstadoBadge({ estado }) {
  const e = ESTADOS[estado] || ESTADOS.ok
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${e.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${e.dot}`} aria-hidden="true" />
      {e.label}
    </span>
  )
}

export function Loading({ texto = 'Cargando…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-600" role="status">
      <Loader2 className="animate-spin" size={20} /> {texto}
    </div>
  )
}

export function ErrorBox({ mensaje, onRetry }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
      <AlertCircle size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">No se pudieron cargar los datos</p>
        <p className="text-sm">{mensaje}</p>
      </div>
      {onRetry && <button onClick={onRetry} className="btn-ghost !min-h-0 !py-1.5 text-sm">Reintentar</button>}
    </div>
  )
}

export function Titulo({ children, sub }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{children}</h1>
      {sub && <p className="mt-1 text-sm text-slate-600">{sub}</p>}
    </div>
  )
}

export const fmtFecha = (iso) =>
  new Date(iso).toLocaleString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

// "hace 3 h", "hace 2 días"
export function hace(iso) {
  const seg = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  const tramos = [['day', 86400], ['hour', 3600], ['minute', 60]]
  for (const [unidad, s] of tramos) {
    if (Math.abs(seg) >= s) return rtf.format(Math.round(seg / s), unidad)
  }
  return 'justo ahora'
}
