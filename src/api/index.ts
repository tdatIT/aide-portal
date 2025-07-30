import type { AuthResponse, GoogleAuthRequest, LegacyApiResponse, LoginRequest } from '@/types'
import { message } from 'ant-design-vue'
import type { AxiosError, AxiosResponse } from 'axios'
import axios from 'axios'

// API Base URLs
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL
const PATIENT_API_URL = import.meta.env.VITE_PATIENT_API_URL

const axiosClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - Add auth token
const addAuthInterceptor = (client: any) => {
  client.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error: any) => {
      return Promise.reject(error)
    }
  )
}

addAuthInterceptor(axiosClient)


// Common error handler
function handleApiError(error: AxiosError<any>) {
  if (error.response) {
    const { status, data } = error.response

    switch (status) {
      case 401:
        message.error('Phiên đăng nhập đã hết hạn')
        window.location.href = '/login'
        break
      case 403:
        message.error('Bạn không có quyền thực hiện hành động này')
        break
      case 404:
        message.error('Không tìm thấy tài nguyên yêu cầu')
        break
      case 422:
        if (data?.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: string) => message.error(err))
        } else {
          message.error(data?.message || 'Dữ liệu không hợp lệ')
        }
        break
      case 500:
        message.error('Lỗi máy chủ, vui lòng thử lại sau')
        break
      default:
        message.error(data?.message || 'Có lỗi xảy ra')
    }
  } else if (error.request) {
    message.error('Lỗi kết nối mạng')
  } else {
    message.error('Có lỗi xảy ra')
  }
}

axiosClient.interceptors.response.use(
  (response: AxiosResponse<LegacyApiResponse>) => {
    return response
  },
  (error: AxiosError<LegacyApiResponse>) => {
    handleApiError(error)
    return Promise.reject(error)
  }
)


// API methods
export const APIClient = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<AuthResponse>> =>
    axios.post(`${AUTH_API_URL}/api/v1/auth/login`, credentials),

  loginWithGoogle: (request: GoogleAuthRequest): Promise<AxiosResponse<AuthResponse>> =>
    axios.post(`${AUTH_API_URL}/api/v1/auth/oauth2/google`, request),

  logout: () => axiosClient.post(`${AUTH_API_URL}/api/v1/auth/logout`),

  // Legacy APIs - using old format
  getDashboardStats: () => axiosClient.get(`${PATIENT_API_URL}/dashboard/stats`),

  // Users
  getUsers: (params?: any) => axiosClient.get('/users', { params }),
  createUser: (data: any) => axiosClient.post('/users', data),
  updateUser: (id: string, data: any) => axiosClient.put(`/users/${id}`, data),
  deleteUser: (id: string) => axiosClient.delete(`/users/${id}`),
  updateUserPermissions: (id: string, data: any) => axiosClient.put(`/users/${id}/permissions`, data),

  // Roles
  getRoles: () => axiosClient.get('/roles'),
  createRole: (data: any) => axiosClient.post('/roles', data),
  updateRole: (id: string, data: any) => axiosClient.put(`/roles/${id}`, data),
  deleteRole: (id: string) => axiosClient.delete(`/roles/${id}`),

  // Permissions
  getPermissions: () => axiosClient.get('/permissions'),

  // Medical Categories
  getClinicalCategories: (params?: any) => axiosClient.get(`${PATIENT_API_URL}/api/v1/admin/clinical-cates`, { params }),
  createMedicalCategory: (data: any) => axiosClient.post('/medical-categories', data),
  updateMedicalCategory: (id: string, data: any) => axiosClient.put(`/medical-categories/${id}`, data),
  deleteMedicalCategory: (id: string) => axiosClient.delete(`/medical-categories/${id}`),

  // Medical Cases
  getMedicalCases: (params?: any) => axiosClient.get('/medical-cases', { params }),
  getMedicalCase: (id: string) => axiosClient.get(`/medical-cases/${id}`),
  createMedicalCase: (data: any) => axiosClient.post('/medical-cases', data),
  updateMedicalCase: (id: string, data: any) => axiosClient.put(`/medical-cases/${id}`, data),
  deleteMedicalCase: (id: string) => axiosClient.delete(`/medical-cases/${id}`),

  // Test Executions
  getTestExecutions: (params?: any) => axiosClient.get('/test-executions', { params }),
  getTestExecution: (id: string) => axiosClient.get(`/test-executions/${id}`),
}

export default axiosClient 