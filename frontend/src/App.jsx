import { NavLink, Route, Routes } from 'react-router-dom'
import { ClipboardList, LayoutDashboard, LogOut, PlusCircle, Ruler, Truck } from 'lucide-react'
import { useAuth } from './auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Equipos from './pages/Equipos.jsx'
import Login from './pages/Login.jsx'
import Mediciones from './pages/Mediciones.jsx'
import NuevaMedicion from './pages/NuevaMedicion.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/equipos', label: 'Equipos', icon: Truck },
  { to: '/mediciones', label: 'Mediciones', icon: ClipboardList },
  { to: '/nueva', label: 'Nueva', icon: PlusCircle },
]

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white"><Ruler size={18} /></div>
      <span className="text-lg font-semibold tracking-tight">MediTolva</span>
    </div>
  )
}

export default function App() {
  const { user, logout } = useAuth()
  if (!user) return <Login />

  const iniciales = user.nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="min-h-screen">
      {/* Sidebar fijo (desktop / tablet horizontal) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white p-5 md:flex">
        <Logo />
        <nav className="mt-8 flex flex-col gap-1" aria-label="Principal">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `relative flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition duration-200 ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute -left-5 h-6 w-1 rounded-r bg-accent" aria-hidden="true" />}
                  <Icon size={18} /> {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-3 border-t border-slate-200 pt-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">{iniciales}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.nombre}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <button onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Header sticky (mobile) */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur md:hidden">
        <Logo />
        <button onClick={logout} aria-label="Cerrar sesión"
          className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100">
          <LogOut size={20} />
        </button>
      </header>

      <main className="pb-28 md:pb-10 md:pl-64">
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/mediciones" element={<Mediciones />} />
            <Route path="/nueva" element={<NuevaMedicion />} />
            <Route path="*" element={<p className="text-slate-600">Página no encontrada.</p>} />
          </Routes>
        </div>
      </main>

      {/* Bottom navigation (mobile) */}
      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] cursor-pointer flex-col items-center justify-center gap-1 border-t-2 text-[11px] font-medium transition ${
                isActive ? 'border-accent text-slate-900' : 'border-transparent text-slate-600'
              }`
            }
          >
            <Icon size={22} /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
