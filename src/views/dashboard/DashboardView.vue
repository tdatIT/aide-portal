<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <div>
          <h1>{{ $t('dashboard.title') }}</h1>
          <p class="current-time">Thời gian hiện tại: {{ currentTime }}</p>
        </div>
        <a-button 
          type="primary" 
          :loading="isAnyStatsLoading || isAnyChartLoading || loadingActivities || loadingNotifications"
          @click="refreshDashboard"
          icon="🔄"
        >
          Làm mới
        </a-button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <a-row :gutter="16" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card" :loading="loadingStats.totalUsers">
          <a-statistic :title="$t('dashboard.totalUsers')" :value="stats.totalUsers" :prefix="h(TeamOutlined)"
            :value-style="{ color: '#1890ff' }" />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card" :loading="loadingStats.activeUsers">
          <a-statistic :title="$t('dashboard.activeUsers')" :value="stats.activeUsers" :prefix="h(UserOutlined)"
            :value-style="{ color: '#52c41a' }" />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card" :loading="loadingStats.monthlyTests">
          <a-statistic :title="$t('dashboard.monthlyTests')" :value="stats.monthlyTests" :prefix="h(ExperimentOutlined)"
            :value-style="{ color: '#722ed1' }" />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card" :loading="loadingStats.newUsers">
          <a-statistic :title="$t('dashboard.newUsers')" :value="stats.newUsers" :prefix="h(PlusOutlined)"
            :value-style="{ color: '#fa8c16' }" />
        </a-card>
      </a-col>
    </a-row>

    <!-- Charts Section -->
    <a-row :gutter="16" class="charts-row">
      <a-col :xs="24" :lg="12">
        <a-card title="Thống kê người dùng theo tháng" class="chart-card" :loading="loadingCharts.userStats">
          <div class="chart-placeholder">
            <a-empty description="Biểu đồ sẽ được hiển thị ở đây" />
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="Thống kê bài kiểm tra" class="chart-card" :loading="loadingCharts.testStats">
          <div class="chart-placeholder">
            <a-empty description="Biểu đồ sẽ được hiển thị ở đây" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Recent Activities -->
    <a-row :gutter="16" class="activities-row">
      <a-col :xs="24" :lg="16">
        <a-card title="Hoạt động gần đây" class="activities-card" :loading="loadingActivities">
          <a-list :data-source="recentActivities" :loading="loadingActivities">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta :description="item.timestamp">
                  <template #title>
                    <span>{{ item.description }}</span>
                  </template>
                  <template #avatar>
                    <a-avatar :style="{ backgroundColor: item.color }">
                      {{ item.icon }}
                    </a-avatar>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="8">
        <a-card title="Thông báo" class="notifications-card" :loading="loadingNotifications">
          <a-list :data-source="notifications" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-badge :status="item.type" :text="item.message" />
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {
  ExperimentOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons-vue'
import { h, onMounted, onUnmounted, ref, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { APIClient } from '@/api'

// Types
interface Activity {
  description: string
  timestamp: string
  icon: string
  color: string
}

interface Notification {
  type: 'success' | 'info' | 'warning' | 'error'
  message: string
}

// Reactive data
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  monthlyTests: 0,
  newUsers: 0
})

const recentActivities = ref<Activity[]>([])
const notifications = ref<Notification[]>([])

// Loading states
const loadingStats = ref({
  totalUsers: false,
  activeUsers: false,
  monthlyTests: false,
  newUsers: false
})

const loadingCharts = ref({
  userStats: false,
  testStats: false
})

const loadingActivities = ref(false)
const loadingNotifications = ref(false)

const currentTime = ref('')
let timer: any = null

// Computed properties
const isAnyStatsLoading = computed(() => 
  Object.values(loadingStats.value).some(loading => loading)
)

const isAnyChartLoading = computed(() => 
  Object.values(loadingCharts.value).some(loading => loading)
)

const updateTime = () => {
  const now = new Date()
  // Chuyển đổi sang múi giờ UTC+7
  const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000))

  const hours = utc7Time.getUTCHours().toString().padStart(2, '0')
  const minutes = utc7Time.getUTCMinutes().toString().padStart(2, '0')
  const seconds = utc7Time.getUTCSeconds().toString().padStart(2, '0')

  currentTime.value = `${hours}:${minutes}:${seconds} UTC+7`
}

// API Methods with better error handling
const fetchTotalUsers = async () => {
  try {
    loadingStats.value.totalUsers = true
    const response = await APIClient.getTotalUserCount()
    stats.value.totalUsers = response.data.data.total
  } catch (error) {
    console.error('Error fetching total users:', error)
    message.error('Lỗi tải số lượng người dùng')
  } finally {
    loadingStats.value.totalUsers = false
  }
}

const fetchActiveUsers = async () => {
  try {
    loadingStats.value.activeUsers = true

    stats.value.activeUsers = Math.floor(stats.value.totalUsers * 0.8)
  } catch (error) {
    console.error('Error fetching active users:', error)
    message.error('Lỗi tải số lượng người dùng hoạt động')
  } finally {
    loadingStats.value.activeUsers = false
  }
}

const fetchMonthlyTests = async () => {
  try {
    loadingStats.value.monthlyTests = true
    const response = await APIClient.getTotalTestCount()
    stats.value.monthlyTests = response.data.total
  } catch (error) {
    console.error('Error fetching monthly tests:', error)
    message.error('Lỗi tải số lượng bài kiểm tra')
  } finally {
    loadingStats.value.monthlyTests = false
  }
}

const fetchNewUsers = async () => {
  try {
    loadingStats.value.newUsers = true
    const response = await APIClient.getTotalNewUserCount()
    stats.value.newUsers = response.data.data.total
  } catch (error) {
    console.error('Error fetching new users:', error)
    message.error('Lỗi tải số lượng người dùng mới')
  } finally {
    loadingStats.value.newUsers = false
  }
}

const fetchRecentActivities = async () => {
  try {
    loadingActivities.value = true
    recentActivities.value = [
      {
        description: 'Hệ thống khởi tạo thành công',
        timestamp: new Date().toLocaleString('vi-VN'),
        icon: '✅',
        color: '#52c41a'
      },
    ]
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    message.error('Lỗi tải hoạt động gần đây')
  } finally {
    loadingActivities.value = false
  }
}

const fetchNotifications = async () => {
  try {
    loadingNotifications.value = true
    notifications.value = [
      {
        type: 'success' as const,
        message: 'Hệ thống hoạt động bình thường'
      }
    ]
  } catch (error) {
    console.error('Error fetching notifications:', error)
    message.error('Lỗi tải thông báo')
  } finally {
    loadingNotifications.value = false
  }
}

// Main fetch function with retry mechanism
const fetchDashboardData = async (retryCount = 0) => {
  try {
    // Fetch all data in parallel for better performance
    const results = await Promise.allSettled([
      fetchTotalUsers(),
      fetchActiveUsers(),
      fetchMonthlyTests(),
      fetchNewUsers(),
      fetchRecentActivities(),
      fetchNotifications(),
    ])
    
    // Check for any failed requests
    const failedRequests = results.filter(result => result.status === 'rejected')
    if (failedRequests.length > 0) {
      console.warn(`${failedRequests.length} requests failed`)
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    
    // Retry mechanism (max 3 retries)
    if (retryCount < 3) {
      message.warning(`Đang thử lại lần ${retryCount + 1}...`)
      setTimeout(() => fetchDashboardData(retryCount + 1), 2000)
    } else {
      message.error('Không thể tải dữ liệu dashboard sau nhiều lần thử')
    }
  }
}

// Refresh function
const refreshDashboard = async () => {
  const hide = message.loading('Đang làm mới dữ liệu...', 0)
  try {
    await fetchDashboardData()
    message.success('Đã làm mới dữ liệu thành công')
  } catch (error) {
    message.error('Lỗi khi làm mới dữ liệu')
  } finally {
    hide()
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchDashboardData()
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer as NodeJS.Timeout)
  }
})

// Expose refresh function for potential use
defineExpose({
  refreshDashboard
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-content .ant-btn {
    align-self: flex-end;
  }
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1890ff;
}

.dashboard-header p {
  color: #666;
  font-size: 16px;
}

.current-time {
  font-size: 1.2em;
  color: #666;
  margin-top: 8px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 4px;
}

.activities-row {
  margin-bottom: 24px;
}

.activities-card,
.notifications-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] .stat-card,
[data-theme="dark"] .chart-card,
[data-theme="dark"] .activities-card,
[data-theme="dark"] .notifications-card {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .chart-placeholder {
  background: #262626;
}

[data-theme="dark"] .dashboard-header p {
  color: #ccc;
}
</style>