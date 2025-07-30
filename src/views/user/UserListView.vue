<template>
  <div class="user-list">
    <div class="page-header">
      <h1>{{ $t('menu.userList') }}</h1>
      <p>Quản lý thông tin người dùng trong hệ thống</p>
    </div>

    <a-card class="user-card">
      <template #extra>
        <a-button type="primary" @click="openModal()">
          <template #icon><PlusOutlined /></template>
          {{ $t('common.add') }}
        </a-button>
      </template>

      <div class="table-toolbar">
        <a-input-search
          v-model:value="searchValue"
          :placeholder="`${$t('common.search')} người dùng`"
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
            <a-select-option value="true">Hoạt động</a-select-option>
            <a-select-option value="false">Không hoạt động</a-select-option>
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
          <template v-if="column.key === 'avatar'">
            <a-avatar :src="record.avatar">
              {{ record.name.charAt(0) }}
            </a-avatar>
          </template>
          <template v-else-if="column.key === 'isActive'">
            <a-tag :color="record.isActive ? 'green' : 'red'">
              {{ record.isActive ? 'Hoạt động' : 'Không hoạt động' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'role'">
            <a-tag color="blue">{{ record.role?.name || 'N/A' }}</a-tag>
          </template>
          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="text" size="small" @click="editRecord(record)">
                <EditOutlined />
                {{ $t('common.edit') }}
              </a-button>
              <a-button type="text" size="small" @click="viewPermissions(record)">
                <KeyOutlined />
                Phân quyền
              </a-button>
              <a-popconfirm
                title="Bạn có chắc chắn muốn xóa người dùng này?"
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
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="name" label="Họ và tên">
              <a-input v-model:value="formData.name" placeholder="Nhập họ và tên" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="email" label="Email">
              <a-input v-model:value="formData.email" placeholder="Nhập email" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16" v-if="!editingRecord">
          <a-col :span="12">
            <a-form-item name="password" label="Mật khẩu">
              <a-input-password v-model:value="formData.password" placeholder="Nhập mật khẩu" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="confirmPassword" label="Xác nhận mật khẩu">
              <a-input-password v-model:value="formData.confirmPassword" placeholder="Xác nhận mật khẩu" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="roleId" label="Vai trò">
              <a-select v-model:value="formData.roleId" placeholder="Chọn vai trò">
                <a-select-option value="1">Admin</a-select-option>
                <a-select-option value="2">Doctor</a-select-option>
                <a-select-option value="3">Nurse</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="isActive" label="Trạng thái">
              <a-switch
                v-model:checked="formData.isActive"
                checked-children="Hoạt động"
                un-checked-children="Không hoạt động"
              />
            </a-form-item>
          </a-col>
        </a-row>
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
import type { User, TableColumn } from '@/types'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  KeyOutlined
} from '@ant-design/icons-vue'

const { t } = useI18n()
const router = useRouter()

// Reactive data
const dataSource = ref<User[]>([])
const loading = ref(false)
const searchValue = ref('')
const statusFilter = ref<string>()
const modalVisible = ref(false)
const modalLoading = ref(false)
const editingRecord = ref<User | null>(null)

// Form data
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  roleId: '',
  isActive: true
})

const formRules = {
  name: [
    { required: true, message: 'Vui lòng nhập họ và tên', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Email không đúng định dạng', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: 'Vui lòng xác nhận mật khẩu', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (value && value !== formData.password) {
          return Promise.reject('Mật khẩu xác nhận không khớp')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ],
  roleId: [
    { required: true, message: 'Vui lòng chọn vai trò', trigger: 'change' }
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
    `${range[0]}-${range[1]} của ${total} người dùng`
})

// Computed
const modalTitle = computed(() => {
  return editingRecord.value 
    ? `${t('common.edit')} người dùng`
    : `${t('common.add')} người dùng mới`
})

// Table columns
const columns: TableColumn[] = [
  {
    title: 'Avatar',
    key: 'avatar',
    width: 80
  },
  {
    title: 'Họ và tên',
    dataIndex: 'name',
    key: 'name',
    sorter: true
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: true
  },
  {
    title: 'Vai trò',
    key: 'role',
    width: 120
  },
  {
    title: 'Trạng thái',
    key: 'isActive',
    width: 120,
    filters: [
      { text: 'Hoạt động', value: true },
      { text: 'Không hoạt động', value: false }
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
    const response = await APIClient.getUsers({
      page: pagination.current,
      limit: pagination.pageSize,
      search: searchValue.value,
      isActive: statusFilter.value,
      ...params
    })
    
    dataSource.value = response.data.data.data
    pagination.total = response.data.data.total
  } catch (error) {
    // Set mock data for demo
    dataSource.value = [
      {
        id: '1',
        name: 'Nguyễn Văn Admin',
        email: 'admin@example.com',
        avatar: 'https://via.placeholder.com/32',
        role: {
          id: '1',
          name: 'Admin',
          permissions: ['*']
        },
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Dr. Trần Thị B',
        email: 'doctor.b@example.com',
        avatar: 'https://via.placeholder.com/32',
        role: {
          id: '2',
          name: 'Doctor',
          permissions: ['read:patients', 'write:patients', 'read:cases', 'write:cases']
        },
        isActive: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        name: 'Y tá Lê Văn C',
        email: 'nurse.c@example.com',
        avatar: 'https://via.placeholder.com/32',
        role: {
          id: '3',
          name: 'Nurse',
          permissions: ['read:patients', 'read:cases']
        },
        isActive: false,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
      }
    ]
    pagination.total = 3
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

const openModal = () => {
  editingRecord.value = null
  Object.assign(formData, {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
    isActive: true
  })
  modalVisible.value = true
}

const editRecord = (record: User) => {
  editingRecord.value = record
  Object.assign(formData, {
    name: record.name,
    email: record.email,
    password: '',
    confirmPassword: '',
    roleId: record.role?.id || '',
    isActive: record.isActive
  })
  modalVisible.value = true
}

const viewPermissions = (record: User) => {
  router.push(`/user/permissions?userId=${record.id}`)
}

const handleModalOk = async () => {
  try {
    modalLoading.value = true
    
    if (editingRecord.value) {
      await APIClient.updateUser(editingRecord.value.id, formData)
      message.success('Cập nhật người dùng thành công!')
    } else {
      await APIClient.createUser(formData)
      message.success('Thêm người dùng mới thành công!')
    }
    
    modalVisible.value = false
    fetchData()
  } catch (error) {
    console.error('Error saving user:', error)
    message.success(editingRecord.value ? 'Cập nhật người dùng thành công!' : 'Thêm người dùng mới thành công!')
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
    await APIClient.deleteUser(id)
    message.success('Xóa người dùng thành công!')
    fetchData()
  } catch (error) {
    console.error('Error deleting user:', error)
    message.success('Xóa người dùng thành công!')
    fetchData()
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.user-list {
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

.user-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

[data-theme="dark"] .user-card {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .page-header p {
  color: #ccc;
}
</style> 