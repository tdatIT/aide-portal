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
            <a-form-item label="Nhập ID người dùng">
              <a-input
                v-model:value="userIdInput"
                placeholder="Nhập ID người dùng (VD: 1949431646327410688)"
                @press-enter="handleUserIdSubmit"
                :loading="userLoading"
              >
                <template #suffix>
                  <a-button 
                    type="primary" 
                    size="small" 
                    @click="handleUserIdSubmit"
                    :loading="userLoading"
                  >
                    Tìm
                  </a-button>
                </template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Vai trò hiện tại">
              <div v-if="selectedUser && selectedUser.roles && selectedUser.roles.length > 0">
                <a-tag v-for="role in selectedUser.roles" :key="role.id" color="blue" size="large" style="margin-bottom: 4px;">
                  {{ role.name }}
                </a-tag>
              </div>
              <span v-else>Chưa có vai trò</span>
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
          <h3>Phân quyền cho: {{ selectedUser.fullname }}</h3>
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
          <a-col :span="24">
            <a-card title="Phân quyền vai trò" size="small">
              <div class="role-selection">
                <p>Chọn vai trò cho người dùng:</p>
                <a-checkbox-group v-model:value="selectedRoleIds">
                  <a-row :gutter="16">
                    <a-col :span="12" v-for="role in roles" :key="role.id">
                      <a-checkbox :value="role.id" style="width: 100%; margin-bottom: 12px;">
                        <div class="role-item">
                          <div class="role-name">{{ role.name }}</div>
                          <div class="role-description">{{ role.description }}</div>
                        </div>
                      </a-checkbox>
                    </a-col>
                  </a-row>
                </a-checkbox-group>
              </div>
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { APIClient } from '@/api'
import type { UserWithRoles, Role } from '@/types'
import {
  ReloadOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'

const route = useRoute()

// Reactive data
const roles = ref<Role[]>([])
const selectedUser = ref<UserWithRoles | null>(null)
const selectedRoleIds = ref<number[]>([])
const userIdInput = ref<string>('')
const userLoading = ref(false)
const saving = ref(false)





// Methods
const fetchUserById = async (userId: string) => {
  try {
    userLoading.value = true
    const response = await APIClient.getUser(userId)
    selectedUser.value = response.data.data
    // Set current roles to selected
    if (selectedUser.value?.roles) {
      selectedRoleIds.value = selectedUser.value.roles.map((role: Role) => role.id)
    } else {
      selectedRoleIds.value = []
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    message.error('Không tìm thấy người dùng với ID này')
    selectedUser.value = null
    selectedRoleIds.value = []
  } finally {
    userLoading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const response = await APIClient.getRoles()
    roles.value = response.data.data.items
  } catch (error) {
    // Mock data for demo
    roles.value = [
      {
        id: 1,
        name: 'ROLE_ADMIN',
        description: 'Quản trị viên hệ thống',
        createdAt: '2025-07-26T03:53:55.150728Z',
        updatedAt: '2025-07-26T03:53:55.150728Z'
      },
      {
        id: 2,
        name: 'ROLE_USER',
        description: 'Người dùng thường',
        createdAt: '2025-07-26T03:53:55.150728Z',
        updatedAt: '2025-07-26T03:53:55.150728Z'
      }
    ]
  }
}



const handleUserIdSubmit = () => {
  if (userIdInput.value.trim()) {
    fetchUserById(userIdInput.value.trim())
  } else {
    message.warning('Vui lòng nhập ID người dùng')
  }
}

const resetPermissions = () => {
  if (selectedUser.value?.roles) {
    selectedRoleIds.value = selectedUser.value.roles.map((role: Role) => role.id)
  } else {
    selectedRoleIds.value = []
  }
}

const savePermissions = async () => {
  if (!selectedUser.value) return

  try {
    saving.value = true
    await APIClient.updateRoleMapping(selectedUser.value.id, selectedRoleIds.value)
    message.success('Cập nhật phân quyền thành công!')
    
    // Refresh user data to show updated roles
    await fetchUserById(selectedUser.value.id)
  } catch (error) {
    console.error('Error updating role mapping:', error)
    message.error('Có lỗi xảy ra khi cập nhật phân quyền')
  } finally {
    saving.value = false
  }
}

// Watch for route params
watch(() => route.query.userId, (userId) => {
  if (userId && typeof userId === 'string') {
    userIdInput.value = userId
    fetchUserById(userId)
  }
}, { immediate: true })

onMounted(async () => {
  await fetchRoles()
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

.role-selection p {
  margin-bottom: 16px;
  color: #666;
  font-weight: 500;
}

.role-item {
  width: 100%;
}

.role-name {
  font-weight: 500;
  color: #1890ff;
  margin-bottom: 4px;
}

.role-description {
  font-size: 12px;
  color: #999;
}
</style> 