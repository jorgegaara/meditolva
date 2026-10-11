import { useEffect, useState } from 'react'
import { MapPin, Plus, Truck } from 'lucide-react'
import { api } from '../api.js'
import { ErrorBox, EstadoBadge, Loading, Titulo } from '../ui.jsx'

const VACIO = { codigo: '', modelo: '', ubicacion: '', tolva: '' }

export default function Equipos() {
  const [equipos, setEquipos] = useState(null)
  const [error, setError] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [form, setForm] = useState(VACIO)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')

  const cargar = () => {
    setError('')
    setEquipos(null)
    api.equipos().then(setEquipos).catch((e) => setError(e.message))
  }
  useEffect(cargar, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function crear(e) {
    e.preventDefault()
    setGuardando(true)
    setErrorForm('')
    try {
      await api.crearEquipo(form)
      setForm(VACIO)
      setAbierto(false)
      cargar()
    } catch (err) {
      setErrorForm(err.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <Titulo sub="Flota de camiones CAEX registrada">Equipos</Titulo>
        <button className="btn-ghost shrink-0" onClick={() => setAbierto(!abierto)}>
          <Plus size={18} /> Nuevo equipo
        </button>
      </div>

      {abierto && (
        <form onSubmit={crear} className="card mb-4 grid gap-4 sm:grid-cols-2">
          <div><label className="label">Código</label><input className="input" required placeholder="CAEX-005" value={form.codigo} onChange={set('codigo')} /></div>
          <div><label className="label">Modelo</label><input className="input" required placeholder="Komatsu 930E" value={form.modelo} onChange={set('modelo')} /></div>
          <div><label className="label">Ubicación</label><input className="input" required placeholder="Rajo Norte" value={form.ubicacion} onChange={set('ubicacion')} /></div>
          <div><label className="label">Tolva</label><input className="input" required placeholder="TOL-005" value={form.tolva} onChange={set('tolva')} /></div>
          {errorForm && <p className="sm:col-span-2 text-sm text-red-600">{errorForm}</p>}
          <div className="sm:col-span-2">
            <button className="btn-primary" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar equipo'}</button>
          </div>
        </form>
      )}

      {error ? (
        <ErrorBox mensaje={error} onRetry={cargar} />
      ) : !equipos ? (
        <Loading />
      ) : equipos.length === 0 ? (
        <p className="text-sm text-slate-400">No hay equipos. Crea el primero con “Nuevo equipo”.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {equipos.map((e) => (
            <div key={e.id} className="card">
              <div className="flex items-start justify-between">
                <div className="h-11 w-11 rounded-xl bg-slate-100 grid place-items-center text-slate-700"><Truck size={20} /></div>
                <EstadoBadge estado={e.estado} />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{e.codigo}</h3>
              <p className="text-sm text-slate-500">{e.modelo}</p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5"><MapPin size={15} /> {e.ubicacion}</span>
                <span className="font-medium">{e.tolva}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
