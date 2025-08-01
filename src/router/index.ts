import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { hasRole, isTokenExpired, clearAuth } from '@/utils/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false, layout: 'blank' }
  },
  {
    path: '/',
    redirect: '/dashboard',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Dashboard', requiresAdmin: true }
      },
      // Patient Management routes
      {
        path: 'patient',
        name: 'PatientManagement',
        meta: { requiresAdmin: true },
        children: [
          {
            path: 'categories',
            name: 'MedicalCategories',
            component: () => import('@/views/patient/MedicalCategoriesView.vue'),
            meta: { title: 'Danh mục khám - Xét nghiệm', requiresAdmin: true }
          },
          {
            path: 'cases',
            name: 'MedicalCases',
            component: () => import('@/views/patient/MedicalCasesView.vue'),
            meta: { title: 'Quản lý ca bệnh', requiresAdmin: true }
          },
          {
            path: 'cases/create',
            name: 'CreateMedicalCase',
            component: () => import('@/views/patient/CreateMedicalCaseView.vue'),
            meta: { title: 'Tạo mới ca bệnh', requiresAdmin: true }
          },
          {
            path: 'cases/:id',
            name: 'MedicalCaseDetail',
            component: () => import('@/views/patient/MedicalCaseDetailView.vue'),
            meta: { title: 'Chi tiết ca bệnh', requiresAdmin: true }
          }
        ]
      },
      // Test Management routes
      {
        path: 'test',
        name: 'TestManagement',
        meta: { requiresAdmin: true },
        children: [
          {
            path: 'executions',
            name: 'TestExecutions',
            component: () => import('@/views/test/TestExecutionsView.vue'),
            meta: { title: 'Quản lý kiểm tra thực hiện', requiresAdmin: true }
          }
        ]
      },
      // User Management routes
      {
        path: 'user',
        name: 'UserManagement',
        meta: { requiresAdmin: true },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/user/UserListView.vue'),
            meta: { title: 'Quản lý người dùng', requiresAdmin: true }
          },
          {
            path: 'permissions',
            name: 'UserPermissions',
            component: () => import('@/views/user/UserPermissionsView.vue'),
            meta: { title: 'Phân quyền người dùng', requiresAdmin: true }
          }
        ]
      }
    ]
  },
  // Error pages
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403View.vue'),
    meta: { requiresAuth: false, layout: 'blank' }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404View.vue'),
    meta: { requiresAuth: false, layout: 'blank' }
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500View.vue'),
    meta: { requiresAuth: false, layout: 'blank' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication and authorization
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  
  // Check if route requires authentication
  if (to.meta.requiresAuth !== false) {
    // Not authenticated
    if (!token) {
      clearAuth()
      return next('/login')
    }

    // Token expired
    if (isTokenExpired(token)) {
      clearAuth()
      return next('/login')
    }

    // Check admin role if required
    if (to.meta.requiresAdmin && !hasRole('ROLE_ADMIN')) {
      return next('/403')
    }
  } else if (to.name === 'Login' && token && !isTokenExpired(token)) {
    // Redirect authenticated users away from login
    return next('/')
  }

  next()
})

export default router 