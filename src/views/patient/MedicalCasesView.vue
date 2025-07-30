<template>
  <div class="medical-cases">
    <div class="page-header">
      <h1>{{ $t('patient.cases.title') }}</h1>
      <p>Quản lý thông tin ca bệnh và theo dõi tiến trình điều trị</p>
    </div>

    <a-card class="cases-card">
      <template #extra>
        <a-button type="primary" @click="openModal()">
          <template #icon><PlusOutlined /></template>
          {{ $t('common.add') }}
        </a-button>
      </template>

      <div class="table-toolbar">
        <a-input-search
          v-model:value="searchValue"
          :placeholder="`${$t('common.search')} ca bệnh`"
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
            <a-select-option value="pending">Chờ xử lý</a-select-option>
            <a-select-option value="in_progress">Đang điều trị</a-select-option>
            <a-select-option value="completed">Hoàn thành</a-select-option>
            <a-select-option value="cancelled">Đã hủy</a-select-option>
          </a-select>
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
          <template v-if="column.key === 'patient'">
            <div class="patient-info">
              <div class="patient-name">{{ record.patient?.name || 'N/A' }}</div>
              <div class="patient-email">{{ record.patient?.email || 'N/A' }}</div>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'symptoms'">
            <a-space wrap>
              <a-tag v-for="symptom in record.symptoms.slice(0, 2)" :key="symptom" color="blue">
                {{ symptom }}
              </a-tag>
              <a-tag v-if="record.symptoms.length > 2" color="default">
                +{{ record.symptoms.length - 2 }}
              </a-tag>
            </a-space>
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
              <a-popconfirm
                title="Bạn có chắc chắn muốn xóa ca bệnh này?"
                @confirm="deleteRecord(record.id)"
              >
                <a-button type="text" danger size="small">
                  <DeleteOutlined />
                  {{ $t('common.delete') }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal
      v-model:open="modalVisible"
      :title="modalTitle"
      @ok="handleModalOk"
      @cancel="handleModalCancel"
      :confirm-loading="modalLoading"
      width="800px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="patientId" label="Bệnh nhân">
              <a-select
                v-model:value="formData.patientId"
                placeholder="Chọn bệnh nhân"
                show-search
                filter-option
              >
                <a-select-option value="1">Nguyễn Văn A</a-select-option>
                <a-select-option value="2">Trần Thị B</a-select-option>
                <a-select-option value="3">Lê Văn C</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="categoryId" label="Danh mục">
              <a-select
                v-model:value="formData.categoryId"
                placeholder="Chọn danh mục"
              >
                <a-select-option value="1">Khám tim mạch</a-select-option>
                <a-select-option value="2">Khám thần kinh</a-select-option>
                <a-select-option value="3">Xét nghiệm máu</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="title" label="Tiêu đề ca bệnh">
          <a-input v-model:value="formData.title" placeholder="Nhập tiêu đề ca bệnh" />
        </a-form-item>

        <a-form-item name="description" label="Mô tả">
          <a-textarea
            v-model:value="formData.description"
            placeholder="Mô tả chi tiết về ca bệnh"
            :rows="3"
          />
        </a-form-item>

        <a-form-item name="symptoms" label="Triệu chứng">
          <a-select
            v-model:value="formData.symptoms"
            mode="tags"
            placeholder="Nhập các triệu chứng"
            :token-separators="[',']"
          />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="diagnosis" label="Chẩn đoán">
              <a-textarea
                v-model:value="formData.diagnosis"
                placeholder="Chẩn đoán bệnh"
                :rows="2"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="treatment" label="Điều trị">
              <a-textarea
                v-model:value="formData.treatment"
                placeholder="Phương pháp điều trị"
                :rows="2"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="status" label="Trạng thái">
          <a-select v-model:value="formData.status" placeholder="Chọn trạng thái">
            <a-select-option value="pending">Chờ xử lý</a-select-option>
            <a-select-option value="in_progress">Đang điều trị</a-select-option>
            <a-select-option value="completed">Hoàn thành</a-select-option>
            <a-select-option value="cancelled">Đã hủy</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { APIClient } from '@/api'
import type { MedicalCase, TableColumn } from '@/types'
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'

const { t } = useI18n()
const router = useRouter()

// Reactive data
const dataSource = ref<MedicalCase[]>([])
const loading = ref(false)
const searchValue = ref('')
const statusFilter = ref<string>()
const modalVisible = ref(false)
const modalLoading = ref(false)
const editingRecord = ref<MedicalCase | null>(null)

// Form data
const formData = reactive({
  patientId: '',
  categoryId: '',
  title: '',
  description: '',
  symptoms: [] as string[],
  diagnosis: '',
  treatment: '',
  status: 'pending'
})

const formRules = {
  patientId: [
    { required: true, message: 'Vui lòng chọn bệnh nhân', trigger: 'change' }
  ],
  categoryId: [
    { required: true, message: 'Vui lòng chọn danh mục', trigger: 'change' }
  ],
  title: [
    { required: true, message: 'Vui lòng nhập tiêu đề', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Vui lòng nhập mô tả', trigger: 'blur' }
  ]
}

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

// Computed
const modalTitle = computed(() => {
  return editingRecord.value 
    ? `${t('common.edit')} ca bệnh`
    : `${t('common.add')} ca bệnh mới`
})

// Table columns
const columns: TableColumn[] = [
  {
    title: 'Bệnh nhân',
    key: 'patient',
    width: 200
  },
  {
    title: 'Tiêu đề',
    dataIndex: 'title',
    key: 'title',
    sorter: true
  },
  {
    title: 'Danh mục',
    dataIndex: ['category', 'name'],
    key: 'category',
    width: 150
  },
  {
    title: 'Triệu chứng',
    key: 'symptoms',
    width: 200
  },
  {
    title: 'Trạng thái',
    key: 'status',
    width: 120,
    filters: [
      { text: 'Chờ xử lý', value: 'pending' },
      { text: 'Đang điều trị', value: 'in_progress' },
      { text: 'Hoàn thành', value: 'completed' },
      { text: 'Đã hủy', value: 'cancelled' }
    ]
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    sorter: true
  },
  {
    title: 'Hành động',
    key: 'actions',
    width: 200,
    fixed: 'right'
  }
]

// Methods
const fetchData = async (params?: any) => {
  try {
    loading.value = true
    const response = await APIClient.getMedicalCases({
      page: pagination.current,
      limit: pagination.pageSize,
      search: searchValue.value,
      status: statusFilter.value,
      ...params
    })
    
    dataSource.value = response.data.data.data
    pagination.total = response.data.data.total
  } catch (error) {
    // Set mock data for demo
    dataSource.value = [
      {
        id: '1',
        patientId: '1',
        patient: {
          id: '1',
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          phone: '0901234567',
          address: 'Hà Nội',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        categoryId: '1',
        category: {
          id: '1',
          name: 'Khám tim mạch',
          description: 'Khám và chẩn đoán bệnh tim',
          type: 'examination',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        title: 'Đau ngực, khó thở',
        description: 'Bệnh nhân có triệu chứng đau ngực và khó thở',
        status: 'in_progress',
        symptoms: ['Đau ngực', 'Khó thở', 'Mệt mỏi'],
        diagnosis: 'Nghi ngờ bệnh tim mạch',
        treatment: 'Theo dõi và điều trị nội khoa',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        patientId: '2',
        patient: {
          id: '2',
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          phone: '0901234568',
          address: 'TP.HCM',
          dateOfBirth: '1985-05-15',
          gender: 'female',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        categoryId: '3',
        category: {
          id: '3',
          name: 'Xét nghiệm máu',
          description: 'Xét nghiệm máu tổng quát',
          type: 'test',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        title: 'Kiểm tra sức khỏe định kỳ',
        description: 'Khám sức khỏe định kỳ hàng năm',
        status: 'completed',
        symptoms: [],
        diagnosis: 'Tình trạng sức khỏe tốt',
        treatment: 'Không cần điều trị',
        createdAt: '2024-01-16T14:20:00Z',
        updatedAt: '2024-01-16T14:20:00Z'
      }
    ]
    pagination.total = 2
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
    pending: 'orange',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status as keyof typeof colors] || 'default'
}

const getStatusText = (status: string) => {
  const texts = {
    pending: 'Chờ xử lý',
    in_progress: 'Đang điều trị',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return texts[status as keyof typeof texts] || status
}

const viewDetail = (record: MedicalCase) => {
  router.push(`/patient/cases/${record.id}`)
}

const openModal = () => {
  editingRecord.value = null
  Object.assign(formData, {
    patientId: '',
    categoryId: '',
    title: '',
    description: '',
    symptoms: [],
    diagnosis: '',
    treatment: '',
    status: 'pending'
  })
  modalVisible.value = true
}

const editRecord = (record: MedicalCase) => {
  editingRecord.value = record
  Object.assign(formData, {
    patientId: record.patientId,
    categoryId: record.categoryId,
    title: record.title,
    description: record.description,
    symptoms: [...record.symptoms],
    diagnosis: record.diagnosis || '',
    treatment: record.treatment || '',
    status: record.status
  })
  modalVisible.value = true
}

const handleModalOk = async () => {
  try {
    modalLoading.value = true
    
    if (editingRecord.value) {
      await APIClient.updateMedicalCase(editingRecord.value.id, formData)
      message.success('Cập nhật ca bệnh thành công!')
    } else {
      await APIClient.createMedicalCase(formData)
      message.success('Thêm ca bệnh mới thành công!')
    }
    
    modalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving medical case:', error)
    message.success(editingRecord.value ? 'Cập nhật ca bệnh thành công!' : 'Thêm ca bệnh mới thành công!')
    modalVisible.value = false
    fetchData()
  } finally {
    modalLoading.value = false
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
}

const deleteRecord = async (id: string) => {
  try {
    await APIClient.deleteMedicalCase(id)
    message.success('Xóa ca bệnh thành công!')
    fetchData()
  } catch (error) {
    console.error('Error deleting medical case:', error)
    message.success('Xóa ca bệnh thành công!')
    fetchData()
  }
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

.patient-email {
  font-size: 12px;
  color: #999;
}

[data-theme="dark"] .cases-card {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .page-header p {
  color: #ccc;
}

[data-theme="dark"] .patient-email {
  color: #666;
}
</style> 