// BrainSpark API Client
import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for AI responses
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('brainspark_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('brainspark_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),

  logout: () => {
    localStorage.removeItem('brainspark_token')
  },
}

// Children API
export const childrenApi = {
  list: () => apiClient.get('/children'),

  create: (data: { name: string; age_group: string; avatar: string }) =>
    apiClient.post('/children', data),

  getStats: (childId: string) => apiClient.get(`/stats/${childId}`),
}

// Chat API
export const chatApi = {
  sendMessage: (data: {
    topic: string
    message: string
    conversation_id?: string
    age_group: string
    preferred_model?: 'claude' | 'grok'
    enable_fallback?: boolean
  }) => apiClient.post('/chat', data),
}

// Topics API
export const topicsApi = {
  list: () => apiClient.get('/topics'),
  getProgress: (childId: string) => apiClient.get(`/progress/${childId}`),
}

// Progress API - Knowledge Constellation tracking
export const progressApi = {
  get: (childId: string) => apiClient.get(`/progress/${childId}`),
  update: (childId: string, data: { topic_id: string; depth: number; questions_asked: number }) =>
    apiClient.post(`/progress/${childId}/update`, data),
}

// Streak API - Daily login tracking
export const streakApi = {
  get: (childId: string) => apiClient.get(`/streak/${childId}`),
  checkIn: (childId: string) => apiClient.post(`/streak/${childId}/check-in`),
}

// Achievements API - Badge unlocking
export const achievementsApi = {
  get: (childId: string) => apiClient.get(`/achievements/${childId}`),
  unlock: (childId: string, data: { achievement_id: string; star_bonus?: number }) =>
    apiClient.post(`/achievements/${childId}/unlock`, data),
}

// Brain Spark API (Daily Questions)
export const brainSparkApi = {
  getDaily: (ageGroup: string) => apiClient.get(`/brain-spark/daily?age_group=${ageGroup}`),
}

export default apiClient
