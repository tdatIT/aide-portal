import { APIClient } from '@/api'
import { useAuthStore } from '@/stores'

class HeartbeatService {
    private intervalId: NodeJS.Timeout | null = null
    private isRunning = false
    private readonly HEARTBEAT_INTERVAL = 90000

    /**
     * Bắt đầu heartbeat service
     */
    start(): void {
        if (this.isRunning) {
            console.warn('Heartbeat service is already running')
            return
        }

        const authStore = useAuthStore()

        if (!authStore.isAuthenticated) {
            console.warn('User is not authenticated, cannot start heartbeat')
            return
        }

        this.isRunning = true
        console.log('Start heartbeat service')

        // Call heartbeat immediately
        this.sendHeartbeat()

        // Set interval to call heartbeat periodically
        this.intervalId = setInterval(() => {
            this.sendHeartbeat()
        }, this.HEARTBEAT_INTERVAL)
    }

    /**
     * Stop heartbeat service
     */
    stop(): void {
        if (!this.isRunning) {
            console.warn('Heartbeat service is not running')
            return
        }

        this.isRunning = false
        console.log('Stop heartbeat service')

        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    /**
     * Gửi heartbeat request
     */
    private async sendHeartbeat(): Promise<void> {
        try {
            const authStore = useAuthStore()

            // Check authentication again before sending
            if (!authStore.isAuthenticated) {
                console.warn('User is not authenticated, stop heartbeat')
                this.stop()
                return
            }

            const response = await APIClient.heartbeat()
            console.log('Heartbeat sent successfully:', response.data)
        } catch (error: any) {
            console.error('Heartbeat failed:', error)

            // If 401 error, token may have expired
            if (error.response?.status === 401) {
                console.warn('Heartbeat failed due to authentication error')
                // No need to stop heartbeat as refresh token will handle it
            }
        }
    }

    /**
     * Kiểm tra trạng thái heartbeat service
     */
    isActive(): boolean {
        return this.isRunning
    }

    /**
     * Restart heartbeat service
     */
    restart(): void {
        this.stop()
        setTimeout(() => {
            this.start()
        }, 1000) // Delay 1 second before restart
    }
}

// Create singleton instance
export const heartbeatService = new HeartbeatService()

// Export to use in components
export default heartbeatService 