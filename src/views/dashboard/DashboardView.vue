<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>{{ $t('dashboard.title') }}</h1>
      <p class="current-time">Thời gian hiện tại: {{ currentTime }}</p>
    </div>

    <!-- Statistics Cards -->
    <a-row :gutter="16" class="stats-row">
      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic :title="$t('dashboard.totalUsers')" :value="stats.totalUsers" :prefix="h(TeamOutlined)"
            :value-style="{ color: '#1890ff' }" />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic :title="$t('dashboard.activeUsers')" :value="stats.activeUsers" :prefix="h(UserOutlined)"
            :value-style="{ color: '#52c41a' }" />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic :title="$t('dashboard.monthlyTests')" :value="stats.monthlyTests" :prefix="h(ExperimentOutlined)"
            :value-style="{ color: '#722ed1' }" />
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :lg="6">
        <a-card class="stat-card">
          <a-statistic :title="$t('dashboard.newUsers')" :value="stats.newUsers" :prefix="h(PlusOutlined)"
            :value-style="{ color: '#fa8c16' }" />
        </a-card>
      </a-col>
    </a-row>

    <!-- Charts Section -->
    <a-row :gutter="16" class="charts-row">
      <a-col :xs="24" :lg="12">
        <a-card title="Thống kê người dùng theo tháng" class="chart-card">
          <div class="chart-placeholder">
            <a-empty description="Biểu đồ sẽ được hiển thị ở đây" />
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="12">
        <a-card title="Thống kê bài kiểm tra" class="chart-card">
          <div class="chart-placeholder">
            <a-empty description="Biểu đồ sẽ được hiển thị ở đây" />
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Recent Activities -->
    <a-row :gutter="16" class="activities-row">
      <a-col :xs="24" :lg="16">
        <a-card title="Hoạt động gần đây" class="activities-card">
          <a-list :data-source="recentActivities" :loading="loading">
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
        <a-card title="Thông báo" class="notifications-card">
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
import { h, onMounted, onUnmounted, ref } from 'vue'


const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  monthlyTests: 0,
  newUsers: 0
})

const recentActivities = ref([
  {
    description: 'Hệ thống khởi tạo thành công',
    timestamp: '01/08/2025 10:00:00',
    icon: '✅',
    color: '#52c41a'
  },
])

const notifications = ref([
  {
    type: 'success' as const,
    message: 'Hệ thống hoạt động bình thường'
  },
])

const currentTime = ref('')
const loading = ref(false)
let timer: any = null

const updateTime = () => {
  const now = new Date()
  // Chuyển đổi sang múi giờ UTC+7
  const utc7Time = new Date(now.getTime() + (7 * 60 * 60 * 1000))

  const hours = utc7Time.getUTCHours().toString().padStart(2, '0')
  const minutes = utc7Time.getUTCMinutes().toString().padStart(2, '0')
  const seconds = utc7Time.getUTCSeconds().toString().padStart(2, '0')

  currentTime.value = `${hours}:${minutes}:${seconds} UTC+7`
}

// Methods
const fetchDashboardStats = async () => {
  try {
    loading.value = true
    const response = await APIClient.getTotalTestCount()
    stats.value.monthlyTests = response.data.data.total
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    message.error('Lỗi tải thống kê')
  } finally {
    loading.value = false
  }
}



onMounted(() => {
  fetchDashboardStats()
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer as NodeJS.Timeout)
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.dashboard-header {
  margin-bottom: 24px;
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