import axios, { AxiosError } from 'axios'
import { authStore } from '@/store/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = authStore.getState().encoded
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Basic ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      authStore.getState().clearCredentials()
    }
    return Promise.reject(error)
  },
)
