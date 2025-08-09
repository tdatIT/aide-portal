import type { AuthResponse, GoogleAuthRequest, ApiResponse, CreatePatientRequest, ExaminationRequest, CreatePatientResponse, ImageUploadResponse, PatientDetail, User, UserWithRoles, PaginatedResponse, Role, ExamSessionListItem } from '@/types'
import { message } from 'ant-design-vue'
import type { AxiosError, AxiosResponse } from 'axios'
import axios from 'axios'
import { useAuthStore } from '@/stores'

// API Base URLs
const USER_API_URL = import.meta.env.VITE_USER_API_URL
const PATIENT_API_URL = import.meta.env.VITE_PATIENT_API_URL
const EXAM_API_URL = import.meta.env.VITE_EXAM_API_URL

const axiosClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: string | null) => void
  reject: (error?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

// Helper function to retry request with new token
const retryRequest = (originalRequest: any, token: string) => {
  if (originalRequest) {
    originalRequest.headers.Authorization = `Bearer ${token}`
    return axiosClient(originalRequest)
  }
  return Promise.reject(new Error('No original request to retry'))
}

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
async function handleApiError(error: AxiosError<any>) {
  if (error.response) {
    const { status, data } = error.response

    switch (status) {
      case 401:
        // Check if it's a token refresh error (code 108)
        if (data?.code === 108) {
          const originalRequest = error.config

          if (isRefreshing) {
            // If already refreshing, add to queue
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            }).then((token: unknown) => {
              if (originalRequest && token && typeof token === 'string') {
                return retryRequest(originalRequest, token)
              }
            }).catch(err => {
              return Promise.reject(err)
            })
          }

          isRefreshing = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')
            if (!refreshToken) {
              message.error('Phiên đăng nhập đã hết hạn')
              window.location.href = '/login'
              return
            }

            // Call refresh token API
            const response = await APIClient.refreshToken(refreshToken)
            const authData = response.data.data

            // Update auth store with new tokens
            const authStore = useAuthStore()
            authStore.setAuthData({
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken,
              user: authData.user
            })

            // Process queue and retry original request
            processQueue(null, authData.accessToken)

            if (originalRequest) {
              return retryRequest(originalRequest, authData.accessToken)
            }
          } catch (refreshError: any) {
            console.error('Token refresh failed:', refreshError)
            message.error('Phiên đăng nhập đã hết hạn')

            // Clear auth data and redirect to login
            const authStore = useAuthStore()
            authStore.logout()

            processQueue(refreshError, null)
            window.location.href = '/login'
            return
          } finally {
            isRefreshing = false
          }
        } else {
          message.error('Phiên đăng nhập đã hết hạn')
          window.location.href = '/login'
        }
        break
      case 403:
        message.error('Bạn không có quyền thực hiện hành động này. Đang chuyển hướng...')
        setTimeout(() => {
          window.location.href = '/403'
        }, 1500)
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
  async (error: AxiosError<ApiResponse<any>>) => {
    await handleApiError(error)
    return Promise.reject(error)
  }
)


// API methods
export const APIClient = {
  login: (credentials: any): Promise<AxiosResponse<AuthResponse>> =>
    axios.post(`${USER_API_URL}/api/v1/auth/login`, credentials),
  loginWithGoogle: (request: GoogleAuthRequest): Promise<AxiosResponse<AuthResponse>> =>
    axios.post(`${USER_API_URL}/api/v1/auth/oauth2/google`, request),
  refreshToken: (refreshToken: string): Promise<AxiosResponse<AuthResponse>> =>
    axios.post(`${USER_API_URL}/api/v1/auth/token/refresh`, { token: refreshToken }),
  logout: () => axiosClient.get(`${USER_API_URL}/api/v1/auth/logout`),


  // tracking
  heartbeat: (): Promise<AxiosResponse<ApiResponse>> =>
    axiosClient.get(`${USER_API_URL}/api/v1/tracking/heartbeat`),
  // Legacy APIs - using old format
  getDashboardStats: () => axiosClient.get(`${PATIENT_API_URL}/dashboard/stats`),

  // Users
  getUsers: (params?: any): Promise<AxiosResponse<ApiResponse<PaginatedResponse<User>>>> =>
    axiosClient.get(`${USER_API_URL}/api/v1/iam/users`, { params }),
  getUser: (id: string): Promise<AxiosResponse<ApiResponse<UserWithRoles>>> =>
    axiosClient.get(`${USER_API_URL}/api/v1/iam/users/${id}`),
  updateUserStatus: (id: string, isActive: boolean) =>
    axiosClient.patch(`${USER_API_URL}/api/v1/iam/users/${id}/status`, { isActive }),
  updateUserPermissions: (id: string, data: any) => axiosClient.put(`/users/${id}/permissions`, data),

  // Roles
  getRoles: (): Promise<AxiosResponse<ApiResponse<PaginatedResponse<Role>>>> =>
    axiosClient.get(`${USER_API_URL}/api/v1/iam/roles`),
  updateRoleMapping: (userId: string, roleIds: number[]) =>
    axiosClient.patch(`${USER_API_URL}/api/v1/iam/role-mapping`, { userId, roleIds }),

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

  uploadImages: (formData: FormData): Promise<AxiosResponse<ApiResponse<ImageUploadResponse>>> =>
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
  getPatient: (id: string): Promise<AxiosResponse<ApiResponse<PatientDetail>>> =>
    axiosClient.get(`${PATIENT_API_URL}/api/v1/admin/patients/${id}`),
  createExamination: (patientId: number, data: ExaminationRequest) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/patients/${patientId}/examination`, data),
  createPatientExamination: (patientId: number, data: ExaminationRequest) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/patients/${patientId}/examination`, data),
  createPatient: (data: CreatePatientRequest): Promise<AxiosResponse<ApiResponse<CreatePatientResponse>>> =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/patients`, data),
  updatePatient: (id: string, data: CreatePatientRequest) =>
    axiosClient.put(`${PATIENT_API_URL}/api/v1/admin/patients/${id}`, data),
  updatePatientStatus: (id: string, status: string) =>
    axiosClient.patch(`${PATIENT_API_URL}/api/v1/admin/patients/${id}/status`, { status }),
  deletePatient: (id: string) => axiosClient.delete(`${PATIENT_API_URL}/api/v1/admin/patients/${id}`),

  // Update patient profile
  updatePatientProfile: (id: string, data: any) =>
    axiosClient.patch(`${PATIENT_API_URL}/api/v1/admin/patients/${id}/profile`, data),

  // Clinical results management
  createClinicalResult: (data: any) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/clinical-results`, data),
  updateClinicalResult: (id: string, data: any) =>
    axiosClient.patch(`${PATIENT_API_URL}/api/v1/admin/clinical-results/${id}`, data),
  deleteClinicalResult: (id: string) =>
    axiosClient.delete(`${PATIENT_API_URL}/api/v1/admin/clinical-results/${id}`),

  // Paraclinical results management
  createParaclinicalResult: (data: any) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/paraclinical-results`, data),
  updateParaclinicalResult: (id: string, data: any) =>
    axiosClient.patch(`${PATIENT_API_URL}/api/v1/admin/paraclinical-results/${id}`, data),
  deleteParaclinicalResult: (id: string) =>
    axiosClient.delete(`${PATIENT_API_URL}/api/v1/admin/paraclinical-results/${id}`),

  // Update patient examination
  updatePatientExamination: (id: string, data: any) =>
    axiosClient.patch(`${PATIENT_API_URL}/api/v1/admin/patients/${id}/examination`, data),

  // Differential diagnosis management
  createDiffDiagnosis: (data: any) =>
    axiosClient.post(`${PATIENT_API_URL}/api/v1/admin/diff-diagnoses`, data),
  updateDiffDiagnosis: (id: string, data: any) =>
    axiosClient.patch(`${PATIENT_API_URL}/api/v1/admin/diff-diagnoses/${id}`, data),
  deleteDiffDiagnosis: (id: string) =>
    axiosClient.delete(`${PATIENT_API_URL}/api/v1/admin/diff-diagnoses/${id}`),

  // Delete image
  deleteImage: (id: string) =>
    axiosClient.delete(`${PATIENT_API_URL}/api/v1/admin/images/${id}`),

  // get all exam
  getAllExam: (page: number, size: number, from_date?: string, to_date?: string):
    Promise<AxiosResponse<ApiResponse<PaginatedResponse<ExamSessionListItem>>>> =>
    axiosClient.get(`${EXAM_API_URL}/api/v1/stats/exam-session`, { params: { page, size, from_date, to_date } }),

  //Statistics
  countAllUser: (): Promise<AxiosResponse<ApiResponse<{ count: number }>>> =>
    axiosClient.get(`${USER_API_URL}/api/v1/stats/all-user`),
  countNewUser: (): Promise<AxiosResponse<ApiResponse<{ count: number }>>> =>
    axiosClient.get(`${USER_API_URL}/api/v1/stats/new-user`),
  countOnlineUser: (): Promise<AxiosResponse<ApiResponse<{ count: number }>>> =>
    axiosClient.get(`${USER_API_URL}/api/v1/stats/online-user`),
  countCurrentTest: (): Promise<AxiosResponse<ApiResponse<{ total: number }>>> =>
    axiosClient.get(`${EXAM_API_URL}/api/v1/stats/exam-session/process/count`),
}

export default axiosClient 