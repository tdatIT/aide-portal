<template>
  <div class="medical-case-detail">
    <div class="page-header">
      <a-page-header :title="`Chi tiết ca bệnh #${caseData?.id || ''}`" @back="goBack">
        <template #extra>
          <a-space>
            <a-button @click="editCase">
              <template #icon>
                <EditOutlined />
              </template>
              Chỉnh sửa
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
          <a-card title="Thông tin ca bệnh" class="info-card">
            <div v-if="caseData" class="patient-details">
              <a-avatar :size="64" style="margin-bottom: 16px">
                {{ caseData.name.charAt(0) }}
              </a-avatar>
              <h3>{{ caseData.name }}</h3>
              <a-descriptions :column="1" size="small">
                <a-descriptions-item label="Tuổi">
                  {{ caseData.age }}
                </a-descriptions-item>
                <a-descriptions-item label="Giới tính">
                  {{ getGenderText(caseData.gender) }}
                </a-descriptions-item>
                <a-descriptions-item label="Nghề nghiệp">
                  {{ caseData.occupation }}
                </a-descriptions-item>
                <a-descriptions-item label="Ngôn ngữ">
                  <a-tag :color="caseData.language === 'vi' ? 'blue' : 'green'">
                    {{ caseData.language === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh' }}
                  </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="Lượt thực hiện">
                  {{ caseData.requestCount }}
                </a-descriptions-item>
              </a-descriptions>
            </div>
          </a-card>

          <!-- Images -->
          <a-card title="Hình ảnh" class="info-card" style="margin-top: 16px">
            <div v-if="caseData?.images?.length">
              <a-row :gutter="[8, 8]">
                <a-col :span="12" v-for="image in caseData.images" :key="image.id">
                  <a-image :width="100" :height="100" :src="image.url" style="object-fit: cover; border-radius: 4px;" />
                </a-col>
              </a-row>
            </div>
            <a-empty v-else description="Chưa có hình ảnh" />
          </a-card>
        </a-col>

        <!-- Case Details -->
        <a-col :xs="24" :lg="16">
          <a-card title="Chi tiết ca bệnh" class="detail-card">
            <a-tabs default-active-key="overview">
              <a-tab-pane key="overview" tab="Tổng quan">
                <a-descriptions :column="1" bordered>
                  <a-descriptions-item label="Lý do khám">
                    <p>{{ caseData?.reasonForVisit || 'N/A' }}</p>
                  </a-descriptions-item>
                  <a-descriptions-item label="Tiền sử bệnh">
                    <p>{{ caseData?.medicalHistory || 'N/A' }}</p>
                  </a-descriptions-item>
                  <a-descriptions-item label="Tiền sử răng miệng">
                    <p>{{ caseData?.dentalHistory || 'N/A' }}</p>
                  </a-descriptions-item>
                  <a-descriptions-item label="Tiền sử lâm sàng">
                    <p>{{ caseData?.clinicalHistory || 'N/A' }}</p>
                  </a-descriptions-item>
                  <a-descriptions-item label="AI Context">
                    <p>{{ caseData?.aiContext || 'N/A' }}</p>
                  </a-descriptions-item>
                  <a-descriptions-item label="Hướng dẫn">
                    <div v-html="caseData?.instruction || 'N/A'"></div>
                  </a-descriptions-item>
                </a-descriptions>
              </a-tab-pane>

              <a-tab-pane key="clinical" tab="Kết quả lâm sàng">
                <div v-if="caseData?.clinicalResult?.length">
                  <a-card v-for="result in caseData.clinicalResult" :key="result.id" type="inner"
                    :title="language === 'vi' ? result.testNameVi : result.testNameEn" size="small" style="margin-bottom: 16px;">
                    <p><strong>Kết quả:</strong> {{ result.textResult }}</p>
                    <p v-if="result.notes"><strong>Ghi chú:</strong> {{ result.notes }}</p>
                    <div v-if="result.images?.length" style="margin-top: 12px;">
                      <strong>Hình ảnh:</strong>
                      <a-row :gutter="[8, 8]" style="margin-top: 8px;">
                        <a-col :span="6" v-for="image in result.images" :key="image.id">
                          <a-image :width="80" :height="80" :src="image.url"
                            style="object-fit: cover; border-radius: 4px;" />
                        </a-col>
                      </a-row>
                    </div>
                  </a-card>
                </div>
                <a-empty v-else description="Chưa có kết quả lâm sàng" />
              </a-tab-pane>

              <a-tab-pane key="paraclinical" tab="Kết quả cận lâm sàng">
                <div v-if="caseData?.paraclinicalResult?.length">
                  <a-card v-for="result in caseData.paraclinicalResult" :key="result.id" type="inner"
                    :title="language === 'vi' ? result.testNameVi : result.testNameEn" size="small" style="margin-bottom: 16px;">
                    <p><strong>Kết quả:</strong> {{ result.textResult }}</p>
                    <p v-if="result.notes"><strong>Ghi chú:</strong> {{ result.notes }}</p>
                    <p><strong>Tính điểm:</strong>
                      <a-tag :color="result.score ? 'green' : 'red'">
                        {{ result.score ? 'Có' : 'Không' }}
                      </a-tag>
                    </p>
                    <div v-if="result.images?.length" style="margin-top: 12px;">
                      <strong>Hình ảnh:</strong>
                      <a-row :gutter="[8, 8]" style="margin-top: 8px;">
                        <a-col :span="6" v-for="image in result.images" :key="image.id">
                          <a-image :width="80" :height="80" :src="image.url"
                            style="object-fit: cover; border-radius: 4px;" />
                        </a-col>
                      </a-row>
                    </div>
                  </a-card>
                </div>
                <a-empty v-else description="Chưa có kết quả cận lâm sàng" />
              </a-tab-pane>

              <a-tab-pane key="diagnosis" tab="Chẩn đoán">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-card type="inner" title="Chẩn đoán cuối cùng" size="small">
                      <p v-if="caseData?.finalDiagnosis?.name">
                        {{ caseData.finalDiagnosis.name }}
                      </p>
                      <a-empty v-else description="Chưa có chẩn đoán cuối cùng" />
                    </a-card>
                  </a-col>
                  <a-col :span="12">
                    <a-card type="inner" title="Chẩn đoán phân biệt" size="small">
                      <div v-if="caseData?.diffDiagnosis?.length">
                        <div v-for="diagnosis in caseData.diffDiagnosis" :key="diagnosis.id"
                          style="margin-bottom: 8px;">
                          <a-space>
                            <span>{{ diagnosis.name }}</span>
                            <a-tag :color="diagnosis.score ? 'green' : 'orange'">
                              {{ diagnosis.score ? 'Tính điểm' : 'Không tính điểm' }}
                            </a-tag>
                          </a-space>
                        </div>
                      </div>
                      <a-empty v-else description="Chưa có chẩn đoán phân biệt" />
                    </a-card>
                  </a-col>
                </a-row>
              </a-tab-pane>

              <a-tab-pane key="treatment" tab="Điều trị">
                <a-card type="inner" title="Phương pháp điều trị" size="small">
                  <p v-if="caseData?.treatment?.treatmentNotes">
                    {{ caseData.treatment.treatmentNotes }}
                  </p>
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
                    <small v-if="caseData?.createdBy">Tạo bởi: {{ caseData.createdBy }}</small>
                  </a-timeline-item>
                  <a-timeline-item color="blue" v-if="caseData?.updatedAt !== caseData?.createdAt">
                    <template #dot>
                      <FileTextOutlined />
                    </template>
                    <p>Cập nhật ca bệnh</p>
                    <small>{{ formatDateTime(caseData?.updatedAt) }}</small>
                    <small v-if="caseData?.updatedBy">Cập nhật bởi: {{ caseData.updatedBy }}</small>
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
import { APIClient } from '@/api'
import type { PatientDetail } from '@/types'
import {
  CheckCircleOutlined,
  EditOutlined,
  FileTextOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const language = ref('vi')

// Reactive data
const loading = ref(false)
const caseData = ref<PatientDetail | null>(null)

// Methods
const fetchCaseDetail = async () => {
  try {
    loading.value = true
    const caseId = route.params.id as string
    const response = await APIClient.getPatient(caseId)
    caseData.value = response.data.data
    language.value = caseData.value.language
  } catch (error) {
    console.error('Error fetching case detail:', error)
    message.error('Lỗi khi tải thông tin ca bệnh')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (status?: string) => {
  const colors = {
    VISIBLE: 'green',
    HIDDEN: 'red'
  }
  return colors[status as keyof typeof colors] || 'default'
}

const getStatusText = (status?: string) => {
  const texts = {
    VISIBLE: 'Hiển thị',
    HIDDEN: 'Ẩn'
  }
  return texts[status as keyof typeof texts] || status
}

const getGenderText = (gender?: string) => {
  const texts = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
    OTHER: 'Khác'
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
  router.push(`/patient/cases/${route.params.id}/edit`)
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