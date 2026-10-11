import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { AlertTriangle, CalendarDays, ClipboardList, Plus, Truck } from 'lucide-react'
import { api } from '../api.js'
import { ErrorBox, ESTADOS, EstadoBadge, hace } from '../ui.jsx'

const TICK = { fontSize: 12, fill: '#475569' }
const unidadDe = (tipo) => (tipo === 'Desgaste visual' ? '/5' : 'mm')
// Color del valor de un espesor según la regla de negocio (8 mm / 12 mm)
const tonoEspesor = (tipo, v) =>
  tipo !== 'Espesor' ? 'text-slate-900' : v < 8 ? 'text-red-700' : v < 12 ? 'text-amber-700' : 'text-slate-900'

/* ---------- Esqueleto de carga ---------- */
function Esqueleto() {
  const caja = 'animate-pulse rounded-2xl bg-slate-200/70 motion-reduce:animate-none'
  return (
    <div role="status" aria-label="Cargando dashboard" className="space-y-4">
      <div className={`${caja} h-14 w-2/3 sm:w-1/3`} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className={`${caja} h-28`} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${caja} h-80 lg:col-span-2`} />
        <div className={`${caja} h-80`} />
      </div>
    </div>
  )
}

/* ---------- Tarjeta KPI ---------- */
function Kpi({ icon: Icon, label, value, nota, alerta }) {
  return (
    <div className={`card !p-4 sm:!p-5 ${alerta ? '!border-red-200' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${alerta ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
          <Icon size={18} aria-hidden="true" />
        </div>
      </div>
      <p className={`mt-3 font-mono text-3xl font-semibold tabular-nums sm:text-4xl ${alerta ? 'text-red-700' : ''}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500 sm:text-sm">{nota}</p>
    </div>
  )
}

/* ---------- Estado de la flota ---------- */
function EstadoFlota({ equipos }) {
  const conteo = useMemo(() => {
    const c = { danger: 0, warn: 0, ok: 0 }
    equipos.forEach((e) => { c[e.estado] = (c[e.estado] || 0) + 1 })
    return c
  }, [equipos])
  const orden = { danger: 0, warn: 1, ok: 2 }
  const lista = [...equipos].sort((a, b) => orden[a.estado] - orden[b.estado] || a.codigo.localeCompare(b.codigo)).slice(0, 5)
  const total = equipos.length

  return (
    <section className="card flex flex-col" aria-labelledby="t-flota">
      <h2 id="t-flota" className="font-semibold">Estado de la flota</h2>
      <p className="mb-4 text-sm text-slate-600">Según el último espesor medido</p>

      {total === 0 ? (
        <p className="text-sm text-slate-500">Aún no hay equipos registrados.</p>
      ) : (
        <>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            {['danger', 'warn', 'ok'].map((k) => conteo[k] > 0 && (
              <div key={k} className={ESTADOS[k].dot} style={{ width: `${(conteo[k] / total) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {['danger', 'warn', 'ok'].map((k) => (
              <li key={k} className="flex items-center gap-1.5 text-slate-700">
                <span className={`h-2 w-2 rounded-full ${ESTADOS[k].dot}`} aria-hidden="true" />
                {ESTADOS[k].label} <span className="font-mono font-medium text-slate-900">{conteo[k]}</span>
              </li>
            ))}
          </ul>

          <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
            {lista.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{e.codigo}</p>
                  <p className="truncate text-xs text-slate-500">{e.tolva} · {e.ubicacion}</p>
                </div>
                <EstadoBadge estado={e.estado} />
              </li>
            ))}
          </ul>
          <Link to="/equipos" className="mt-auto pt-4 text-sm font-medium text-slate-700 underline-offset-4 hover:underline">
            Ver todos los equipos
          </Link>
        </>
      )}
    </section>
  )
}

/* ---------- Página ---------- */
export default function Dashboard() {
  const [data, setData] = useState(null)
  const [equipos, setEquipos] = useState([])
  const [error, setError] = useState('')

  const cargar = () => {
    setError('')
    setData(null)
    Promise.all([api.dashboard(), api.equipos()])
      .then(([d, e]) => { setData(d); setEquipos(e) })
      .catch((e) => setError(e.message))
  }
  useEffect(cargar, [])

  if (error) return <ErrorBox mensaje={error} onRetry={cargar} />
  if (!data) return <Esqueleto />

  const hoyTxt = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
  const hoy = hoyTxt.charAt(0).toUpperCase() + hoyTxt.slice(1)
  const tendencia = data.tendencia.map((t) => ({ ...t, etiqueta: t.dia.slice(8) + '/' + t.dia.slice(5, 7) }))
  const ultimo = tendencia[tendencia.length - 1]

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">{hoy}</p>
        </div>
        <Link to="/nueva" className="btn-primary w-full sm:w-auto"><Plus size={18} /> Nueva medición</Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kpi icon={Truck} label="Equipos" value={data.total_equipos} nota="en la flota" />
        <Kpi icon={ClipboardList} label="Mediciones" value={data.total_mediciones} nota="registradas en total" />
        <Kpi
          icon={AlertTriangle} label="Críticos" value={data.criticos} alerta={data.criticos > 0}
          nota={data.criticos > 0 ? 'requieren intervención' : 'sin equipos críticos'}
        />
        <Kpi icon={CalendarDays} label="Últimos 7 días" value={data.ultimas_semana} nota="mediciones recientes" />
      </div>

      {/* Tendencia + flota */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <section className="card lg:col-span-2" aria-labelledby="t-tend">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 id="t-tend" className="font-semibold">Espesor promedio</h2>
              <p className="text-sm text-slate-600">Últimos 30 días, en mm</p>
            </div>
            {ultimo && (
              <p className="font-mono text-sm text-slate-600">
                Último: <span className="text-base font-semibold text-slate-900">{ultimo.promedio} mm</span>
              </p>
            )}
          </div>

          {tendencia.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-500">Aún no hay mediciones de espesor en los últimos 30 días.</p>
          ) : (
            <div
              className="mt-4 h-64 sm:h-72 lg:h-80" role="img"
              aria-label={`Gráfico de línea del espesor promedio. Último valor ${ultimo.promedio} mm el ${ultimo.etiqueta}. Umbrales: crítico bajo 8 mm, precaución bajo 12 mm.`}
            >
              <ResponsiveContainer>
                <LineChart data={tendencia} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="etiqueta" tick={TICK} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis tick={TICK} tickLine={false} axisLine={false} width={40}
                    domain={[0, (max) => Math.max(16, Math.ceil((max + 1) / 4) * 4)]} />
                  <Tooltip formatter={(v) => [`${v} mm`, 'Promedio']} labelFormatter={(l) => `Día ${l}`} />
                  <ReferenceLine y={12} stroke="#d97706" strokeDasharray="4 4"
                    label={{ value: '12 mm', position: 'insideTopRight', fill: '#b45309', fontSize: 11 }} />
                  <ReferenceLine y={8} stroke="#dc2626" strokeDasharray="4 4"
                    label={{ value: '8 mm', position: 'insideTopRight', fill: '#b91c1c', fontSize: 11 }} />
                  <Line type="monotone" dataKey="promedio" stroke="#334155" strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#334155', strokeWidth: 0 }} activeDot={{ r: 5.5, fill: '#059669', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Alternativa accesible al gráfico */}
          <table className="sr-only">
            <caption>Espesor promedio diario en mm</caption>
            <thead><tr><th>Día</th><th>Promedio</th></tr></thead>
            <tbody>{tendencia.map((t) => <tr key={t.dia}><td>{t.dia}</td><td>{t.promedio}</td></tr>)}</tbody>
          </table>
        </section>

        <EstadoFlota equipos={equipos} />
      </div>

      {/* Por tipo + actividad */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <section className="card" aria-labelledby="t-tipo">
          <h2 id="t-tipo" className="font-semibold">Mediciones por tipo</h2>
          <p className="mb-4 text-sm text-slate-600">Cantidad total registrada</p>
          {data.por_tipo.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Sin datos todavía.</p>
          ) : (
            <div className="h-60" role="img" aria-label={'Mediciones por tipo: ' + data.por_tipo.map((p) => `${p.tipo} ${p.cantidad}`).join(', ')}>
              <ResponsiveContainer>
                <BarChart data={data.por_tipo} layout="vertical" margin={{ top: 0, right: 28, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis type="category" dataKey="tipo" width={116} tick={TICK} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} formatter={(v) => [v, 'Mediciones']} />
                  <Bar dataKey="cantidad" fill="#475569" radius={[0, 6, 6, 0]} barSize={20}>
                    <LabelList dataKey="cantidad" position="right" style={{ fontFamily: '"Fira Code", monospace', fontSize: 12, fill: '#0f172a' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card lg:col-span-2" aria-labelledby="t-act">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="t-act" className="font-semibold">Actividad reciente</h2>
            <Link to="/mediciones" className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline">Ver historial</Link>
          </div>
          {data.actividad_reciente.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">Sin actividad todavía. Registra la primera medición desde “Nueva medición”.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.actividad_reciente.map((a, i) => (
                <li key={i} className="flex items-center gap-3 py-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 font-mono text-xs font-semibold text-slate-700" aria-hidden="true">
                    {a.equipo.replace(/\D/g, '').slice(-3) || a.equipo.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{a.equipo} · {a.componente}</p>
                    <p className="truncate text-xs text-slate-500">{a.tipo} · {hace(a.fecha)}</p>
                  </div>
                  <p className={`shrink-0 font-mono text-sm font-semibold tabular-nums ${tonoEspesor(a.tipo, a.valor)}`}>
                    {a.valor} <span className="font-normal text-slate-500">{unidadDe(a.tipo)}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
