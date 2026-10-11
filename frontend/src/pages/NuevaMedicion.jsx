import { useEffect, useState } from 'react'
import { CheckCircle2, Save } from 'lucide-react'
import { api } from '../api.js'
import { ErrorBox, Loading, Titulo } from '../ui.jsx'

const COMPONENTES = ['Lateral izquierdo', 'Lateral derecho', 'Fondo', 'Boca de descarga', 'Estructura superior']
const TIPOS = {
  'Espesor': { unidad: 'mm', ayuda: 'Medido con ultrasonido. < 8 mm crítico, < 12 mm precaución.' },
  'Grieta largo': { unidad: 'mm', ayuda: 'Largo de la grieta en mm.' },
  'Grieta profundidad': { unidad: 'mm', ayuda: 'Profundidad de la grieta en mm.' },
  'Desgaste visual': { unidad: '/5', ayuda: 'Escala de 1 (nuevo) a 5 (desgaste severo).' },
}

// Inspector e instrumento se recuerdan en el dispositivo: se miden muchos puntos seguidos.
const recordar = (k) => { try { return localStorage.getItem(k) || '' } catch { return '' } }
const guardar = (k, v) => { try { localStorage.setItem(k, v) } catch { /* modo privado */ } }

export default function NuevaMedicion() {
  const [equipos, setEquipos] = useState(null)
  const [errorCarga, setErrorCarga] = useState('')
  const [form, setForm] = useState({
    equipo_id: '', componente: COMPONENTES[0], tipo: 'Espesor', valor: '',
    inspector: recordar('mt_inspector'), instrumento: recordar('mt_instrumento'), observaciones: '',
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    api.equipos().then(setEquipos).catch((e) => setErrorCarga(e.message))
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3500)
    return () => clearTimeout(t)
  }, [toast])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const tipo = TIPOS[form.tipo]
  const visual = form.tipo === 'Desgaste visual'

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      const m = await api.crearMedicion({
        ...form,
        equipo_id: Number(form.equipo_id),
        valor: Number(form.valor),
        unidad: tipo.unidad,
        observaciones: form.observaciones.trim() || null,
      })
      guardar('mt_inspector', form.inspector)
      guardar('mt_instrumento', form.instrumento)
      setToast(`Medición guardada: ${m.equipo_codigo} · ${m.componente} · ${m.valor} ${m.unidad}`)
      setForm({ ...form, valor: '', observaciones: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  if (errorCarga) return <ErrorBox mensaje={errorCarga} />
  if (!equipos) return <Loading />

  return (
    <>
      {toast && (
        <div role="status" className="fixed top-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">
          <CheckCircle2 size={20} className="shrink-0" /> {toast}
        </div>
      )}

      <Titulo sub="Registra una medición en terreno">Nueva medición</Titulo>

      <form onSubmit={enviar} className="card mx-auto max-w-2xl space-y-5">
        <div>
          <label className="label">Equipo</label>
          <select className="input" required value={form.equipo_id} onChange={set('equipo_id')}>
            <option value="">Selecciona un equipo…</option>
            {equipos.map((e) => <option key={e.id} value={e.id}>{e.codigo} — {e.modelo} ({e.tolva})</option>)}
          </select>
          {equipos.length === 0 && <p className="mt-1.5 text-sm text-amber-700">Primero crea un equipo en la sección Equipos.</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Componente</label>
            <select className="input" value={form.componente} onChange={set('componente')}>
              {COMPONENTES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tipo de medición</label>
            <select className="input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value, valor: '' })}>
              {Object.keys(TIPOS).map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Valor ({tipo.unidad})</label>
          <div className="relative">
            <input
              className="input pr-14 text-lg" required type="number" inputMode="decimal"
              step={visual ? 1 : 0.1} min={visual ? 1 : 0} max={visual ? 5 : undefined}
              value={form.valor} onChange={set('valor')} placeholder={visual ? '1 a 5' : '0.0'}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">{tipo.unidad}</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{tipo.ayuda}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Inspector</label>
            <input className="input" required placeholder="Nombre y apellido" value={form.inspector} onChange={set('inspector')} />
          </div>
          <div>
            <label className="label">N° de serie del instrumento</label>
            <input className="input" required placeholder="Ej: UT-2041" value={form.instrumento} onChange={set('instrumento')} />
          </div>
        </div>

        <div>
          <label className="label">Observaciones</label>
          <textarea className="input min-h-[96px]" placeholder="Opcional" value={form.observaciones} onChange={set('observaciones')} />
        </div>

        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button className="btn-primary w-full !py-4 text-base" disabled={guardando || equipos.length === 0}>
          <Save size={20} /> {guardando ? 'Guardando…' : 'Guardar medición'}
        </button>
      </form>
    </>
  )
}
