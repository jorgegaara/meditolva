import { useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2, Ruler } from 'lucide-react'
import { useAuth } from '../auth.jsx'

// Escala de espesor: muestra la regla de negocio real del sistema (8 mm y 12 mm).
function EscalaEspesor() {
  const zonas = [
    { w: '40%', cls: 'bg-red-400', t: 'Crítico', r: 'menos de 8 mm' },
    { w: '20%', cls: 'bg-amber-400', t: 'Precaución', r: '8 a 12 mm' },
    { w: '40%', cls: 'bg-emerald-400', t: 'Operativo', r: '12 mm o más' },
  ]
  return (
    <figure aria-label="Escala de espesor de la tolva: crítico bajo 8 mm, precaución entre 8 y 12 mm, operativo desde 12 mm">
      <div className="flex h-3 overflow-hidden rounded-full">
        {zonas.map((z) => <div key={z.t} className={z.cls} style={{ width: z.w }} />)}
      </div>
      <div className="relative mt-2 h-5 font-mono text-xs text-slate-400" aria-hidden="true">
        <span className="absolute left-0">0</span>
        <span className="absolute -translate-x-1/2" style={{ left: '40%' }}>8</span>
        <span className="absolute -translate-x-1/2" style={{ left: '60%' }}>12</span>
        <span className="absolute right-0">20 mm</span>
      </div>
      <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        {zonas.map((z) => (
          <li key={z.t} className="flex items-start gap-2.5">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${z.cls}`} aria-hidden="true" />
            <span><span className="block font-medium text-white">{z.t}</span><span className="text-slate-400">{z.r}</span></span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [ver, setVer] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Panel de marca (solo pantallas grandes) */}
      <aside className="hidden flex-col justify-between bg-slate-900 p-12 text-slate-200 lg:flex xl:p-16">
        <div className="flex items-center gap-2.5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-900"><Ruler size={20} /></div>
          <span className="text-lg font-semibold tracking-tight text-white">MediTolva</span>
        </div>

        <div className="max-w-xl">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            Cada medición, con nombre, fecha e instrumento.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300">
            Registra el desgaste de las tolvas CAEX en terreno y deja trazabilidad completa para el equipo de supervisión.
          </p>
          <div className="mt-12"><EscalaEspesor /></div>
        </div>

        <p className="text-sm text-slate-400">Espesor por ultrasonido · Grietas · Desgaste visual</p>
      </aside>

      {/* Formulario */}
      <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10 lg:min-h-0">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white"><Ruler size={20} /></div>
            <span className="text-lg font-semibold tracking-tight">MediTolva</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">Iniciar sesión</h1>
          <p className="mt-2 text-slate-600">Ingresa con tu cuenta de inspector o supervisor.</p>

          <form onSubmit={enviar} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="label">Correo</label>
              <input
                id="email" type="email" className="input" autoComplete="username" inputMode="email"
                placeholder="nombre@empresa.cl" value={email} onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Contraseña</label>
              <div className="relative">
                <input
                  id="password" type={ver ? 'text' : 'password'} className="input pr-12" autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!error} aria-describedby={error ? 'login-error' : undefined}
                />
                <button
                  type="button" onClick={() => setVer(!ver)} aria-pressed={ver}
                  aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-1 top-1/2 grid h-11 w-11 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:text-slate-900"
                >
                  {ver ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p id="login-error" role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
              </p>
            )}

            <button className="btn-primary w-full" disabled={cargando}>
              {cargando ? <><Loader2 size={18} className="animate-spin" /> Ingresando…</> : 'Ingresar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
