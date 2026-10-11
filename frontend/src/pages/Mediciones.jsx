import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { ErrorBox, Loading, Titulo, fmtFecha } from '../ui.jsx'

export default function Mediciones() {
  const [filas, setFilas] = useState(null)
  const [equipos, setEquipos] = useState([])
  const [equipoId, setEquipoId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { api.equipos().then(setEquipos).catch(() => {}) }, [])

  const cargar = () => {
    setError('')
    setFilas(null)
    api.mediciones({ equipoId, limit: 200 }).then(setFilas).catch((e) => setError(e.message))
  }
  useEffect(cargar, [equipoId])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Titulo sub="Historial con trazabilidad de inspector e instrumento">Mediciones</Titulo>
        <select className="input !w-auto" value={equipoId} onChange={(e) => setEquipoId(e.target.value)}>
          <option value="">Todos los equipos</option>
          {equipos.map((e) => <option key={e.id} value={e.id}>{e.codigo}</option>)}
        </select>
      </div>

      {error ? (
        <ErrorBox mensaje={error} onRetry={cargar} />
      ) : !filas ? (
        <Loading />
      ) : filas.length === 0 ? (
        <p className="text-sm text-slate-400">No hay mediciones para mostrar.</p>
      ) : (
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-medium text-slate-500">
              <tr>
                {['Fecha', 'Equipo', 'Componente', 'Tipo', 'Valor', 'Inspector'].map((h) => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filas.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition" title={m.observaciones || ''}>
                  <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">{fmtFecha(m.fecha)}</td>
                  <td className="px-5 py-3.5 font-medium">{m.equipo_codigo}</td>
                  <td className="px-5 py-3.5">{m.componente}</td>
                  <td className="px-5 py-3.5">{m.tipo}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold tabular-nums">{m.valor} <span className="font-normal text-slate-400">{m.unidad}</span></td>
                  <td className="px-5 py-3.5">
                    {m.inspector}
                    <span className="block text-xs text-slate-400">Instr. {m.instrumento}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
