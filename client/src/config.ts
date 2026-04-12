const apiUrl = import.meta.env.VITE_API_URL as string | undefined

export const API_BASE = apiUrl ?? 'http://localhost:4000'
