<template>
  <div class="user-list">
    <div class="page-header">
      <h1>{{ $t('menu.userList') }}</h1>
      <p>Quản lý thông tin người dùng trong hệ thống</p>
    </div>

    <a-card class="user-card">

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
            <a-select-option value="true">Active</a-select-option>
            <a-select-option value="false">Inactive</a-select-option>
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
              {{ (record.fullname || record.name || '').charAt(0) }}
            </a-avatar>
          </template>
          <template v-else-if="column.key === 'isActive'">
            <a-switch
              v-model:checked="record.isActive"
              :loading="record.statusLoading"
              checked-children="Active"
              un-checked-children="Inactive"
              @change="updateUserStatus(record)"
            />
          </template>
          <template v-else-if="column.key === 'createdAt'">
            {{ formatTimeDate(record.createdAt) }}
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-button type="text" size="small" @click="viewPermissions(record)">
              <KeyOutlined />
              Phân quyền
            </a-button>
          </template>
        </template>
      </a-table>
    </a-card>


  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { APIClient } from '@/api'
import type { User, TableColumn } from '@/types'
import { KeyOutlined } from '@ant-design/icons-vue'
import { formatTimeDate } from '@/helper/date'

const router = useRouter()

// Reactive data
const dataSource = ref<User[]>([])
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
    `${range[0]}-${range[1]} của ${total} người dùng`
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
    title: 'Avatar',
    key: 'avatar',
    width: 80
  },
  {
    title: 'Họ và tên',
    dataIndex: 'fullname',
    key: 'fullname',
    sorter: true
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    sorter: true
  },
  {
    title: 'Trạng thái',
    key: 'isActive',
    width: 120,
    filters: [
      { text: 'Active', value: true },
      { text: 'Inactive', value: false }
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
    width: 120,
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
    
    dataSource.value = response.data.data.items
    pagination.total = response.data.data.total
  } catch (error) {
    console.error('Error fetching users:', error)
    message.error('Lỗi khi tải danh sách người dùng')
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

const updateUserStatus = async (record: User) => {
  try {
    record.statusLoading = true
    await APIClient.updateUserStatus(record.id, record.isActive)
    message.success(`Đã ${record.isActive ? 'kích hoạt' : 'vô hiệu hóa'} người dùng thành công!`)
  } catch (error) {
    console.error('Error updating user status:', error)
    // Revert the switch state on error
    record.isActive = !record.isActive
    message.error('Có lỗi xảy ra khi cập nhật trạng thái người dùng')
  } finally {
    record.statusLoading = false
  }
}

const viewPermissions = (record: User) => {
  router.push(`/user/permissions?userId=${record.id}`)
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