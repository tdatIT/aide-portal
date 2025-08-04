<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-illustration">
        <div class="error-code">403</div>
      </div>
      
      <h1 class="error-title">Truy cập bị từ chối</h1>
      <p class="error-description">
        Bạn không có quyền truy cập vào trang này
      </p>
      <p class="error-suggestion">
        Vui lòng đăng nhập lại hoặc liên hệ quản trị viên để được hỗ trợ.
      </p>
      
      <div class="error-actions">
        <a-button type="primary" size="large" @click="goHome">
          Về trang chủ
        </a-button>
        <a-button 
          type="default" 
          size="large" 
          @click="handleLogin" 
          :loading="isLoading"
          style="margin-left: 16px"
        >
          {{ isLoading ? 'Đang chuyển hướng...' : 'Đăng nhập lại' }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { clearAuth } from '@/utils/auth'
import { Button as AButton } from 'ant-design-vue'
import { ref } from 'vue'

const router = useRouter()
const isLoading = ref(false)

const goHome = () => {
  router.push('/')
}

const handleLogin = async () => {
  isLoading.value = true
  try {
    // Clear all authentication data
    clearAuth()
    console.log('Authentication data cleared, redirecting to login...', {
      timestamp: new Date().toISOString(),
      currentUrl: window.location.href
    })
    // Redirect to login page
    await router.push('/login')
  } catch (error) {
    console.error('Error redirecting to login:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-illustration {
  position: relative;
  margin-bottom: 48px;
}

.error-image {
  width: 120px;
  height: 120px;
  opacity: 0.6;
}

.error-code {
  font-size: 72px;
  font-weight: bold;
  color: #ff4d4f;
  margin-top: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.error-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
}

.error-reasons {
  text-align: left;
  max-width: 400px;
  margin: 0 auto 24px;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.error-reasons li {
  margin-bottom: 8px;
}

.error-suggestion {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
  font-style: italic;
}

.error-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
}

[data-theme="dark"] .error-title {
  color: #fff;
}

[data-theme="dark"] .error-description {
  color: #ccc;
}

[data-theme="dark"] .error-reasons {
  color: #ccc;
}

[data-theme="dark"] .error-suggestion {
  color: #ccc;
}

@media (max-width: 480px) {
  .error-code {
    font-size: 48px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-reasons {
    max-width: 100%;
    padding-left: 16px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .error-actions .ant-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style> 