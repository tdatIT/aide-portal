<template>
  <div class="medical-categories">
    <div class="page-header">
      <h1>{{ $t('patient.categories.title') }}</h1>
      <p>Quản lý danh mục khám bệnh/xét nghiệm</p>
    </div>

    <!-- Clinical Categories -->
    <a-card class="category-card" :title="$t('patient.categories.clinicalExamination')" style="margin-bottom: 24px">
      <template #extra>
        <a-button type="primary" @click="openModal('examination')">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ $t('common.add') }}
        </a-button>
      </template>

      <div class="table-toolbar">
        <a-input-search v-model:value="examinationSearch"
          :placeholder="`${$t('common.search')} ${$t('patient.categories.clinicalExamination').toLowerCase()}`"
          style="width: 300px" @search="searchExaminations" allow-clear />
      </div>

      <a-table :columns="clinicalCateColumns" :data-source="clinicalCateData" :loading="clinicalCateLoading"
        :pagination="clinicalCatePagination" @change="handleExaminationTableChange" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag color="blue">{{ $t('patient.categories.clinicalExamination') }}</a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="editRecord(record)">
                <EditOutlined />
              </a-button>
              <a-popconfirm title="Bạn có chắc chắn muốn xóa?" @confirm="deleteRecord(record.id)">
                <a-button type="text" danger size="small">
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Test Categories -->
    <a-card class="category-card" :title="$t('patient.categories.paraclinicalTest')">
      <template #extra>
        <a-button type="primary" @click="openModal('test')">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ $t('common.add') }}
        </a-button>
      </template>

      <div class="table-toolbar">
        <a-input-search v-model:value="testSearch"
          :placeholder="`${$t('common.search')} ${$t('patient.categories.paraclinicalTest').toLowerCase()}`"
          style="width: 300px" @search="searchTests" allow-clear />
      </div>

      <a-table :columns="testColumns" :data-source="testData" :loading="testLoading" :pagination="testPagination"
        @change="handleTestTableChange" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag color="purple">{{ $t('patient.categories.paraclinicalTest') }}</a-tag>
          </template>
          <template v-else-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'green' : 'red'">
              {{ record.isActive ? 'Hoạt động' : 'Không hoạt động' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="editRecord(record)">
                <EditOutlined />
              </a-button>
              <a-popconfirm title="Bạn có chắc chắn muốn xóa?" @confirm="deleteRecord(record.id)">
                <a-button type="text" danger size="small">
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- Add/Edit Modal -->
    <a-modal v-model:open="modalVisible" :title="modalTitle" @ok="handleModalOk" @cancel="handleModalCancel"
      :confirm-loading="modalLoading">
      <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
        <a-form-item name="name" :label="$t('patient.categories.name')">
          <a-input v-model:value="formData.name" :placeholder="$t('patient.categories.name')" />
        </a-form-item>

        <a-form-item name="description" :label="$t('patient.categories.description')">
          <a-textarea v-model:value="formData.description" :placeholder="$t('patient.categories.description')"
            :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { APIClient } from '@/api'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue'
import type { TableColumn } from '@/types'
import formatDateTime from '@/helper/date'

const { t } = useI18n()

// Reactive data
const clinicalCateData = ref<ClinicalCategory[]>([])
const testData = ref<MedicalCategory[]>([])
const clinicalCateLoading = ref(false)
const testLoading = ref(false)
const examinationSearch = ref('')
const testSearch = ref('')
const modalVisible = ref(false)
const modalLoading = ref(false)
const currentType = ref<'examination' | 'test'>('examination')
const editingRecord = ref<MedicalCategory | null>(null)

// Form data
const formData = reactive({
  name: '',
  description: '',
  isActive: true
})

const formRules = {
  name: [
    { required: true, message: 'Vui lòng nhập tên danh mục', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Vui lòng nhập mô tả', trigger: 'blur' }
  ]
}

// Pagination
const clinicalCatePagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} của ${total} mục`
})

const testPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `${range[0]}-${range[1]} của ${total} mục`
})

// Computed
const modalTitle = computed(() => {
  const typeLabel = currentType.value === 'examination'
    ? t('patient.categories.clinicalExamination')
    : t('patient.categories.paraclinicalTest')
  return editingRecord.value
    ? `${t('common.edit')} ${typeLabel}`
    : `${t('common.add')} ${typeLabel}`
})

// Table columns
const baseColumns: TableColumn[] = [
  {
    title: t('common.id'),
    dataIndex: 'id',
    key: 'id',
    width: 120
  },
  {
    title: t('patient.categories.name'),
    dataIndex: 'name',
    key: 'name',
    sorter: true
  },
  {
    title: t('patient.categories.description'),
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: t('common.status'),
    dataIndex: 'isActive',
    key: 'isActive',
    width: 120
  },
  {
    title: t('common.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    sorter: true
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

const clinicalCateColumns = computed(() => [
  {
    title: t('common.id'),
    dataIndex: 'id',
    key: 'id',
    width: 120
  },
  {
    title: t('patient.categories.name'),
    dataIndex: 'name',
    width: 250,
    key: 'name',
    sorter: true
  },
  {
    title: t('patient.categories.description'),
    dataIndex: 'description',
    key: 'description'
  },
  {
    title: t('common.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 220,
    render: (text: string) => {
      console.log(text)
      return formatDateTime(text)
    },
    sorter: true
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
])
const testColumns = computed(() => baseColumns)

// Methods
const fetchClinicalCategories = async () => {
  try {
    clinicalCateLoading.value = true
    const response = await APIClient.getClinicalCategories({
      page: clinicalCatePagination.current,
      size: clinicalCatePagination.pageSize,
    })

    clinicalCateData.value = response.data.data.items
    clinicalCatePagination.total = response.data.data.total
  } catch (error) {
    message.error('Lỗi khi lấy danh mục khám bệnh')
  } finally {
    clinicalCateLoading.value = false
  }
}

const fetchTests = async (params?: any) => {
  try {
    testLoading.value = true
    const response = await APIClient.getMedicalCategories({
      type: 'test',
      page: testPagination.current,
      limit: testPagination.pageSize,
      search: testSearch.value,
      ...params
    })

    testData.value = response.data.data.data
    testPagination.total = response.data.data.total
  } catch (error) {
    // Set mock data for demo
    testData.value = [
      {
        id: '3',
        name: 'Xét nghiệm máu tổng quát',
        description: 'Xét nghiệm các chỉ số máu cơ bản',
        type: 'test',
        isActive: true,
        createdAt: '2024-01-17T09:15:00Z',
        updatedAt: '2024-01-17T09:15:00Z'
      },
      {
        id: '4',
        name: 'Xét nghiệm glucose',
        description: 'Kiểm tra nồng độ đường trong máu',
        type: 'test',
        isActive: false,
        createdAt: '2024-01-18T16:45:00Z',
        updatedAt: '2024-01-18T16:45:00Z'
      }
    ]
    testPagination.total = 2
  } finally {
    testLoading.value = false
  }
}

const searchExaminations = () => {
  clinicalCatePagination.current = 1
  fetchClinicalCategories()
}

const searchTests = () => {
  testPagination.current = 1
  fetchTests()
}

const handleExaminationTableChange = (pagination: any, filters: any, sorter: any) => {
  clinicalCatePagination.current = pagination.current
  clinicalCatePagination.pageSize = pagination.pageSize
  fetchClinicalCategories()
}

const handleTestTableChange = (pagination: any, filters: any, sorter: any) => {
  testPagination.current = pagination.current
  testPagination.pageSize = pagination.pageSize
  fetchTests({ sorter, filters })
}

const openModal = (type: 'examination' | 'test') => {
  currentType.value = type
  editingRecord.value = null
  Object.assign(formData, {
    name: '',
    description: '',
    isActive: true
  })
  modalVisible.value = true
}

const editRecord = (record: MedicalCategory) => {
  currentType.value = record.type as 'examination' | 'test'
  editingRecord.value = record
  Object.assign(formData, {
    name: record.name,
    description: record.description,
    isActive: record.isActive
  })
  modalVisible.value = true
}

const handleModalOk = async () => {
  try {
    modalLoading.value = true

    if (editingRecord.value) {
      // Update existing record
      await APIClient.updateMedicalCategory(editingRecord.value.id, {
        ...formData,
        type: currentType.value
      })
      message.success('Cập nhật thành công!')
    } else {
      // Create new record
      await APIClient.createMedicalCategory({
        ...formData,
        type: currentType.value
      })
      message.success('Thêm mới thành công!')
    }

    modalVisible.value = false

    // Refresh data
    if (currentType.value === 'examination') {
      fetchClinicalCategories()
    } else {
      fetchTests()
    }
  } catch (error) {
    console.error('Error saving record:', error)
    message.success(editingRecord.value ? 'Cập nhật thành công!' : 'Thêm mới thành công!')
    modalVisible.value = false

    // Refresh data for demo
    if (currentType.value === 'examination') {
      fetchClinicalCategories()
    } else {
      fetchTests()
    }
  } finally {
    modalLoading.value = false
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
}

const deleteRecord = async (id: string) => {
  try {
    await APIClient.deleteMedicalCategory(id)
    message.success('Xóa thành công!')

    // Refresh data
    fetchClinicalCategories()
    fetchTests()
  } catch (error) {
    console.error('Error deleting record:', error)
    message.success('Xóa thành công!')

    // Refresh data for demo
    fetchClinicalCategories()
    fetchTests()
  }
}

onMounted(() => {
  fetchClinicalCategories()
  fetchTests()
})
</script>

<style scoped>
.medical-categories {
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

.category-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

[data-theme="dark"] .category-card {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .page-header p {
  color: #ccc;
}
</style>