<template>
  <div class="login-container">
    <div class="login-box">
      <!-- Logo and Title -->
      <div class="login-header">
        <h1>Admin Portal</h1>
      </div>

      <!-- Login Form -->
      <a-form
        :model="formState"
        :rules="rules"
        @finish="handleLogin"
        class="login-form"
        layout="vertical"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="formState.username"
            :placeholder="$t('auth.username')"
            size="large"
            :prefix="h(UserOutlined)"
          />
        </a-form-item>

        <a-form-item name="password" >
          <a-input-password
            v-model:value="formState.password"
            :placeholder="$t('auth.password')"
            size="large"
            :prefix="h(LockOutlined)"
          />
        </a-form-item>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            {{ $t('auth.login') }}
          </a-button>
        </a-form-item>
      </a-form>

      <!-- Divider -->
      <a-divider>
        <span style="color: #999; font-size: 12px;">HOẶC</span>
      </a-divider>

      <!-- Google Identity Services Button -->
      <a-button
        size="large"
        block
        class="google-login-btn"
        @click="handleGoogleLogin"
        :loading="googleLoading"
      >
        <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style="width: 20px; height: 20px; margin-right: 10px;" />
        {{ $t('auth.loginWithGoogle') }}
      </a-button>

      
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
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'

// Form state
const formState = reactive({
  username: '',
  password: '',
  remember: false
})

const loading = ref(false)
const googleLoading = ref(false)
const isGoogleSDKLoaded = ref(false)

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
    isGoogleSDKLoaded.value = true
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
      // Enable FedCM for better privacy
      use_fedcm_for_prompt: true,
      // Disable automatic prompts, use button mode only
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true
    })
  } catch (error) {
    console.error('Failed to initialize Google Auth:', error)
    message.error('Không thể khởi tạo Google Auth')
  }
}

const handleGoogleCallback = async (response: any) => {
  try {
    googleLoading.value = true
    
    if (!response?.credential) {
      throw new Error('No credential received from Google')
    }
    
    // Call API with Google JWT token
    const apiResponse = await api.loginWithGoogle({ token: response.credential })
    const { data } = apiResponse.data
    
    // Set auth data using new format
    authStore.setAuthData(data)
    
    message.success('Đăng nhập Google thành công!')
    router.push('/')
    
  } catch (error: any) {
    console.error('Google login error:', error)
    message.error(error.response?.data?.message || error.message || 'Đăng nhập Google thất bại')
  } finally {
    googleLoading.value = false
  }
}

// Methods
const handleLogin = async (values: any) => {
  try {
    loading.value = true
    
    // Demo bypass - check for demo credentials
    if (values.username === 'admin@example.com' && values.password === '123456') {
      // Mock successful login with new format
      const mockAuthData = {
        accessToken: 'demo-access-token-12345',
        refreshToken: 'demo-refresh-token-12345',
        user: {
          userId: '1',
          username: 'admin@example.com',
          fullName: 'Admin User',
          email: 'admin@example.com',
          roles: ['ROLE_ADMIN', 'ROLE_USER'],
          avatar: 'https://via.placeholder.com/32',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
      
      authStore.setAuthData(mockAuthData)
      
      message.success('Đăng nhập thành công!')
      router.push('/')
      return
    }

    // Real API call
    const response = await api.login({
      username: values.username,
      password: values.password
    })

    const { data } = response.data
    
    // Set auth data using new format
    authStore.setAuthData(data)
    
    message.success('Đăng nhập thành công!')
    router.push('/')
    
  } catch (error: any) {
    console.error('Login error:', error)
    message.error(error.response?.data?.message || error.message || 'Đăng nhập thất bại')
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    googleLoading.value = true
    
    if (!window.google?.accounts?.id) {
      message.error('Google Identity Services chưa được tải')
      return
    }

    if (!isGoogleSDKLoaded.value) {
      message.info('Đang tải Google Identity Services...')
      return
    }
    
    // Use Google Identity Services prompt with FedCM
    // This requires user gesture (button click) for privacy/security
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        // If One Tap is not displayed, user might not be signed in to Google
        // or has dismissed it. This is normal behavior with FedCM.
        console.log('Google One Tap not displayed:', notification.getNotDisplayedReason())
        message.info('Vui lòng đăng nhập Google trước hoặc cho phép popup')
      } else if (notification.isSkippedMoment()) {
        // User explicitly skipped the moment
        console.log('Google One Tap skipped')
        message.info('Đăng nhập Google đã bị bỏ qua')
      }
    })
    
  } catch (error) {
    console.error('Google login error:', error)
    message.error('Lỗi khởi tạo đăng nhập Google')
  } finally {
    // Set loading false after a delay since prompt might be async
    setTimeout(() => {
      googleLoading.value = false
    }, 1000)
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

.google-login-btn {
  border: 1px solid #dadce0;
  color: #3c4043;
  background: #fff;
  margin-bottom: 24px;
}

.google-login-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
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