<template>
  <a-layout class="main-layout">
    <!-- Sidebar -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      width="240"
      class="sidebar"
      :class="{ 'sidebar-dark': isDark }"
    >
      <!-- Logo -->
      <div class="logo">
        <img src="/vite.svg" alt="Logo" />
        <span v-show="!collapsed" class="logo-text">Admin Portal</span>
      </div>

      <!-- Menu -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :theme="isDark ? 'dark' : 'light'"
        :items="menuItems"
        @click="handleMenuClick"
      />
    </a-layout-sider>

    <a-layout>
      <!-- Header -->
      <a-layout-header class="header" :class="{ 'header-dark': isDark }">
        <div class="header-left">
          <a-button
            type="text"
            :icon="h(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)"
            @click="toggleSidebar"
            class="sidebar-trigger"
          />
          
          <!-- Breadcrumb -->
          <a-breadcrumb class="breadcrumb">
            <a-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path">
              <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
              <span v-else>{{ item.title }}</span>
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <!-- Search -->
          <a-input-search
            v-model:value="searchValue"
            :placeholder="$t('common.search')"
            style="width: 200px; margin-right: 16px"
            @search="handleSearch"
          />

          <!-- Theme Toggle -->
          <a-button
            type="text"
            :icon="h(BulbOutlined)"
            @click="toggleTheme"
            class="header-action"
          />

          <!-- Language -->
          <a-dropdown :trigger="['click']">
            <a-button type="text" class="header-action">
              <template #icon>
                <GlobalOutlined />
              </template>
              {{ currentLanguage.toUpperCase() }}
            </a-button>
            <template #overlay>
              <a-menu @click="handleLanguageChange">
                <a-menu-item key="vi">Tiếng Việt</a-menu-item>
                <a-menu-item key="en">English</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- Notifications -->
          <a-badge :count="5" :offset="[-5, 5]">
            <a-button
              type="text"
              :icon="h(BellOutlined)"
              class="header-action"
            />
          </a-badge>

          <!-- User Profile -->
          <a-dropdown :trigger="['click']">
            <a-button type="text" class="user-profile">
              <a-avatar src="https://via.placeholder.com/32" size="small" />
              <span class="username">{{ currentUser?.name || 'Admin' }}</span>
              <DownOutlined />
            </a-button>
            <template #overlay>
              <a-menu @click="handleUserMenuClick">
                <a-menu-item key="profile">
                  <UserOutlined />
                  Thông tin cá nhân
                </a-menu-item>
                <a-menu-item key="settings">
                  <SettingOutlined />
                  Cài đặt
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <LogoutOutlined />
                  {{ $t('auth.logout') }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- Content -->
      <a-layout-content class="content">
        <div class="content-wrapper">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, computed, h, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore, useAuthStore } from '@/stores'
import type { MenuItem } from '@/types'

interface BreadcrumbItem {
  title: string
  path?: string
}
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  BulbOutlined,
  GlobalOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  DashboardOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  TeamOutlined,
  UserSwitchOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()

// Reactive states
const searchValue = ref('')
const selectedKeys = ref<string[]>([])

// Computed
const collapsed = computed(() => appStore.collapsed)
const isDark = computed(() => appStore.theme === 'dark')
const currentLanguage = computed(() => appStore.language)
const currentUser = computed(() => authStore.currentUser)

// Menu items
const menuItems = computed((): MenuItem[] => [
  {
    key: 'dashboard',
    icon: h(DashboardOutlined),
    label: t('menu.dashboard'),
    path: '/dashboard'
  },
  {
    key: 'patient',
    icon: h(MedicineBoxOutlined),
    label: t('menu.patientManagement'),
    children: [
      {
        key: 'patient-categories',
        icon: h(FileTextOutlined),
        label: t('menu.medicalCategories'),
        path: '/patient/categories'
      },
      {
        key: 'patient-cases',
        icon: h(MedicineBoxOutlined),
        label: t('menu.medicalCases'),
        path: '/patient/cases'
      }
    ]
  },
  {
    key: 'test',
    icon: h(ExperimentOutlined),
    label: t('menu.testManagement'),
    children: [
      {
        key: 'test-executions',
        icon: h(ExperimentOutlined),
        label: t('menu.testExecutions'),
        path: '/test/executions'
      }
    ]
  },
  {
    key: 'user',
    icon: h(TeamOutlined),
    label: t('menu.userManagement'),
    children: [
      {
        key: 'user-list',
        icon: h(TeamOutlined),
        label: t('menu.userList'),
        path: '/user/list'
      },
      {
        key: 'user-permissions',
        icon: h(UserSwitchOutlined),
        label: t('menu.userPermissions'),
        path: '/user/permissions'
      }
    ]
  }
])

// Breadcrumb items
const breadcrumbItems = computed((): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = [{ title: t('menu.dashboard'), path: '/dashboard' }]
  
  if (route.meta.title) {
    items.push({ title: route.meta.title as string })
  }
  
  return items
})

// Methods
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

const toggleTheme = () => {
  appStore.setTheme(isDark.value ? 'light' : 'dark')
}

const handleMenuClick = ({ key }: { key: string }) => {
  // Find menu item with path
  const findMenuItem = (items: MenuItem[]): MenuItem | undefined => {
    for (const item of items) {
      if (item.key === key && item.path) {
        return item
      }
      if (item.children) {
        const found = findMenuItem(item.children)
        if (found) return found
      }
    }
  }

  const menuItem = findMenuItem(menuItems.value)
  if (menuItem?.path) {
    router.push(menuItem.path)
  }
}

const handleLanguageChange = ({ key }: { key: string }) => {
  appStore.setLanguage(key as 'vi' | 'en')
  locale.value = key
}

const handleSearch = (value: string) => {
  console.log('Search:', value)
  // Implement search functionality
}

const handleUserMenuClick = ({ key }: { key: string }) => {
  switch (key) {
    case 'profile':
      // Handle profile
      break
    case 'settings':
      // Handle settings
      break
    case 'logout':
      authStore.logout()
      router.push('/login')
      break
  }
}

// Watch route changes to update selected keys
watch(
  () => route.path,
  (newPath) => {
    // Find the corresponding menu key
    const findMenuKey = (items: MenuItem[], path: string): string | undefined => {
      for (const item of items) {
        if (item.path === path) {
          return item.key
        }
        if (item.children) {
          const found = findMenuKey(item.children, path)
          if (found) return found
        }
      }
    }

    const key = findMenuKey(menuItems.value, newPath)
    if (key) {
      selectedKeys.value = [key]
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background: #fff;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}

.sidebar-dark {
  background: #001529;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-dark .logo {
  border-bottom-color: #303030;
}

.logo img {
  width: 32px;
  height: 32px;
}

.logo-text {
  margin-left: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #1890ff;
}

.header {
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-dark {
  background: #141414;
  border-bottom: 1px solid #303030;
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-trigger {
  font-size: 18px;
  margin-right: 24px;
}

.breadcrumb {
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-action {
  margin-left: 8px;
}

.user-profile {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.username {
  margin: 0 8px;
}

.content {
  padding: 24px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
}

.content-wrapper {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-height: calc(100vh - 112px);
}

/* Dark theme adjustments */
[data-theme="dark"] .content {
  background: #000;
}

[data-theme="dark"] .content-wrapper {
  background: #141414;
  color: #fff;
}
</style> 