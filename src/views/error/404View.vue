<template>
  <div class="error-container">
    <div class="error-content">
      <div class="error-illustration">
        <img src="/vite.svg" alt="404" class="error-image" />
        <div class="error-code">404</div>
      </div>
      
      <h1 class="error-title">Trang không tìm thấy</h1>
      <p class="error-description">
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
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
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  color: #1890ff;
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