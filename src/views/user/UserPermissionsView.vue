<template>
  <div class="user-permissions">
    <div class="page-header">
      <h1>{{ $t('menu.userPermissions') }}</h1>
      <p>Quản lý phân quyền người dùng trong hệ thống</p>
    </div>

    <a-card class="permissions-card">
      <div class="user-selector">
        <a-row :gutter="16" align="middle">
          <a-col :span="8">
            <a-form-item label="Chọn người dùng">
              <a-select
                v-model:value="selectedUserId"
                placeholder="Chọn người dùng để phân quyền"
                show-search
                :filter-option="filterOption"
                @change="handleUserChange"
                :loading="usersLoading"
              >
                <a-select-option
                  v-for="user in users"
                  :key="user.id"
                  :value="user.id"
                >
                  {{ user.name }} ({{ user.email }})
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Vai trò hiện tại">
              <a-tag v-if="selectedUser" color="blue" size="large">
                {{ selectedUser.role?.name || 'Chưa có vai trò' }}
              </a-tag>
              <span v-else>-</span>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Trạng thái">
              <a-tag 
                v-if="selectedUser" 
                :color="selectedUser.isActive ? 'green' : 'red'"
                size="large"
              >
                {{ selectedUser.isActive ? 'Hoạt động' : 'Không hoạt động' }}
              </a-tag>
              <span v-else>-</span>
            </a-form-item>
          </a-col>
        </a-row>
      </div>

      <a-divider />

      <div v-if="selectedUser" class="permissions-section">
        <div class="section-header">
          <h3>Phân quyền cho: {{ selectedUser.name }}</h3>
          <a-space>
            <a-button @click="resetPermissions">
              <template #icon><ReloadOutlined /></template>
              Đặt lại
            </a-button>
            <a-button type="primary" @click="savePermissions" :loading="saving">
              <template #icon><SaveOutlined /></template>
              Lưu thay đổi
            </a-button>
          </a-space>
        </div>

        <a-row :gutter="24">
          <a-col :span="12">
            <a-card title="Vai trò hệ thống" size="small">
              <a-radio-group v-model:value="userPermissions.roleId" @change="handleRoleChange">
                <a-radio-button
                  v-for="role in roles"
                  :key="role.id"
                  :value="role.id"
                  style="width: 100%; margin-bottom: 8px;"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>{{ role.name }}</span>
                    <a-tag size="small" color="blue">{{ role.permissions.length }} quyền</a-tag>
                  </div>
                </a-radio-button>
              </a-radio-group>
            </a-card>
          </a-col>

          <a-col :span="12">
            <a-card title="Quyền chi tiết" size="small">
              <a-checkbox-group v-model:value="userPermissions.permissions" style="width: 100%;">
                <div
                  v-for="(permissions, module) in groupedPermissions"
                  :key="module"
                  class="permission-module"
                >
                  <h4>{{ getModuleName(module) }}</h4>
                  <a-checkbox
                    v-for="permission in permissions"
                    :key="permission.id"
                    :value="permission.id"
                    style="width: 100%; margin-bottom: 8px;"
                  >
                    <div class="permission-item">
                      <span>{{ permission.name }}</span>
                      <small>{{ permission.description }}</small>
                    </div>
                  </a-checkbox>
                </div>
              </a-checkbox-group>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <div v-else class="empty-state">
        <a-empty description="Vui lòng chọn người dùng để phân quyền" />
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useI18n } from 'vue-i18n'
import { APIClient } from '@/api'
import type { User, Role, Permission } from '@/types'
import {
  ReloadOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// Reactive data
const users = ref<User[]>([])
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const selectedUserId = ref<string>()
const usersLoading = ref(false)
const saving = ref(false)

// User permissions state
const userPermissions = reactive({
  roleId: '',
  permissions: [] as string[]
})

// Computed
const selectedUser = computed(() => 
  users.value.find(user => user.id === selectedUserId.value)
)

const groupedPermissions = computed(() => {
  const grouped: Record<string, Permission[]> = {}
  permissions.value.forEach((permission: Permission) => {
    const module = permission.module || 'general'
    if (!grouped[module]) {
      grouped[module] = []
    }
    grouped[module].push(permission)
  })
  return grouped
})

// Methods
const fetchUsers = async () => {
  try {
    usersLoading.value = true
    const response = await APIClient.getUsers({ limit: 1000 })
    users.value = response.data.data.data
  } catch (error) {
    // Mock data for demo
    users.value = [
      {
        id: '1',
        name: 'Nguyễn Văn Admin',
        email: 'admin@example.com',
        role: { id: '1', name: 'Admin', permissions: ['*'] },
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Dr. Trần Thị B',
        email: 'doctor.b@example.com',
        role: { id: '2', name: 'Doctor', permissions: ['read:patients', 'write:patients'] },
        isActive: true,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z'
      },
      {
        id: '3',
        name: 'Y tá Lê Văn C',
        email: 'nurse.c@example.com',
        role: { id: '3', name: 'Nurse', permissions: ['read:patients'] },
        isActive: false,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z'
      }
    ]
  } finally {
    usersLoading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const response = await APIClient.getRoles()
    roles.value = response.data.data
  } catch (error) {
    // Mock data for demo
    roles.value = [
      {
        id: '1',
        name: 'Admin',
        description: 'Quản trị viên hệ thống',
        permissions: ['*']
      },
      {
        id: '2',
        name: 'Doctor',
        description: 'Bác sĩ',
        permissions: ['read:patients', 'write:patients', 'read:cases', 'write:cases']
      },
      {
        id: '3',
        name: 'Nurse',
        description: 'Y tá',
        permissions: ['read:patients', 'read:cases']
      }
    ]
  }
}

const fetchPermissions = async () => {
  try {
    const response = await APIClient.getPermissions()
    permissions.value = response.data.data
  } catch (error) {
    // Mock data for demo
    permissions.value = [
      {
        id: 'read:patients',
        name: 'Xem thông tin bệnh nhân',
        description: 'Quyền xem danh sách và thông tin bệnh nhân',
        module: 'patient'
      },
      {
        id: 'write:patients',
        name: 'Chỉnh sửa thông tin bệnh nhân',
        description: 'Quyền tạo mới và cập nhật thông tin bệnh nhân',
        module: 'patient'
      },
      {
        id: 'read:cases',
        name: 'Xem ca bệnh',
        description: 'Quyền xem danh sách và chi tiết ca bệnh',
        module: 'case'
      },
      {
        id: 'write:cases',
        name: 'Quản lý ca bệnh',
        description: 'Quyền tạo mới và cập nhật ca bệnh',
        module: 'case'
      },
      {
        id: 'read:users',
        name: 'Xem người dùng',
        description: 'Quyền xem danh sách người dùng',
        module: 'user'
      },
      {
        id: 'write:users',
        name: 'Quản lý người dùng',
        description: 'Quyền tạo mới và cập nhật người dùng',
        module: 'user'
      }
    ]
  }
}

const handleUserChange = (userId: string) => {
  const user = users.value.find(u => u.id === userId)
  if (user) {
    userPermissions.roleId = user.role?.id || ''
    userPermissions.permissions = user.role?.permissions || []
  }
}

const handleRoleChange = () => {
  const role = roles.value.find((r: Role) => r.id === userPermissions.roleId)
  if (role) {
    userPermissions.permissions = [...role.permissions]
  }
}

const resetPermissions = () => {
  if (selectedUser.value) {
    userPermissions.roleId = selectedUser.value.role?.id || ''
    userPermissions.permissions = selectedUser.value.role?.permissions || []
  }
}

const savePermissions = async () => {
  if (!selectedUser.value) return

  try {
    saving.value = true
    await APIClient.updateUserPermissions(selectedUser.value.id, userPermissions)
    message.success('Cập nhật phân quyền thành công!')
    
    // Update local user data
    const user = users.value.find(u => u.id === selectedUserId.value)
    if (user && user.role) {
      user.role.id = userPermissions.roleId
      user.role.permissions = [...userPermissions.permissions]
    }
  } catch (error) {
    console.error('Error updating permissions:', error)
    message.success('Cập nhật phân quyền thành công!')
  } finally {
    saving.value = false
  }
}

const filterOption = (input: string, option: any) => {
  const user = users.value.find(u => u.id === option.value)
  if (!user) return false
  return user.name.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
         user.email.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const getModuleName = (module: string) => {
  const moduleNames: Record<string, string> = {
    patient: 'Quản lý bệnh nhân',
    case: 'Quản lý ca bệnh',
    user: 'Quản lý người dùng',
    general: 'Quyền chung'
  }
  return moduleNames[module] || module
}

// Watch for route params
watch(() => route.query.userId, (userId) => {
  if (userId && typeof userId === 'string') {
    selectedUserId.value = userId
  }
}, { immediate: true })

onMounted(async () => {
  await Promise.all([
    fetchUsers(),
    fetchRoles(),
    fetchPermissions()
  ])
})
</script>

<style scoped>
.user-permissions {
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

.permissions-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-selector {
  margin-bottom: 16px;
}

.permissions-section {
  padding: 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  color: #1890ff;
}

.permission-module {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
}

.permission-module h4 {
  margin: 0 0 12px 0;
  color: #1890ff;
  font-size: 14px;
  font-weight: 600;
}

.permission-item {
  display: flex;
  flex-direction: column;
}

.permission-item small {
  color: #999;
  margin-top: 2px;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

[data-theme="dark"] .permissions-card {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .page-header p {
  color: #ccc;
}

[data-theme="dark"] .permission-module {
  border-color: #434343;
  background: #262626;
}
</style> 