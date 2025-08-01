<template>
  <div class="medical-cases">
    <div class="page-header">
      <h1>{{ $t('patient.cases.title') }}</h1>
      <p>Quản lý thông tin ca bệnh trong hệ thống</p>
    </div>

    <a-card class="cases-card" :title="$t('patient.cases.title')">
      <template #extra>
        <a-button type="primary" @click="handleCreateNew">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ $t('common.add') }}
        </a-button>
      </template>

      <div class="table-toolbar">
        <a-input-search v-model:value="searchValue" :placeholder="`${$t('common.search')} ca bệnh`" style="width: 300px"
          @search="handleSearch" allow-clear />
      </div>

      <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="pagination"
        @change="handleTableChange" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'patient'">
            <div class="patient-info">
              <div class="patient-name">{{ record.patient?.name || 'N/A' }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'language'">
            <a-tag :color="getLanguageColor(record.language)">
              {{ getLanguageText(record.language) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTimeDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="viewDetail(record)">
                <EyeOutlined />
                {{ $t('patient.cases.viewDetail') }}
              </a-button>
              <a-button type="text" size="small" @click="editRecord(record)">
                <EditOutlined />
                {{ $t('common.edit') }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { APIClient } from '@/api'
import type { PatientItems, TableColumn } from '@/types'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons-vue'
import { formatTimeDate } from '@/helper/date'

const { t } = useI18n()
const router = useRouter()

// Reactive data
const dataSource = ref<PatientItems[]>([])
const loading = ref(false)
const searchValue = ref('')
const statusFilter = ref<string>()

// Pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} của ${total} ca bệnh`
})

// Table columns
const columns: TableColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: 'Tên ca bệnh',
    dataIndex: 'name',
    key: 'name',
    width: 250
  },
  {
    title: 'Ngôn ngữ',
    dataIndex: 'language',
    key: 'language',
    sorter: true,
    width: 140,
    filters: [
      { text: 'Tiếng Việt', value: 'vi' },
      { text: 'Tiếng Anh', value: 'en' }
    ]
  },
  {
    title: 'Lượt TH',
    key: 'requestCount',
    dataIndex: 'requestCount',
    sorter: true,
    width: 120
  },
  {
    title: 'Trạng thái',
    key: 'status',
    dataIndex: 'status',
    width: 120,
    filters: [
      { text: 'Ẩn', value: 'unpublished' },
      { text: 'Hiển thị', value: 'published' }
    ]
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    sorter: true
  },
  {
    title: 'Hành động',
    key: 'actions',
    width: 140,
    fixed: 'right'
  }
]

// Methods
const fetchData = async (params?: any) => {
  try {
    loading.value = true
    const response = await APIClient.getPatients({
      page: pagination.current,
      size: pagination.pageSize,
      search: searchValue.value,
      status: statusFilter.value,
      ...params
    })

    dataSource.value = response.data.data.items as PatientItems[]
    pagination.total = response.data.data.total
  } catch (error) {
    console.error('Error fetching patient cases:', error)
    message.error('Lỗi khi tải ca bệnh')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleStatusFilter = () => {
  pagination.current = 1
  fetchData()
}

const handleTableChange = (paginationData: any, filters: any, sorter: any) => {
  pagination.current = paginationData.current
  pagination.pageSize = paginationData.pageSize
  fetchData({ sorter, filters })
}

const getStatusColor = (status: string) => {
  const colors = {
    unpublished: 'orange',
    published: 'blue'
  }
  return colors[status as keyof typeof colors] || 'default'
}

const getLanguageColor = (language: string) => {
  const colors = {
    vi: 'blue',
    en: 'green'
  }
  return colors[language as keyof typeof colors] || 'default'
}

const getStatusText = (status: string) => {
  const texts = {
    unpublished: 'Ẩn',
    published: 'Hiển thị'
  }
  return texts[status as keyof typeof texts] || status
}

const getLanguageText = (language: string) => {
  const texts = {
    vi: 'Tiếng Việt',
    en: 'Tiếng Anh'
  }
  return texts[language as keyof typeof texts] || language
}

const viewDetail = (record: PatientItems) => {
  router.push(`/patient/cases/${record.id}`)
}

const handleCreateNew = () => {
  router.push('/patient/cases/create')
}

const editRecord = (record: PatientItems) => {
  router.push(`/patient/cases/${record.id}`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.medical-cases {
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

.cases-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-info {
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-weight: 500;
  margin-bottom: 4px;
}

[data-theme="dark"] .cases-card {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .page-header p {
  color: #ccc;
}
</style>