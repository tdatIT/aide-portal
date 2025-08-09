        <template>
            <div class="heartbeat-status" v-if="showDebug">
                <div class="status-indicator" :class="{ active: isActive }">
                    <span class="status-dot"></span>
                    <span class="status-text">{{ isActive ? 'Online' : 'Offline' }}</span>
                </div>
            </div>
        </template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useHeartbeat } from '@/composables/useHeartbeat'

// Props
interface Props {
    showDebug?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    showDebug: false
})

// Composables
const { isActive, checkHeartbeatStatus } = useHeartbeat()

// Local state
const lastHeartbeatTime = ref<Date | null>(null)

// Methods
const formatTime = (date: Date): string => {
    return date.toLocaleTimeString()
}

const updateLastHeartbeat = () => {
    lastHeartbeatTime.value = new Date()
}

// Lifecycle
onMounted(() => {
    // Kiểm tra trạng thái ban đầu
    checkHeartbeatStatus()

    // Cập nhật thời gian heartbeat cuối cùng
    updateLastHeartbeat()

    // Cập nhật mỗi 90 giây (cùng với heartbeat interval)
    const interval = setInterval(() => {
        if (isActive.value) {
            updateLastHeartbeat()
        }
    }, 90000)

    onUnmounted(() => {
        clearInterval(interval)
    })
})
</script>

<style scoped>
.heartbeat-status {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    z-index: 9999;
}

.status-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ff4444;
    transition: background-color 0.3s ease;
}

.status-indicator.active .status-dot {
    background-color: #44ff44;
}

.status-text {
    font-weight: 500;
}

.last-heartbeat {
    margin-top: 4px;
    font-size: 10px;
    opacity: 0.8;
}
</style> 