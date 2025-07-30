<template>
  <div class="medical-case-detail">
    <div class="page-header">
      <a-page-header
        :title="`Chi tiết ca bệnh #${caseData?.id || ''}`"
        @back="goBack"
      >
        <template #extra>
          <a-space>
            <a-button @click="editCase">
              <template #icon><EditOutlined /></template>
              Chỉnh sửa
            </a-button>
            <a-button type="primary" @click="printCase">
              <template #icon><PrinterOutlined /></template>
              In báo cáo
            </a-button>
          </a-space>
        </template>
        
        <template #tags>
          <a-tag :color="getStatusColor(caseData?.status)">
            {{ getStatusText(caseData?.status) }}
          </a-tag>
        </template>
        
        <a-descriptions :column="2" size="small">
          <a-descriptions-item label="Ngày tạo">
            {{ formatDate(caseData?.createdAt) }}
          </a-descriptions-item>
          <a-descriptions-item label="Cập nhật cuối">
            {{ formatDate(caseData?.updatedAt) }}
          </a-descriptions-item>
        </a-descriptions>
      </a-page-header>
    </div>

    <a-spin :spinning="loading">
      <a-row :gutter="24">
        <!-- Patient Information -->
        <a-col :xs="24" :lg="8">
          <a-card title="Thông tin bệnh nhân" class="info-card">
            <div v-if="caseData?.patient" class="patient-details">
              <a-avatar :size="64" style="margin-bottom: 16px">
                {{ caseData.patient.name.charAt(0) }}
              </a-avatar>
              <h3>{{ caseData.patient.name }}</h3>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="Email">
                  {{ caseData.patient.email }}
                </a-descriptions-item>
                <a-descriptions-item label="Điện thoại">
                  {{ caseData.patient.phone }}
                </a-descriptions-item>
                <a-descriptions-item label="Địa chỉ">
                  {{ caseData.patient.address }}
                </a-descriptions-item>
                <a-descriptions-item label="Ngày sinh">
                  {{ formatDate(caseData.patient.dateOfBirth) }}
                </a-descriptions-item>
                <a-descriptions-item label="Giới tính">
                  {{ getGenderText(caseData.patient.gender) }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </a-card>

          <!-- Medical Category -->
          <a-card title="Danh mục khám/xét nghiệm" class="info-card" style="margin-top: 16px">
            <div v-if="caseData?.category">
              <h4>{{ caseData.category.name }}</h4>
              <p>{{ caseData.category.description }}</p>
              <a-tag :color="caseData.category.type === 'examination' ? 'blue' : 'purple'">
                {{ caseData.category.type === 'examination' ? 'Khám bệnh' : 'Xét nghiệm' }}
              </a-tag>
            </div>
          </a-card>
        </a-col>

        <!-- Case Details -->
        <a-col :xs="24" :lg="16">
          <a-card title="Chi tiết ca bệnh" class="detail-card">
            <a-tabs default-active-key="overview">
              <a-tab-pane key="overview" tab="Tổng quan">
                <a-descriptions :column="1" bordered>
                  <a-descriptions-item label="Tiêu đề">
                    <h3>{{ caseData?.title }}</h3>
                  </a-descriptions-item>
                  <a-descriptions-item label="Mô tả">
                    <p>{{ caseData?.description }}</p>
                  </a-descriptions-item>
                  <a-descriptions-item label="Triệu chứng">
                    <a-space wrap>
                      <a-tag v-for="symptom in caseData?.symptoms" :key="symptom" color="blue">
                        {{ symptom }}
                      </a-tag>
                      <span v-if="!caseData?.symptoms?.length" class="text-muted">
                        Chưa có triệu chứng nào được ghi nhận
                      </span>
                    </a-space>
                  </a-descriptions-item>
                </a-descriptions>
              </a-tab-pane>

              <a-tab-pane key="diagnosis" tab="Chẩn đoán">
                <a-card type="inner" title="Chẩn đoán" size="small">
                  <p v-if="caseData?.diagnosis">{{ caseData.diagnosis }}</p>
                  <a-empty v-else description="Chưa có chẩn đoán" />
                </a-card>
              </a-tab-pane>

              <a-tab-pane key="treatment" tab="Điều trị">
                <a-card type="inner" title="Phương pháp điều trị" size="small">
                  <p v-if="caseData?.treatment">{{ caseData.treatment }}</p>
                  <a-empty v-else description="Chưa có phương pháp điều trị" />
                </a-card>
              </a-tab-pane>

              <a-tab-pane key="history" tab="Lịch sử">
                <a-timeline>
                  <a-timeline-item color="green">
                    <template #dot>
                      <CheckCircleOutlined />
                    </template>
                    <p>Ca bệnh được tạo</p>
                    <small>{{ formatDateTime(caseData?.createdAt) }}</small>
                  </a-timeline-item>
                  <a-timeline-item color="blue" v-if="caseData?.diagnosis">
                    <template #dot>
                      <FileTextOutlined />
                    </template>
                    <p>Cập nhật chẩn đoán</p>
                    <small>{{ formatDateTime(caseData?.updatedAt) }}</small>
                  </a-timeline-item>
                  <a-timeline-item color="purple" v-if="caseData?.treatment">
                    <template #dot>
                      <MedicineBoxOutlined />
                    </template>
                    <p>Cập nhật phương pháp điều trị</p>
                    <small>{{ formatDateTime(caseData?.updatedAt) }}</small>
                  </a-timeline-item>
                </a-timeline>
              </a-tab-pane>
            </a-tabs>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { APIClient } from '@/api'
import type { MedicalCase } from '@/types'
import {
  EditOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()

// Reactive data
const loading = ref(false)
const caseData = ref<MedicalCase | null>(null)

// Methods
const fetchCaseDetail = async () => {
  try {
    loading.value = true
    const caseId = route.params.id as string
    const response = await APIClient.getMedicalCase(caseId)
    caseData.value = response.data.data
  } catch (error) {
    console.error('Error fetching case detail:', error)
    // Set mock data for demo
    caseData.value = {
      id: route.params.id as string,
      patientId: '1',
      patient: {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0901234567',
        address: 'Số 123, Đường ABC, Quận 1, TP.HCM',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      categoryId: '1',
      category: {
        id: '1',
        name: 'Khám tim mạch',
        description: 'Khám và chẩn đoán các bệnh về tim mạch',
        type: 'examination',
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      title: 'Đau ngực, khó thở khi gắng sức',
      description: 'Bệnh nhân nam 34 tuổi đến khám với triệu chứng đau ngực và khó thở khi gắng sức. Triệu chứng xuất hiện từ 2 tuần nay, tăng dần về cường độ.',
      status: 'in_progress',
      symptoms: ['Đau ngực', 'Khó thở', 'Mệt mỏi', 'Hồi hộp'],
      diagnosis: 'Nghi ngờ bệnh mạch vành. Cần làm thêm xét nghiệm ECG và siêu âm tim để chẩn đoán chính xác.',
      treatment: 'Cho thuốc giãn mạch vành, hẹn tái khám sau 1 tuần. Khuyên bệnh nhân nghỉ ngơi, hạn chế gắng sức.',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:45:00Z'
    }
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status?: string) => {
  const colors = {
    pending: 'orange',
    in_progress: 'blue',
    completed: 'green',
    cancelled: 'red'
  }
  return colors[status as keyof typeof colors] || 'default'
}

const getStatusText = (status?: string) => {
  const texts = {
    pending: 'Chờ xử lý',
    in_progress: 'Đang điều trị',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return texts[status as keyof typeof texts] || status
}

const getGenderText = (gender?: string) => {
  const texts = {
    male: 'Nam',
    female: 'Nữ',
    other: 'Khác'
  }
  return texts[gender as keyof typeof texts] || gender
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('vi-VN')
}

const goBack = () => {
  router.push('/patient/cases')
}

const editCase = () => {
  message.info('Chức năng chỉnh sửa sẽ được triển khai')
}

const printCase = () => {
  window.print()
}

onMounted(() => {
  fetchCaseDetail()
})
</script>

<style scoped>
.medical-case-detail {
  padding: 0;
}

.page-header {
  margin-bottom: 24px;
}

.info-card,
.detail-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.patient-details {
  text-align: center;
}

.patient-details h3 {
  margin-bottom: 16px;
  color: #1890ff;
}

.text-muted {
  color: #999;
  font-style: italic;
}

[data-theme="dark"] .info-card,
[data-theme="dark"] .detail-card {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .patient-details h3 {
  color: #1890ff;
}

[data-theme="dark"] .text-muted {
  color: #666;
}

/* Print styles */
@media print {
  .page-header {
    display: none;
  }
  
  .info-card,
  .detail-card {
    box-shadow: none;
    border: 1px solid #ddd;
  }
}
</style> 