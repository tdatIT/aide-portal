<template>
  <div class="login-container">
    <div class="login-box">
      <!-- Logo and Title -->
      <div class="login-header">
        <h1>AIDE Admin Portal</h1>
      </div>

      <!-- Login Form -->
      <a-form :model="formState" :rules="rules" @finish="handleLogin" @submit.prevent class="login-form" layout="vertical">
        <a-form-item name="username">
          <a-input v-model:value="formState.username" :placeholder="$t('auth.username')" size="large"
            :prefix="h(UserOutlined)" />
        </a-form-item>

        <a-form-item name="password">
          <a-input-password v-model:value="formState.password" :placeholder="$t('auth.password')" size="large"
            :prefix="h(LockOutlined)" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            {{ $t('auth.login') }}
          </a-button>
        </a-form-item>
      </a-form>

      <!-- Divider -->
      <a-divider>
        <span style="color: #999; font-size: 12px;">HOẶC</span>
      </a-divider>

      <!-- Google Sign-in Button -->
      <div id="google-login-fallback" class="google-login-button"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores'
import { APIClient as api } from '@/api'
import {
  UserOutlined,
  LockOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// Google Identity Services configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

// Form state
const formState = reactive({
  username: '',
  password: '',
})

const loading = ref(false)

// Form validation rules
const rules = {
  username: [
    { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
    { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' }
  ]
}

// Load Google Identity Services
onMounted(() => {
  loadGoogleIdentityServices()
})

onUnmounted(() => {
  // Cleanup if needed
  if (window.google?.accounts) {
    window.google.accounts.id.cancel()
  }
})

const loadGoogleIdentityServices = () => {
  // Check if already loaded
  if (window.google?.accounts?.id) {
    initializeGoogleAuth()
    return
  }

  // Load Google Identity Services library
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
    initializeGoogleAuth()
  }
  script.onerror = () => {
    console.error('Failed to load Google Identity Services')
    message.error('Không thể tải Google Identity Services')
  }
  document.head.appendChild(script)
}

const initializeGoogleAuth = () => {
  if (!window.google?.accounts?.id) {
    console.error('Google Identity Services not loaded')
    return
  }

  try {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCallback,
      auto_select: false,
      use_fedcm_for_prompt: false
    })

    window.google.accounts.id.renderButton(
      document.getElementById('google-login-fallback'),
      {
        theme: 'outline',
        size: 'large',
        text: 'signin_with'
      }
    )
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error)
    message.error('Không thể khởi tạo Google Auth')
  }
}

const handleGoogleCallback = async (response: any) => {
  try {

    if (!response?.credential) {
      throw new Error('No credential received from Google')
    }

    // Call API with Google JWT token
    const apiResponse = await api.loginWithGoogle({ token: response.credential })
    const { data } = apiResponse.data

    // Set auth data using new format
    authStore.setAuthData({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user
    })
    message.success('Đăng nhập Google thành công!')
    router.push('/')

  } catch (error: any) {
    console.error('Google login error:', error)
    message.error(error.response?.data?.message || error.message || 'Đăng nhập Google thất bại')
  }
}

// Methods
const handleLogin = async (values: any) => {
  try {
    loading.value = true
    const response = await api.login({
      username: values.username,
      password: values.password
    })

    console.log(response)
    const { data } = response.data

    // Set auth data using new format
    authStore.setAuthData({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user
    })
    message.success('Đăng nhập thành công!')
    router.push('/')

  } catch (error: any) {
    console.error('Login error:', error)
    if (error.response?.status === 401 || error.response?.status === 403) {
      message.error('Tên đăng nhập hoặc mật khẩu không chính xác')  
    } else if (error.response?.status >= 500) {
      message.error('Hệ thống đang gặp sự cố. Vui lòng thử lại sau')
    } else {
      message.error(error.response?.data?.message || 'Đăng nhập thất bại')
    }

    // Reset password field on error
    formState.password = ''
  } finally {
    loading.value = false
  }
}

// Declare global interface for TypeScript
declare global {
  interface Window {
    google: any
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #dbfbdf 0%, #ffffff 100%);
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #00A63E;
  margin-bottom: 8px;
}

.login-header p {
  color: #666;
  font-size: 16px;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 14px !important;
  color: #999 !important;
}

.login-form {
  margin-bottom: 24px;
}

.google-login-button {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  min-height: 40px;
  /* Đảm bảo có chiều cao cho button */
}

.google-login-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.google-login-fallback {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

[data-theme="dark"] .login-box {
  background: #1f1f1f;
  color: #fff;
}

[data-theme="dark"] .login-header p {
  color: #ccc;
}

[data-theme="dark"] .subtitle {
  color: #999 !important;
}

[data-theme="dark"] .google-login-btn {
  background: #2f2f2f;
  border-color: #434343;
  color: #fff;
}

@media (max-width: 480px) {
  .login-box {
    padding: 24px;
  }

  .login-header h1 {
    font-size: 24px;
  }
}
</style>