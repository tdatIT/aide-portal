import type { AuthResponse, GoogleAuthRequest, ApiResponse, CreatePatientRequest, ExaminationRequest, CreatePatientResponse } from '@/types'
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
  (response: AxiosResponse<ApiResponse<any>>) => {
    return response
  },
  (error: AxiosError<ApiResponse<any>>) => {
    handleApiError(error)
    return Promise.reject(error)
  }
)


// API methods
export const APIClient = {
  login: (credentials: any): Promise<AxiosResponse<AuthResponse>> =>
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

  // Medical Categories
  getClinicalCategories: (params?: any) =>
    axiosClient.get(`${PATIENT_API_URL}/api/v1/admin/clinical-cates`, { params }),
  createClinicalCategory: (data: any) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/clinical-cates`, data),
  updateClinicalCategory: (id: string, data: any) =>
    axiosClient.patch(`${PATIENT_API_URL}/api/v1/admin/clinical-cates/${id}`, data),
  deleteClinicalCategory: (id: string) =>
    axiosClient.delete(`${PATIENT_API_URL}/api/v1/admin/clinical-cates/${id}`),
  getClinicalCategory: (id: string) =>
    axiosClient.get(`${PATIENT_API_URL}/api/v1/admin/clinical-cates/${id}`),

  uploadImages: (formData: FormData) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),



  getParaclinicalCategories: (params?: any) =>
    axiosClient.get(`${PATIENT_API_URL}/api/v1/admin/paraclinical-cates`, { params }),
  createParaclinicalCategory: (data: any) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/paraclinical-cates`, data),
  updateParaclinicalCategory: (id: string, data: any) =>
    axiosClient.patch(`${PATIENT_API_URL}/api/v1/admin/paraclinical-cates/${id}`, data),
  deleteParaclinicalCategory: (id: string) =>
    axiosClient.delete(`${PATIENT_API_URL}/api/v1/admin/paraclinical-cates/${id}`),
  getParaclinicalCategory: (id: string) =>
    axiosClient.get(`${PATIENT_API_URL}/api/v1/admin/paraclinical-cates/${id}`),

  // Patient cases
  getPatients: (params?: any) => axiosClient.get(`${PATIENT_API_URL}/api/v1/admin/patients`, { params }),
  getPatient: (id: string) => axiosClient.get(`${PATIENT_API_URL}/api/v1/admin/patients/${id}`),
  createExamination: (patientId: number, data: ExaminationRequest) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/patients/${patientId}/examination`, data),
  createPatientExamination: (patientId: number, data: ExaminationRequest) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/patients/${patientId}/examination`, data),
  createPatient: (data: CreatePatientRequest): Promise<AxiosResponse<ApiResponse<CreatePatientResponse>>> =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/patients`, data),
  updatePatient: (id: string, data: CreatePatientRequest) =>
    axiosClient.put(`${PATIENT_API_URL}/api/v1/admin/patients/${id}`, data),
  deletePatient: (id: string) => axiosClient.delete(`${PATIENT_API_URL}/api/v1/admin/patients/${id}`),
}

export default axiosClient 