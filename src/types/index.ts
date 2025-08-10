// Common types for the admin portal application

// Base User interface
export interface BaseUser {
  id: string
  username: string
  fullname: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // UI state
  statusLoading?: boolean
  // Legacy fields for backward compatibility
  userId?: string
  fullName?: string
  avatar?: string
  role?: UserRole
}

// User for list view (without roles)
export interface User extends BaseUser {
  // No roles field for list view
}

// User for permissions view (with roles)
export interface UserWithRoles extends BaseUser {
  roles?: Role[]
}

export interface UserRole {
  id: string | number
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
    user: UserWithRoles
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
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
  // Legacy fields for backward compatibility
  permissions?: string[]
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
  user?: any
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
  has_more: boolean
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
  status: 'VISIBLE' | 'HIDDEN'
  statusLoading?: boolean
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
  imageIds: number[]
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

// Patient detail response types
export interface PatientImage {
  id: number
  url: string
}

export interface ClinicalResultDetail {
  id: number
  clinicalCateId: number
  testName: string
  textResult: string
  notes: string
  images: PatientImage[]
}

export interface ParaclinicalResultDetail {
  id: number
  paraclinicalCateId: number
  testName: string
  textResult: string
  notes: string
  score: boolean
  images: PatientImage[]
}

export interface FinalDiagnosis {
  name: string
}

export interface DifferentialDiagnosisDetail {
  id: number
  name: string
  score: boolean
}

export interface Treatment {
  treatmentNotes: string
}

export interface PatientDetail {
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
  images: PatientImage[]
  clinicalResult: ClinicalResultDetail[]
  paraclinicalResult: ParaclinicalResultDetail[]
  finalDiagnosis: FinalDiagnosis
  diffDiagnosis: DifferentialDiagnosisDetail[]
  treatment: Treatment
  status: 'PENDING' | 'VISIBLE' | 'HIDDEN'
  aiContext: string
  instruction: string
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export interface ExamSessionListItem {
  sessId: string
  patientId: number
  userId: string
  username: string
  startedAt: string
  expiresAt: string
  finishedAt: string | null
  commScore: number
  clinicalSelectScore: number
  diffDiagScore: number
  finalDiagScore: number
  treatmentScore: number
  aiFeedback: string | null
  selectionFeedback: string | null
  createdAt: string
  updatedAt: string
}

export interface ExamSessionStats {
  date: string
  totalCount: number
  completedCount: number
  processingCount: number
  expiredCount: number
}