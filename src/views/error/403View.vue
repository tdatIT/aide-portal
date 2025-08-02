<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-illustration">
        <div class="error-code">403</div>
      </div>
      
      <h1 class="error-title">Truy cập bị từ chối</h1>
      <p class="error-description">
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được hỗ trợ.
      </p>
      
      <div class="error-actions">
        <a-button type="primary" size="large" @click="goHome">
          Về trang chủ
        </a-button>
        <a-button size="large" @click="goBack" style="margin-left: 16px">
          Quay lại
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
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
  margin-bottom: 32px;
}

.error-actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

[data-theme="dark"] .error-title {
  color: #fff;
}

[data-theme="dark"] .error-description {
  color: #ccc;
}

@media (max-width: 480px) {
  .error-code {
    font-size: 48px;
  }
  
  .error-title {
    font-size: 24px;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style> 