<template>
  <div class="create-medical-case">
    <div class="page-header">
      <h1>{{ $t('patient.cases.create') }}</h1>
      <p>Tạo mới ca bệnh</p>
    </div>

    <a-steps :current="currentStep" style="margin-bottom: 24px">
      <a-step title="Thông tin bệnh ca bệnh" />
      <a-step title="Thông tin khám / xét nghiệm / chẩn đoán" />
    </a-steps>

    <!-- Step 1: Patient Profiles -->
    <a-card v-if="currentStep === 0">
      <a-form ref="patientFormRef" :model="patientForm" :rules="patientFormRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="name" label="Tên ca bệnh" required>
              <a-input v-model:value="patientForm.name" placeholder="Nhập tên ca bệnh" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="language" label="Ngôn ngữ" required>
              <a-select v-model:value="patientForm.language">
                <a-select-option value="vi">Tiếng Việt</a-select-option>
                <a-select-option value="en">Tiếng Anh</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="gender" label="Giới tính" required>
              <a-select v-model:value="patientForm.gender">
                <a-select-option value="MALE">Nam</a-select-option>
                <a-select-option value="FEMALE">Nữ</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="age" label="Tuổi" required>
              <a-input-number v-model:value="patientForm.age" :min="0" :max="150" placeholder="60" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="occupation" label="Nghề nghiệp">
              <a-input v-model:value="patientForm.occupation" placeholder="Nhập nghề nghiệp" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="reasonForVisit" label="Lý do khám">
          <a-textarea v-model:value="patientForm.reasonForVisit" :rows="3" placeholder="Nhập lý do khám" />
        </a-form-item>

        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item name="medicalHistory" label="Tiền sử bệnh">
              <a-textarea v-model:value="patientForm.medicalHistory" :rows="3" placeholder="Nhập tiền sử bệnh" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="dentalHistory" label="Tiền sử răng miệng">
              <a-textarea v-model:value="patientForm.dentalHistory" :rows="3" placeholder="Nhập tiền sử răng miệng" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item name="clinicalHistory" label="Tiền sử lâm sàng">
              <a-textarea v-model:value="patientForm.clinicalHistory" :rows="3" placeholder="Nhập tiền sử lâm sàng" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSubmitPatient" :loading="submitting">
              Tiếp tục
            </a-button>
            <a-button @click="handleCancel">Hủy</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- Step 2: Examination Information -->
    <div v-else class="examination-container">
      <a-form ref="examinationFormRef" :model="examinationForm" layout="vertical">
        <!-- Clinical Results -->
        <a-card class="section-card">
          <template #title>
            <div class="section-title">
              <ExperimentOutlined class="section-icon" />
              <span>Khám lâm sàng</span>
            </div>
          </template>
          <template #extra>
            <a-button type="primary" size="small" @click="addClinicalResult">
              <PlusOutlined />
              Thêm mục khám
            </a-button>
          </template>

          <div v-if="examinationForm.clinicalRs.length === 0" class="empty-section">
            <p>Chưa có mục khám lâm sàng nào. Nhấn "Thêm mục khám" để bắt đầu.</p>
          </div>

          <div v-for="(result, index) in examinationForm.clinicalRs" :key="index" class="result-item">
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item :name="['clinicalRs', index, 'cateId']" label="Mục khám">
                  <a-select v-model:value="result.cateId" placeholder="Chọn mục khám">
                    <a-select-option v-for="cat in clinicalCategories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="14">
                <a-form-item :name="['clinicalRs', index, 'textResult']" label="Kết quả">
                  <a-input v-model:value="result.textResult" placeholder="Nhập kết quả khám" />
                </a-form-item>
              </a-col>
              <a-col :span="2">
                <a-form-item label=" ">
                  <a-button type="text" danger @click="removeClinicalResult(index)">
                    <DeleteOutlined />
                  </a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </a-card>

        <!-- Paraclinical Results -->
        <a-card class="section-card">
          <template #title>
            <div class="section-title">
              <MedicineBoxOutlined class="section-icon" />
              <span>Khám cận lâm sàng</span>
            </div>
          </template>
          <template #extra>
            <a-button type="primary" size="small" @click="addParaclinicalResult">
              <PlusOutlined />
              Thêm mục khám
            </a-button>
          </template>

          <div v-if="examinationForm.paraclinicalRs.length === 0" class="empty-section">
            <p>Chưa có mục khám cận lâm sàng nào. Nhấn "Thêm mục khám" để bắt đầu.</p>
          </div>

          <div v-for="(result, index) in examinationForm.paraclinicalRs" :key="index" class="result-item">
            <a-row :gutter="16">
              <a-col :span="7">
                <a-form-item :name="['paraclinicalRs', index, 'cateId']" label="Mục khám">
                  <a-select v-model:value="result.cateId" placeholder="Chọn mục khám">
                    <a-select-option v-for="cat in paraclinicalCategories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :name="['paraclinicalRs', index, 'textResult']" label="Kết quả">
                  <a-input v-model:value="result.textResult" placeholder="Nhập kết quả khám" />
                </a-form-item>
              </a-col>
              <a-col :span="3">
                <a-form-item :name="['paraclinicalRs', index, 'score']" label="Tính điểm">
                  <a-checkbox v-model:checked="result.score">
                    Có
                  </a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="2">
                <a-form-item label=" ">
                  <a-button type="text" danger @click="removeParaclinicalResult(index)">
                    <DeleteOutlined />
                  </a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </a-card>

        <!-- Differential Diagnosis -->
        <a-card class="section-card">
          <template #title>
            <div class="section-title">
              <HeartOutlined class="section-icon" />
              <span>Chẩn đoán phân biệt</span>
            </div>
          </template>
          <template #extra>
            <a-button type="primary" size="small" @click="addDiffDiagnosis">
              <PlusOutlined />
              Thêm chẩn đoán
            </a-button>
          </template>

          <div v-if="examinationForm.diffDiagnosis.length === 0" class="empty-section">
            <p>Chưa có chẩn đoán phân biệt nào. Nhấn "Thêm chẩn đoán" để bắt đầu.</p>
          </div>

          <div v-for="(diagnosis, index) in examinationForm.diffDiagnosis" :key="index" class="diagnosis-item">
            <a-row :gutter="16">
              <a-col :span="19">
                <a-form-item :name="['diffDiagnosis', index, 'name']" label="Chẩn đoán">
                  <a-input v-model:value="diagnosis.name" placeholder="Nhập chẩn đoán phân biệt" />
                </a-form-item>
              </a-col>
              <a-col :span="3">
                <a-form-item :name="['diffDiagnosis', index, 'score']" label="Tính điểm">
                  <a-checkbox v-model:checked="diagnosis.score">
                    Có
                  </a-checkbox>
                </a-form-item>
              </a-col>
              <a-col :span="2">
                <a-form-item label=" ">
                  <a-button type="text" danger @click="removeDiffDiagnosis(index)">
                    <DeleteOutlined />
                  </a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </div>
        </a-card>

        <!-- Final Diagnosis & Treatment -->
        <a-card class="section-card">
          <template #title>
            <div class="section-title">
              <FileTextOutlined class="section-icon" />
              <span>Chẩn đoán & Điều trị</span>
            </div>
          </template>

          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item name="finalDiagnosis" label="Chẩn đoán cuối cùng">
                <a-textarea v-model:value="examinationForm.finalDiagnosis" :rows="3" :maxlength="250" show-count
                  placeholder="Nhập chẩn đoán cuối cùng" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item name="treatment" label="Điều trị">
                <a-textarea v-model:value="examinationForm.treatment" :rows="3" :maxlength="250" show-count
                  placeholder="Nhập phương pháp điều trị" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>

        <!-- Instruction -->
        <a-card class="section-card">
          <template #title>
            <div class="section-title">
              <EditOutlined class="section-icon" />
              <span>Hướng dẫn</span>
            </div>
          </template>

          <a-form-item name="instruction">
            <RichTextEditor v-model="examinationForm.instruction" placeholder="Nhập hướng dẫn chi tiết..." />
          </a-form-item>
        </a-card>

        <!-- AI Context -->
        <a-card class="section-card ai-context-card">
          <template #title>
            <div class="section-title">
              <RobotOutlined class="section-icon" />
              <span>Nội dung AI</span>
            </div>
          </template>

          <a-form-item name="aiContext">
            <a-textarea v-model:value="examinationForm.aiContext" :rows="6" :maxlength="2500" show-count
              placeholder="Nhập nội dung AI (không bắt buộc)" />
          </a-form-item>
        </a-card>

        <!-- Form Actions -->
        <div class="form-actions">
          <a-space size="large">
            <a-button size="large" @click="handleCancel">
              Hủy
            </a-button>
            <a-button type="primary" size="large" @click="handleSubmitExamination" :loading="submitting">
              <FileTextOutlined />
              Hoàn thành
            </a-button>
          </a-space>
        </div>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { APIClient } from '@/api'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import type { CreatePatientRequest, ExaminationRequest } from '@/types'
import {
  DeleteOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  RobotOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Initialize step and patientId from URL params
const currentStep = ref(0)
const patientId = ref<number | null>(null)
const submitting = ref(false)

// Initialize from URL parameters
const initializeFromUrl = () => {
  const stepParam = route.query.step as string
  const patientIdParam = route.query.patientId as string

  if (stepParam) {
    const step = parseInt(stepParam.replace('step_', '')) - 1
    if (step >= 0 && step <= 1) {
      currentStep.value = step
    }
  }

  if (patientIdParam) {
    patientId.value = parseInt(patientIdParam)
  }
}

// Update URL when step or patientId changes
const updateUrl = () => {
  const query: any = {}

  if (currentStep.value > 0) {
    query.step = `step_${currentStep.value + 1}`
  }

  if (patientId.value) {
    query.patientId = patientId.value.toString()
  }

  const currentQuery = route.query
  if (JSON.stringify(currentQuery) !== JSON.stringify(query)) {
    router.replace({
      path: route.path,
      query
    })
  }
}

watch([currentStep, patientId], () => {
  updateUrl()
})

watch(() => route.query, () => {
  initializeFromUrl()
})

// Form
const patientForm = reactive<CreatePatientRequest>({
  language: 'vi',
  name: '',
  gender: 'MALE',
  age: null as number | null,
  occupation: '',
  reasonForVisit: '',
  medicalHistory: '',
  dentalHistory: '',
  clinicalHistory: ''
})

// Form validation rules
const patientFormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên ca bệnh', trigger: 'blur' }],
  language: [{ required: true, message: 'Vui lòng chọn ngôn ngữ', trigger: 'change' }],
  gender: [{ required: true, message: 'Vui lòng chọn giới tính', trigger: 'change' }],
  age: [{ required: true, message: 'Vui lòng nhập tuổi', trigger: 'change' }]
}

// Form refs
const patientFormRef = ref()

// Examination form
const examinationForm = reactive<ExaminationRequest>({
  clinicalRs: [],
  paraclinicalRs: [],
  diffDiagnosis: [],
  finalDiagnosis: '',
  treatment: '',
  instruction: '',
  aiContext: ''
})


// Clinical Categories
const clinicalCategories = ref<any[]>([])
const loadClinicalCategories = async () => {
  try {
    const response = await APIClient.getClinicalCategories()
    clinicalCategories.value = response.data.data.items
    if (clinicalCategories.value.length > 0) {
      examinationForm.clinicalRs.forEach(result => {
        if (!result.cateId) {
          result.cateId = clinicalCategories.value[0].id
        }
      })
    }
  } catch (error) {
    console.error('Error loading clinical categories:', error)
  }
}

// Paraclinical Categories
const paraclinicalCategories = ref<any[]>([])
const loadParaclinicalCategories = async () => {
  try {
    const response = await APIClient.getParaclinicalCategories()
    paraclinicalCategories.value = response.data.data.items
    // Auto select first category for new paraclinical results
    if (paraclinicalCategories.value.length > 0) {
      examinationForm.paraclinicalRs.forEach(result => {
        if (!result.cateId) {
          result.cateId = paraclinicalCategories.value[0].id
        }
      })
    }
  } catch (error) {
    console.error('Error loading paraclinical categories:', error)
    message.error('Lỗi khi tải danh sách khám cận lâm sàng')
  }
}
const addClinicalResult = () => {
  const newResult = {
    textResult: '',
    cateId: clinicalCategories.value.length > 0 ? clinicalCategories.value[0].id : 0,
    imageIds: [] // This property is no longer needed
  }
  examinationForm.clinicalRs.push(newResult)
}

const removeClinicalResult = (index: number) => {
  examinationForm.clinicalRs.splice(index, 1)
}

// Paraclinical Results
const addParaclinicalResult = () => {
  const newResult = {
    cateId: paraclinicalCategories.value.length > 0 ? paraclinicalCategories.value[0].id : 0,
    textResult: '',
    score: false,
    imageIds: [] // This property is no longer needed
  }
  examinationForm.paraclinicalRs.push(newResult)
}

const removeParaclinicalResult = (index: number) => {
  examinationForm.paraclinicalRs.splice(index, 1)
}

// Differential Diagnosis
const addDiffDiagnosis = () => {
  examinationForm.diffDiagnosis.push({
    name: '',
    score: false
  })
}

const removeDiffDiagnosis = (index: number) => {
  examinationForm.diffDiagnosis.splice(index, 1)
}

// Form submission
const handleSubmitPatient = async () => {
  if (!patientFormRef.value) return

  try {
    // Validate form
    await patientFormRef.value.validate()

    submitting.value = true
    const response = await APIClient.createPatient(patientForm)
    patientId.value = response.data.data.patientId
    message.success('Tạo thông tin ca bệnh thành công')
    currentStep.value = 1
  } catch (error: any) {
    if (error?.errorFields) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc')
    } else {
      message.error('Lỗi khi tạo thông tin bệnh nhân')
    }
  } finally {
    submitting.value = false
  }
}

const handleSubmitExamination = async () => {
  try {
    submitting.value = true
    await APIClient.createPatientExamination(patientId.value!, examinationForm)
    router.push('/patient/cases')
  } catch (error) {
    console.error('Error creating examination:', error)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push('/patient/cases')
}

onMounted(() => {
  initializeFromUrl()
  loadClinicalCategories()
  loadParaclinicalCategories()
})
</script>

<style scoped>
.create-medical-case {
  padding: 24px;
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

.examination-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 24px 0;
}

.section-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.section-card:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.section-icon {
  font-size: 18px;
  color: #1890ff;
}

.empty-section {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  background: #fafafa;
  border-radius: 4px;
  border: 1px dashed #d9d9d9;
  margin: 16px 0;
}

.result-item {
  margin-bottom: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.result-item:last-child {
  margin-bottom: 0;
}

.diagnosis-item {
  margin-bottom: 20px;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.diagnosis-item:last-child {
  margin-bottom: 0;
}

.ai-context-card {
  background: linear-gradient(135deg, #f6f9fc 0%, #eef7ff 100%);
  border: 1px solid #91d5ff;
  margin-top: 32px;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding: 32px 24px;
  background: #fafafa;
  border-radius: 8px;
  margin-top: 40px;
  border: 1px solid #f0f0f0;
}

/* Add spacing for form items within cards */
.section-card :deep(.ant-form-item) {
  margin-bottom: 20px;
}

.section-card :deep(.ant-form-item:last-child) {
  margin-bottom: 0;
}

/* Special spacing for the diagnosis and treatment section */
.section-card :deep(.ant-row) {
  margin-bottom: 16px;
}

.section-card :deep(.ant-row:last-child) {
  margin-bottom: 0;
}
</style>