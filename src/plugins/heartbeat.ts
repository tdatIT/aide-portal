import type { App } from 'vue'
import heartbeatService from '@/utils/heartbeat'
import { useAuthStore } from '@/stores'

export default {
    install(app: App) {
        // Initialize heartbeat service when app    
        app.config.globalProperties.$heartbeat = heartbeatService

        // Check and start heartbeat if user is authenticated
        const initializeHeartbeat = () => {
            const authStore = useAuthStore()

            // Check if there is a token in localStorage
            const accessToken = localStorage.getItem('accessToken')
            const refreshToken = localStorage.getItem('refreshToken')

            if (accessToken && refreshToken && authStore.isAuthenticated) {
                console.log('Phát hiện user đã đăng nhập, bắt đầu heartbeat')
                heartbeatService.start()
            }
        }

        // Call initialization after app has mounted        
        app.mixin({
            mounted() {
                // Only run once when app mounts
                if (this.$options.name === 'App') {
                    // Delay a bit to ensure stores are initialized
                    setTimeout(() => {
                        initializeHeartbeat()
                    }, 1000)
                }
            }
        })

        // Add to global properties to use in components    
        app.config.globalProperties.$heartbeatService = heartbeatService
    }
} 