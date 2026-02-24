import { create } from 'zustand'

const STORAGE_KEY = 'observer_manager_basic_auth'

function encodeCredentials(username: string, password: string) {
  return btoa(`${username}:${password}`)
}

function readStoredCredentials() {
  return localStorage.getItem(STORAGE_KEY)
}

function persistCredentials(encoded: string) {
  localStorage.setItem(STORAGE_KEY, encoded)
}

function clearStoredCredentials() {
  localStorage.removeItem(STORAGE_KEY)
}

function getEnvCredentials() {
  const username = import.meta.env.VITE_API_USERNAME
  const password = import.meta.env.VITE_API_PASSWORD
  if (typeof username === 'string' && username && typeof password === 'string' && password) {
    return encodeCredentials(username, password)
  }
  return null
}

const storedToken = typeof window !== 'undefined' ? readStoredCredentials() : null
const envToken = getEnvCredentials()
const initialToken = storedToken ?? envToken
if (initialToken && initialToken !== storedToken && typeof window !== 'undefined') {
  persistCredentials(initialToken)
}

interface AuthState {
  encoded: string | null
  isLoginOpen: boolean
  login: (username: string, password: string) => void
  clearCredentials: () => void
  setLoginOpen: (open: boolean) => void
}

export const authStore = create<AuthState>((set) => ({
  encoded: initialToken,
  isLoginOpen: !initialToken,
  login: (username, password) => {
    const encoded = encodeCredentials(username, password)
    persistCredentials(encoded)
    set({ encoded, isLoginOpen: false })
  },
  clearCredentials: () => {
    clearStoredCredentials()
    set({ encoded: null, isLoginOpen: true })
  },
  setLoginOpen: (open) => set({ isLoginOpen: open }),
}))

export const useAuthStore = authStore
