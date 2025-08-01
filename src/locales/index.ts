import { createI18n } from 'vue-i18n'

// Vietnamese translations
const vi = {
  common: {
    id: 'ID',
    search: 'Tìm kiếm',
    add: 'Thêm mới',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    save: 'Lưu',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    back: 'Quay lại',
    next: 'Tiếp theo',
    previous: 'Trước',
    loading: 'Đang tải...',
    noData: 'Không có dữ liệu',
    error: 'Có lỗi xảy ra',
    success: 'Thành công',
    warning: 'Cảnh báo',
    info: 'Thông tin',
    actions: 'Hành động',
    status: 'Trạng thái',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật'
  },
  menu: {
    dashboard: 'Trang chủ',
    patientManagement: 'Quản lý bệnh nhân',
    medicalCategories: 'Danh mục khám/xét nghiệm',
    medicalCases: 'Ca bệnh',
    testManagement: 'Quản lý kiểm tra',
    testExecutions: 'Kiểm tra thực hiện',
    userManagement: 'Quản lý người dùng',
    userList: 'Danh sách người dùng',
    userPermissions: 'Phân quyền'
  },
  auth: {
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    email: 'Email',
    password: 'Mật khẩu',
    loginWithGoogle: 'Đăng nhập với Google',
    welcomeBack: 'Chào mừng bạn quay lại',
    loginDescription: 'Vui lòng đăng nhập để tiếp tục',
    username: 'Tên đăng nhập'
  },
  dashboard: {
    title: 'Trang chủ',
    totalUsers: 'Tổng số người dùng',
    activeUsers: 'Người dùng đang hoạt động',
    monthlyTests: 'Lượt làm bài trong tháng',
    newUsers: 'Người dùng mới'
  },
  patient: {
    categories: {
      title: 'Danh mục khám/xét nghiệm',
      clinicalExamination: 'Khám lâm sàng',
      paraclinicalTest: 'Xét nghiệm cận lâm sàng',
      type: 'Loại',
      name: 'Tên danh mục',
      description: 'Mô tả'
    },
    cases: {
      title: 'Quản lý ca bệnh',
      patientName: 'Tên bệnh nhân',
      language: 'Ngôn ngữ',
      category: 'Danh mục',
      symptoms: 'Triệu chứng',
      diagnosis: 'Chẩn đoán',
      treatment: 'Điều trị',
      viewDetail: 'Xem chi tiết',
      requestCount: 'Lượt TH',
      create: 'Tạo ca bệnh'
    }
  }
}

// English translations
const en = {
  common: {
    search: 'Search',
    add: 'Add new',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    loading: 'Loading...',
    noData: 'No data',
    error: 'An error occurred',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    actions: 'Actions',
    status: 'Status',
    createdAt: 'Created at',
    updatedAt: 'Updated at'
  },
  menu: {
    dashboard: 'Dashboard',
    patientManagement: 'Patient Management',
    medicalCategories: 'Medical Categories',
    medicalCases: 'Medical Cases',
    testManagement: 'Test Management',
    testExecutions: 'Test Executions',
    userManagement: 'User Management',
    userList: 'User List',
    userPermissions: 'User Permissions'
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    loginWithGoogle: 'Login with Google',
    welcomeBack: 'Welcome back',
    loginDescription: 'Please login to continue'
  },
  dashboard: {
    title: 'Dashboard',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    monthlyTests: 'Monthly Tests',
    newUsers: 'New Users'
  },
  patient: {
    categories: {
      title: 'Medical Categories',
      clinicalExamination: 'Clinical Examination',
      paraclinicalTest: 'Paraclinical Test',
      type: 'Type',
      name: 'Category name',
      description: 'Description'
    },
    cases: {
      title: 'Medical Cases',
      patientName: 'Patient name',
      category: 'Category',
      symptoms: 'Symptoms',
      diagnosis: 'Diagnosis',
      treatment: 'Treatment',
      viewDetail: 'View detail',
      requestCount: 'Request Count',
      create: 'Create case'
    }
  }
}

const i18n = createI18n({
  legacy: false, // Enable Composition API mode
  locale: 'vi', // Default locale
  fallbackLocale: 'en',
  messages: {
    vi,
    en
  }
})

export default i18n 