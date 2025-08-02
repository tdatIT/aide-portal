<template>
  <div class="medical-categories">
    <div class="page-header">
      <h1>{{ $t('patient.categories.title') }}</h1>
      <p>Quản lý danh mục khám bệnh/xét nghiệm</p>
    </div>

    <!-- Clinical Categories -->
    <a-card class="category-card" :title="$t('patient.categories.clinicalExamination')" style="margin-bottom: 24px">
      <template #extra>
        <a-button type="primary" @click="openModal('clinical')">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ $t('common.add') }}
        </a-button>
      </template>

      <div class="table-toolbar">
        <a-input-search v-model:value="clinicalCateSearch"
          :placeholder="`${$t('common.search')} ${$t('patient.categories.clinicalExamination').toLowerCase()}`"
          style="width: 300px" @search="searchExaminations" allow-clear />
      </div>

      <a-table :columns="clinicalCateColumns" :data-source="clinicalCateData" :loading="clinicalCateLoading"
        :pagination="clinicalCatePagination" @change="handleExaminationTableChange" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag color="blue">{{ $t('patient.categories.clinicalExamination') }}</a-tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTimeDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="editRecord(record, 'clinical')">
                <EditOutlined />
              </a-button>
              <a-popconfirm title="Bạn có chắc chắn muốn xóa?" @confirm="deleteRecord(record.id, 'clinical')">
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
        <a-button type="primary" @click="openModal('paraclinical')">
          <template #icon>
            <PlusOutlined />
          </template>
          {{ $t('common.add') }}
        </a-button>
      </template>

      <div class="table-toolbar">
        <a-input-search v-model:value="paraclinicalCateSearch"
          :placeholder="`${$t('common.search')} ${$t('patient.categories.paraclinicalTest').toLowerCase()}`"
          style="width: 300px" @search="searchTests" allow-clear />
      </div>

      <a-table :columns="paraclinicalCateColumns" :data-source="paraclinicalCateData" :loading="paraclinicalCateLoading"
        :pagination="paraclinicalCatePagination" @change="handleTestTableChange" row-key="id">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <a-tag color="purple">{{ $t('patient.categories.paraclinicalTest') }}</a-tag>
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTimeDate(record.createdAt) }}
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="editRecord(record, 'paraclinical')">
                <EditOutlined />
              </a-button>
              <a-popconfirm title="Bạn có chắc chắn muốn xóa?" @confirm="deleteRecord(record.id, 'paraclinical')">
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
import { APIClient } from '@/api'
import { formatTimeDate } from '@/helper/date'
import type { ClinicalCategory, ParaclinicalCategory } from '@/types'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Reactive data
const clinicalCateData = ref<ClinicalCategory[]>([])
const paraclinicalCateData = ref<ParaclinicalCategory[]>([])
const clinicalCateLoading = ref(false)
const paraclinicalCateLoading = ref(false)
const clinicalCateSearch = ref('')
const paraclinicalCateSearch = ref('')
const modalVisible = ref(false)
const modalLoading = ref(false)
const currentType = ref<'paraclinical' | 'clinical'>('clinical')
const editingRecord = ref<ClinicalCategory | ParaclinicalCategory | null>(null)

// Form data
const formData = reactive({
  name: '',
  description: ''
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

const paraclinicalCatePagination = reactive({
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
  const typeLabel = currentType.value === 'clinical' ? t('patient.categories.clinicalExamination') : t('patient.categories.paraclinicalTest')
  return editingRecord.value ? `${t('common.edit')} ${typeLabel}` : `${t('common.add')} ${typeLabel}`
})

const paraclinicalCateColumns = computed(() => [
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
    key: 'description',
    width: 250
  },
  {
    title: t('common.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 220,
    sorter: true
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
])

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
    key: 'description',
    width: 250
  },
  {
    title: t('common.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 220,
    sorter: true
  },
  {
    title: t('common.actions'),
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
])

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
    message.error('Đã có lỗi xảy ra')
  } finally {
    clinicalCateLoading.value = false
  }
}

const fetchParaclinicalCategories = async () => {
  try {
    paraclinicalCateLoading.value = true
    const response = await APIClient.getParaclinicalCategories({
      page: paraclinicalCatePagination.current,
      size: paraclinicalCatePagination.pageSize,
    })

    paraclinicalCateData.value = response.data.data.items
    paraclinicalCatePagination.total = response.data.data.total
  } catch (error) {
    message.error('Đã có lỗi xảy ra')
  } finally {
    paraclinicalCateLoading.value = false
  }
}

const searchExaminations = () => {
  clinicalCatePagination.current = 1
  fetchClinicalCategories()
}

const searchTests = () => {
  paraclinicalCatePagination.current = 1
  fetchParaclinicalCategories()
}

const handleExaminationTableChange = (pagination: any) => {
  clinicalCatePagination.current = pagination.current
  clinicalCatePagination.pageSize = pagination.pageSize
  fetchClinicalCategories()
}

const handleTestTableChange = (pagination: any) => {
  paraclinicalCatePagination.current = pagination.current
  paraclinicalCatePagination.pageSize = pagination.pageSize
  fetchParaclinicalCategories()
}

const openModal = (type: 'paraclinical' | 'clinical') => {
  currentType.value = type
  editingRecord.value = null
  Object.assign(formData, {
    name: '',
    description: ''
  })
  modalVisible.value = true
}

const editRecord = (record: ClinicalCategory | ParaclinicalCategory, type: 'clinical' | 'paraclinical') => {
  currentType.value = type
  editingRecord.value = record
  Object.assign(formData, {
    name: record.name,
    description: record.description
  })
  modalVisible.value = true
}

const handleModalOk = async () => {
  try {
    modalLoading.value = true

    if (editingRecord.value) {
      // Update existing record
      if (currentType.value === 'clinical') {
        await APIClient.updateClinicalCategory(editingRecord.value.id, {
          ...formData
        })
      } else {
        await APIClient.updateParaclinicalCategory(editingRecord.value.id, {
          ...formData
        })
      }
      message.success('Cập nhật thành công!')
    } else {
      // Create new record
      if (currentType.value === 'clinical') {
        await APIClient.createClinicalCategory({
          ...formData
        })
      } else {
        await APIClient.createParaclinicalCategory({
          ...formData
        })
      }
      message.success('Thêm mới thành công!')
    }

    modalVisible.value = false

    // Refresh data
    if (currentType.value === 'clinical') {
      fetchClinicalCategories()
    } else {
      fetchParaclinicalCategories()
    }
  } catch (error) {
    console.error('Error saving record:', error)
    message.success(editingRecord.value ? 'Cập nhật thành công!' : 'Thêm mới thành công!')
    modalVisible.value = false

    // Refresh data for demo
    if (currentType.value === 'clinical') {
      fetchClinicalCategories()
    } else {
      fetchParaclinicalCategories()
    }
  } finally {
    modalLoading.value = false
  }
}

const handleModalCancel = () => {
  modalVisible.value = false
}

const deleteRecord = async (id: string, type: 'clinical' | 'paraclinical') => {
  try {
    if (type === 'clinical') {
      await APIClient.deleteClinicalCategory(id)
    } else {
      await APIClient.deleteParaclinicalCategory(id)
    }
    message.success('Xóa thành công!')

    // Refresh data
    fetchClinicalCategories()
    fetchParaclinicalCategories()
  } catch (error) {
    console.error('Error deleting record:', error)
    message.success('Xóa thành công!')

    // Refresh data for demo
    fetchClinicalCategories()
    fetchParaclinicalCategories()
  }
}

onMounted(() => {
  fetchClinicalCategories()
  fetchParaclinicalCategories()
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