<template>
  <div class="test-executions">
    <div class="page-header">
      <h1>{{ $t('menu.testExecutions') }}</h1>
      <p>Theo dõi và quản lý các lượt thực hiện kiểm tra của người dùng</p>
    </div>

    <a-card class="execution-card">
      <div class="table-toolbar">
        <a-input-search
          v-model:value="searchValue"
          :placeholder="`${$t('common.search')} lượt kiểm tra`"
          style="width: 300px"
          @search="handleSearch"
          allow-clear
        />
        
        <a-space>
          <a-select
            v-model:value="statusFilter"
            placeholder="Lọc theo trạng thái"
            style="width: 150px"
            allow-clear
            @change="handleStatusFilter"
          >
            <a-select-option value="started">Đang làm</a-select-option>
            <a-select-option value="completed">Hoàn thành</a-select-option>
            <a-select-option value="abandoned">Đã bỏ</a-select-option>
          </a-select>

          <a-date-picker
            v-model:value="dateFilter"
            placeholder="Lọc theo ngày"
            @change="handleDateFilter"
          />
        </a-space>
      </div>

      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <div class="user-info">
              <a-avatar :src="record.user?.avatar" size="small">
                {{ record.user?.name?.charAt(0) || 'U' }}
              </a-avatar>
              <span style="margin-left: 8px">{{ record.user?.name || 'N/A' }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'score'">
            <a-progress
              v-if="record.score !== null && record.score !== undefined"
              :percent="record.score"
              size="small"
              :status="getScoreStatus(record.score)"
            />
            <span v-else class="text-muted">Chưa có điểm</span>
          </template>
          <template v-else-if="column.key === 'duration'">
            <span v-if="record.endTime">
              {{ calculateDuration(record.startTime, record.endTime) }}
            </span>
            <span v-else class="text-muted">Đang thực hiện</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="viewDetail(record)">
                <EyeOutlined />
                Xem chi tiết
              </a-button>
              <a-button 
                type="text" 
                size="small" 
                @click="exportResult(record)"
                v-if="record.status === 'completed'"
              >
                <DownloadOutlined />
                Xuất kết quả
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Detail Modal -->
    <a-modal
      v-model:open="detailVisible"
      title="Chi tiết lượt kiểm tra"
      @cancel="handleDetailCancel"
      width="800px"
      :footer="null"
    >
      <div v-if="selectedRecord">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="Người dùng">
            <div class="user-info">
              <a-avatar :src="selectedRecord.user?.avatar" size="small">
                {{ selectedRecord.user?.name?.charAt(0) || 'U' }}
              </a-avatar>
              <span style="margin-left: 8px">{{ selectedRecord.user?.name || 'N/A' }}</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="Tên bài kiểm tra">
            {{ selectedRecord.testName }}
          </a-descriptions-item>
          <a-descriptions-item label="Trạng thái">
            <a-tag :color="getStatusColor(selectedRecord.status)">
              {{ getStatusText(selectedRecord.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Điểm số">
            <a-progress
              v-if="selectedRecord.score !== null && selectedRecord.score !== undefined"
              :percent="selectedRecord.score"
              size="small"
              :status="getScoreStatus(selectedRecord.score)"
            />
            <span v-else class="text-muted">Chưa có điểm</span>
          </a-descriptions-item>
          <a-descriptions-item label="Thời gian bắt đầu">
            {{ formatDateTime(selectedRecord.startTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="Thời gian kết thúc">
            {{ selectedRecord.endTime ? formatDateTime(selectedRecord.endTime) : 'Chưa kết thúc' }}
          </a-descriptions-item>
          <a-descriptions-item label="Thời gian làm bài" :span="2">
            <span v-if="selectedRecord.endTime">
              {{ calculateDuration(selectedRecord.startTime, selectedRecord.endTime) }}
            </span>
            <span v-else class="text-muted">Đang thực hiện</span>
          </a-descriptions-item>
        </a-descriptions>

        <a-divider>Câu trả lời</a-divider>
        
        <div v-if="selectedRecord.answers && selectedRecord.answers.length > 0">
          <a-collapse>
            <a-collapse-panel 
              v-for="(answer, index) in selectedRecord.answers" 
              :key="index"
              :header="`Câu ${index + 1}: ${answer.question}`"
            >
              <p><strong>Câu trả lời:</strong> {{ answer.userAnswer }}</p>
              <p><strong>Đáp án đúng:</strong> {{ answer.correctAnswer }}</p>
              <p>
                <strong>Kết quả:</strong> 
                <a-tag :color="answer.isCorrect ? 'green' : 'red'">
                  {{ answer.isCorrect ? 'Đúng' : 'Sai' }}
                </a-tag>
              </p>
            </a-collapse-panel>
          </a-collapse>
        </div>
        <a-empty v-else description="Chưa có câu trả lời nào" />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { APIClient } from '@/api'
import type { TestExecution, TableColumn } from '@/types'
import {
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue'

const { t } = useI18n()

// Reactive data
const dataSource = ref<TestExecution[]>([])
const loading = ref(false)
const searchValue = ref('')
const statusFilter = ref<string>()
const dateFilter = ref()
const detailVisible = ref(false)
const selectedRecord = ref<TestExecution | null>(null)

// Pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => 
    `${range[0]}-${range[1]} của ${total} lượt kiểm tra`
})

// Table columns
const columns: TableColumn[] = [
  {
    title: 'Người dùng',
    key: 'user',
    width: 200
  },
  {
    title: 'Tên bài kiểm tra',
    dataIndex: 'testName',
    key: 'testName',
    sorter: true
  },
  {
    title: 'Trạng thái',
    key: 'status',
    width: 120,
    filters: [
      { text: 'Đang làm', value: 'started' },
      { text: 'Hoàn thành', value: 'completed' },
      { text: 'Đã bỏ', value: 'abandoned' }
    ]
  },
  {
    title: 'Điểm số',
    key: 'score',
    width: 120,
    sorter: true
  },
  {
    title: 'Thời gian làm bài',
    key: 'duration',
    width: 150
  },
  {
    title: 'Ngày thực hiện',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    sorter: true
  },
  {
    title: 'Hành động',
    key: 'actions',
    width: 180,
    fixed: 'right'
  }
]

// Methods
const fetchData = async (params?: any) => {
  try {
    loading.value = true
    const response = await APIClient.getTestExecutions({
      page: pagination.current,
      limit: pagination.pageSize,
      search: searchValue.value,
      status: statusFilter.value,
      date: dateFilter.value,
      ...params
    })
    
    dataSource.value = response.data.data.data
    pagination.total = response.data.data.total
  } catch (error) {
    // Set mock data for demo
    dataSource.value = [
      {
        id: '1',
        userId: '1',
        user: {
          id: '1',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          avatar: 'https://via.placeholder.com/32',
          role: {
            id: '2',
            name: 'Patient',
            permissions: []
          },
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        testId: '1',
        testName: 'Kiểm tra sức khỏe tim mạch',
        startTime: '2024-01-20T09:00:00Z',
        endTime: '2024-01-20T09:30:00Z',
        score: 85,
        status: 'completed',
        answers: [
          {
            question: 'Bạn có thường xuyên cảm thấy đau ngực không?',
            userAnswer: 'Không',
            correctAnswer: 'Không',
            isCorrect: true
          },
          {
            question: 'Bạn có hút thuốc không?',
            userAnswer: 'Có',
            correctAnswer: 'Không',
            isCorrect: false
          }
        ],
        createdAt: '2024-01-20T09:00:00Z'
      },
      {
        id: '2',
        userId: '2',
        user: {
          id: '2',
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          avatar: 'https://via.placeholder.com/32',
          role: {
            id: '2',
            name: 'Patient',
            permissions: []
          },
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        testId: '2',
                 testName: 'Đánh giá sức khỏe tổng quát',
         startTime: '2024-01-21T10:15:00Z',
         endTime: undefined,
         score: undefined,
         status: 'started',
        answers: [],
        createdAt: '2024-01-21T10:15:00Z'
      },
      {
        id: '3',
        userId: '3',
        user: {
          id: '3',
          name: 'Lê Văn C',
          email: 'levanc@email.com',
          avatar: 'https://via.placeholder.com/32',
          role: {
            id: '2',
            name: 'Patient',
            permissions: []
          },
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        testId: '3',
                 testName: 'Kiểm tra thần kinh',
         startTime: '2024-01-19T14:00:00Z',
         endTime: '2024-01-19T14:10:00Z',
         score: undefined,
         status: 'abandoned',
        answers: [],
        createdAt: '2024-01-19T14:00:00Z'
      }
    ]
    pagination.total = 3
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status: string) => {
  const colors = {
    started: 'blue',
    completed: 'green',
    abandoned: 'red'
  }
  return colors[status as keyof typeof colors] || 'default'
}

const getStatusText = (status: string) => {
  const texts = {
    started: 'Đang làm',
    completed: 'Hoàn thành',
    abandoned: 'Đã bỏ'
  }
  return texts[status as keyof typeof texts] || status
}

const getScoreStatus = (score: number) => {
  if (score >= 80) return 'success'
  if (score >= 60) return 'normal'
  return 'exception'
}

const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diff = end.getTime() - start.getTime()
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN')
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleStatusFilter = () => {
  pagination.current = 1
  fetchData()
}

const handleDateFilter = () => {
  pagination.current = 1
  fetchData()
}

const handleTableChange = (paginationData: any, filters: any, sorter: any) => {
  pagination.current = paginationData.current
  pagination.pageSize = paginationData.pageSize
  fetchData({ sorter, filters })
}

const viewDetail = (record: TestExecution) => {
  selectedRecord.value = record
  detailVisible.value = true
}

const handleDetailCancel = () => {
  detailVisible.value = false
  selectedRecord.value = null
}

const exportResult = (record: TestExecution) => {
  // Mock export functionality
  message.success(`Đang xuất kết quả cho ${record.testName}`)
  
  // In real implementation, this would download a file
  const data = {
    userName: record.user?.name,
    testName: record.testName,
    score: record.score,
    startTime: record.startTime,
    endTime: record.endTime,
    answers: record.answers
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-result-${record.id}.json`
  a.click()
  window.URL.revokeObjectURL(url)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.test-executions {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1890ff;
}

.page-header p {
  color: #666;
  font-size: 16px;
}

.execution-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
}

.text-muted {
  color: #999;
  font-style: italic;
}

[data-theme="dark"] .execution-card {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .page-header p {
  color: #ccc;
}

[data-theme="dark"] .text-muted {
  color: #666;
}

@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style> 