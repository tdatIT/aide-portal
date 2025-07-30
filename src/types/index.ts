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

// Legacy User interface for backward compatibility
export interface LegacyUser {
  id: string
  email: string
  name: string
  avatar?: string
  role?: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
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

export interface MedicalCategory {
  id: string
  name: string
  description: string
  type: 'examination' | 'test'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MedicalCase {
  id: string
  patientId: string
  patient?: Patient
  categoryId: string
  category?: MedicalCategory
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

export interface LegacyApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
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