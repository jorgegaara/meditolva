// Sesión de la interfaz.
// IMPORTANTE: esto es solo una pantalla de acceso de demostración. NO valida credenciales
// ni protege los datos: la API sigue abierta. La autenticación real (Supabase Auth o JWT en
// FastAPI) se agrega en la siguiente etapa; esta capa se reemplaza por esa llamada en login().
import { createContext, useContext, useState } from 'react'

const KEY = 'mt_session'
const AuthCtx = createContext(null)

function leer() {
  try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(leer)

  async function login(email, password) {
    await new Promise((r) => setTimeout(r, 700)) // simula la llamada al servidor
    if (!email.trim() || !password) throw new Error('Ingresa tu correo y tu contraseña.')
    const local = email.split('@')[0].replace(/[._-]+/g, ' ')
    const nombre = local.replace(/\b\w/g, (c) => c.toUpperCase())
    const u = { email: email.trim(), nombre }
    try { localStorage.setItem(KEY, JSON.stringify(u)) } catch { /* modo privado */ }
    setUser(u)
  }

  function logout() {
    try { localStorage.removeItem(KEY) } catch { /* nada */ }
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
