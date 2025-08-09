import { onMounted, onUnmounted, ref } from 'vue'
import heartbeatService from '@/utils/heartbeat'
import { useAuthStore } from '@/stores'

export function useHeartbeat() {
  const isActive = ref(false)
  const authStore = useAuthStore()

  /**
   * Bắt đầu heartbeat
   */
  const startHeartbeat = () => {
    if (authStore.isAuthenticated) {
      heartbeatService.start()
      isActive.value = true
    }
  }

  /**
   * Dừng heartbeat
   */
  const stopHeartbeat = () => {
    heartbeatService.stop()
    isActive.value = false
  }

  /**
   * Restart heartbeat
   */
  const restartHeartbeat = () => {
    heartbeatService.restart()
    isActive.value = heartbeatService.isActive()
  }

  /**
   * Kiểm tra trạng thái heartbeat
   */
  const checkHeartbeatStatus = () => {
    isActive.value = heartbeatService.isActive()
    return isActive.value
  }

  // Lifecycle hooks
  onMounted(() => {
    // Kiểm tra trạng thái khi component mount
    checkHeartbeatStatus()
  })

  onUnmounted(() => {
    // Không cần dừng heartbeat khi component unmount
    // vì heartbeat service sẽ được quản lý bởi auth store
  })

  return {
    isActive,
    startHeartbeat,
    stopHeartbeat,
    restartHeartbeat,
    checkHeartbeatStatus
  }
} 