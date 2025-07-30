import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

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
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: 'Dashboard' }
      },
      // Patient Management routes
      {
        path: 'patient',
        name: 'PatientManagement',
        children: [
          {
            path: 'categories',
            name: 'MedicalCategories',
            component: () => import('@/views/patient/MedicalCategoriesView.vue'),
            meta: { title: 'Quản lý danh mục khám/xét nghiệm' }
          },
          {
            path: 'cases',
            name: 'MedicalCases',
            component: () => import('@/views/patient/MedicalCasesView.vue'),
            meta: { title: 'Quản lý ca bệnh' }
          },
          {
            path: 'cases/:id',
            name: 'MedicalCaseDetail',
            component: () => import('@/views/patient/MedicalCaseDetailView.vue'),
            meta: { title: 'Chi tiết ca bệnh' }
          }
        ]
      },
      // Test Management routes
      {
        path: 'test',
        name: 'TestManagement',
        children: [
          {
            path: 'executions',
            name: 'TestExecutions',
            component: () => import('@/views/test/TestExecutionsView.vue'),
            meta: { title: 'Quản lý kiểm tra thực hiện' }
          }
        ]
      },
      // User Management routes
      {
        path: 'user',
        name: 'UserManagement',
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/user/UserListView.vue'),
            meta: { title: 'Quản lý người dùng' }
          },
          {
            path: 'permissions',
            name: 'UserPermissions',
            component: () => import('@/views/user/UserPermissionsView.vue'),
            meta: { title: 'Phân quyền người dùng' }
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

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth_token') // Simple auth check
  
  if (to.meta.requiresAuth !== false && !isAuthenticated) {
    next('/login')
  } else if (to.name === 'Login' && isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router 