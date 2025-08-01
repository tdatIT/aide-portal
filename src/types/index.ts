// Common types for the admin portal application

export interface User {
  userId: string
  username: string
  fullName: string
  email: string
  roles: string[]
  avatar?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserRole {
  id: string
  name: string
  permissions: string[]
}

// Auth response types
export interface AuthResponse {
  code: number
  message: string
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    user: User
  }
}

export interface GoogleAuthRequest {
  token: string
}

export interface LoginRequest {
  username: string
  password: string
}

// Role management types
export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[]
}

export interface Permission {
  id: string
  name: string
  description: string
  module?: string
}

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  medicalHistory?: string
  createdAt: string
  updatedAt: string
}

export interface ClinicalCategory {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface ParaclinicalCategory {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface MedicalCase {
  id: string
  patientId: string
  patient?: Patient
  categoryId: string
  category?: ClinicalCategory
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  symptoms: string[]
  diagnosis?: string
  treatment?: string
  createdAt: string
  updatedAt: string
}

export interface TestExecution {
  id: string
  userId: string
  user?: User
  testId: string
  testName: string
  startTime: string
  endTime?: string
  score?: number
  status: 'started' | 'completed' | 'abandoned'
  answers: any[]
  createdAt: string
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  monthlyTests: number
  newUsers: number
}

// API Response types - Updated for new format
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T = any> {
  items: T[]
  total: number
  page: number
  size: number
  hasMore: boolean
}

export interface TableColumn {
  title: string
  dataIndex?: string | string[]
  key: string
  width?: number
  fixed?: 'left' | 'right'
  sorter?: boolean
  filters?: any[]
  render?: (value: any, record: any) => any
}

// Menu item type for sidebar
export interface MenuItem {
  key: string
  icon?: any
  label: string
  children?: MenuItem[]
  path?: string
  roles?: string[]
}

// Theme type
export type ThemeMode = 'light' | 'dark'

// Language type
export type Language = 'vi' | 'en' 

// Patient case
export interface PatientItems {
  id: number
  name: string
  language: string
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  age: number
  reasonForVisit: string
  occupation: string
  medicalHistory: string
  dentalHistory: string
  clinicalHistory: string
  requestCount: number
  images: string[] | null
  clinicalResult: string | null
  paraclinicalResult: string | null
  finalDiagnosis: string | null
  diffDiagnosis: string | null
  treatment: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

// Image upload response
export interface UploadedImage {
  id: number
  publicUrl: string
  format: string
}

export interface ImageUploadResponse {
  images: UploadedImage[]
}

// Create patient request/response
export interface CreatePatientRequest {
  language: string
  name: string
  gender: string
  age: number | null
  occupation: string
  reasonForVisit: string
  medicalHistory: string
  dentalHistory: string
  clinicalHistory: string
}

export interface CreatePatientResponse {
  patientId: number
}

export interface ClinicalResult {
  textResult: string
  cateId: number
  imageIds: number[]
}

export interface ParaclinicalResult {
  cateId: number
  textResult: string
  score: boolean
  imageIds: number[]
}

export interface DifferentialDiagnosis {
  name: string
  score: boolean
}

export interface ExaminationRequest {
  clinicalRs: ClinicalResult[]
  paraclinicalRs: ParaclinicalResult[]
  diffDiagnosis: DifferentialDiagnosis[]
  finalDiagnosis: string
  treatment: string
  instruction: string
  aiContext: string
}