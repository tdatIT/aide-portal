<template>
  <div class="edit-medical-case">
    <div class="page-header">
      <h1>Cập nhật ca bệnh #{{ caseId }}</h1>
      <p>Chỉnh sửa thông tin chi tiết ca bệnh</p>
    </div>

    <a-spin :spinning="loading">
      <div v-if="caseData" class="edit-container">
        <a-tabs v-model:activeKey="activeTab" type="card" class="edit-tabs">
          <!-- Tab 1: Thông tin cơ bản -->
          <a-tab-pane key="profile" tab="Thông tin cơ bản">
            <a-card title="Thông tin ca bệnh" class="edit-card">
              <a-form ref="profileFormRef" :model="profileForm" :rules="profileFormRules" layout="vertical">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item name="name" label="Tên ca bệnh" required>
                      <a-input v-model:value="profileForm.name" placeholder="Nhập tên ca bệnh" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="6">
                    <a-form-item name="language" label="Ngôn ngữ" required>
                      <a-select v-model:value="profileForm.language">
                        <a-select-option value="vi">Tiếng Việt</a-select-option>
                        <a-select-option value="en">Tiếng Anh</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :span="6">
                    <a-form-item name="gender" label="Giới tính" required>
                      <a-select v-model:value="profileForm.gender">
                        <a-select-option value="MALE">Nam</a-select-option>
                        <a-select-option value="FEMALE">Nữ</a-select-option>
                        <a-select-option value="OTHER">Khác</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item name="age" label="Tuổi" required>
                      <a-input-number v-model:value="profileForm.age" :min="0" :max="150" placeholder="60"
                        style="width: 100%" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item name="occupation" label="Nghề nghiệp">
                      <a-input v-model:value="profileForm.occupation" placeholder="Nhập nghề nghiệp" />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-form-item name="reasonForVisit" label="Lý do khám">
                  <a-textarea v-model:value="profileForm.reasonForVisit" :rows="3" placeholder="Nhập lý do khám" />
                </a-form-item>

                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item name="medicalHistory" label="Tiền sử bệnh">
                      <a-textarea v-model:value="profileForm.medicalHistory" :rows="3"
                        placeholder="Nhập tiền sử bệnh" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item name="dentalHistory" label="Tiền sử răng miệng">
                      <a-textarea v-model:value="profileForm.dentalHistory" :rows="3"
                        placeholder="Nhập tiền sử răng miệng" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item name="clinicalHistory" label="Tiền sử lâm sàng">
                      <a-textarea v-model:value="profileForm.clinicalHistory" :rows="3"
                        placeholder="Nhập tiền sử lâm sàng" />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-form-item name="aiContext" label="Nội dung AI">
                  <a-textarea v-model:value="profileForm.aiContext" :rows="3" placeholder="Nhập nội dung AI" />
                </a-form-item>

                <a-form-item name="instruction" label="Hướng dẫn">
                  <RichTextEditor v-model="profileForm.instruction" placeholder="Nhập hướng dẫn chi tiết..." />
                </a-form-item>

                <a-form-item label="Hình ảnh minh họa">
                  <ImageUploader ref="profileImageUploader" v-model="profileForm.imageIds" :max-files="5" />
                </a-form-item>

                <a-form-item>
                  <a-space>
                    <a-button type="primary" @click="handleUpdateProfile" :loading="submitting">
                      Cập nhật thông tin
                    </a-button>
                    <a-button @click="handleCancel">Hủy</a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </a-card>
          </a-tab-pane>

          <!-- Tab 2: Khám lâm sàng -->
          <a-tab-pane key="clinical" tab="Khám lâm sàng">
            <a-card title="Kết quả khám lâm sàng" class="edit-card">
              <template #extra>
                <a-button type="primary" size="small" @click="addClinicalResult">
                  <PlusOutlined />
                  Thêm mục khám
                </a-button>
              </template>

              <div v-if="clinicalResults.length === 0" class="empty-section">
                <p>Chưa có mục khám lâm sàng nào. Nhấn "Thêm mục khám" để bắt đầu.</p>
              </div>

              <div v-for="(result, index) in clinicalResults" :key="result.id || index" class="result-item">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item :name="['clinicalResults', index, 'clinicalCateId']" label="Mục khám">
                      <a-input :value="getClinicalCategoryName(result.clinicalCateId)" disabled />
                    </a-form-item>
                  </a-col>
                  <a-col :span="16">
                    <a-form-item :name="['clinicalResults', index, 'textResult']" label="Kết quả">
                      <a-input v-model:value="result.textResult" placeholder="Nhập kết quả khám" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col :span="24">
                    <a-form-item :name="['clinicalResults', index, 'imageIds']" label="Hình ảnh">
                      <ImageUploader :ref="(el) => { if (el) clinicalImageUploaders[index] = el }"
                        v-model="result.imageIds" :max-files="5" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <div class="result-footer">
                  <a-space>
                    <a-button type="primary" @click="saveClinicalResult(result, index)" :loading="result.saving">
                      <SaveOutlined />
                      Lưu
                    </a-button>
                    <a-button danger @click="removeClinicalResult(result, index)">
                      <DeleteOutlined />
                      Xóa
                    </a-button>
                  </a-space>
                </div>
              </div>
            </a-card>
          </a-tab-pane>

          <!-- Tab 3: Khám cận lâm sàng -->
          <a-tab-pane key="paraclinical" tab="Khám cận lâm sàng">
            <a-card title="Kết quả khám cận lâm sàng" class="edit-card">
              <template #extra>
                <a-button type="primary" size="small" @click="addParaclinicalResult">
                  <PlusOutlined />
                  Thêm mục khám
                </a-button>
              </template>

              <div v-if="paraclinicalResults.length === 0" class="empty-section">
                <p>Chưa có mục khám cận lâm sàng nào. Nhấn "Thêm mục khám" để bắt đầu.</p>
              </div>

              <div v-for="(result, index) in paraclinicalResults" :key="result.id || index" class="result-item">
                <a-row :gutter="16">
                  <a-col :span="8">
                    <a-form-item :name="['paraclinicalResults', index, 'paraClinicalCateId']" label="Mục khám">
                      <a-input :value="getParaclinicalCategoryName(result.paraClinicalCateId)" disabled />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item :name="['paraclinicalResults', index, 'textResult']" label="Kết quả">
                      <a-input v-model:value="result.textResult" placeholder="Nhập kết quả khám" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="4">
                    <a-form-item :name="['paraclinicalResults', index, 'score']" label="Tính điểm">
                      <a-checkbox v-model:checked="result.score">
                        Có
                      </a-checkbox>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row>
                  <a-col :span="24">
                    <a-form-item :name="['paraclinicalResults', index, 'imageIds']" label="Hình ảnh">
                      <ImageUploader :ref="(el) => { if (el) paraclinicalImageUploaders[index] = el }"
                        v-model="result.imageIds" :max-files="5" />
                    </a-form-item>
                  </a-col>
                </a-row>
                <div class="result-footer">
                  <a-space>
                    <a-button type="primary" @click="saveParaclinicalResult(result, index)" :loading="result.saving">
                      <SaveOutlined />
                      Lưu
                    </a-button>
                    <a-button danger @click="removeParaclinicalResult(result, index)">
                      <DeleteOutlined />
                      Xóa
                    </a-button>
                  </a-space>
                </div>
              </div>
            </a-card>
          </a-tab-pane>

          <!-- Tab 4: Chẩn đoán phân biệt -->
          <a-tab-pane key="differential" tab="Chẩn đoán phân biệt">
            <a-card title="Danh sách chẩn đoán phân biệt" class="edit-card">
              <template #extra>
                <a-button type="primary" size="small" @click="addDiffDiagnosis">
                  <PlusOutlined />
                  Thêm chẩn đoán
                </a-button>
              </template>

              <div v-if="diffDiagnoses.length === 0" class="empty-section">
                <p>Chưa có chẩn đoán phân biệt nào. Nhấn "Thêm chẩn đoán" để bắt đầu.</p>
              </div>

              <div v-for="(diagnosis, index) in diffDiagnoses" :key="diagnosis.id || index" class="result-item">
                <a-row :gutter="16">
                  <a-col :span="16">
                    <a-form-item :name="['diffDiagnoses', index, 'name']" label="Tên chẩn đoán">
                      <a-input v-model:value="diagnosis.name" placeholder="Nhập tên chẩn đoán phân biệt" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="8">
                    <a-form-item :name="['diffDiagnoses', index, 'score']" label="Tính điểm">
                      <a-checkbox v-model:checked="diagnosis.score">
                        Có
                      </a-checkbox>
                    </a-form-item>
                  </a-col>
                </a-row>
                <div class="result-footer">
                  <a-space>
                    <a-button type="primary" @click="saveDiffDiagnosis(diagnosis, index)" :loading="diagnosis.saving">
                      <SaveOutlined />
                      Lưu
                    </a-button>
                    <a-button danger @click="removeDiffDiagnosis(diagnosis, index)">
                      <DeleteOutlined />
                      Xóa
                    </a-button>
                  </a-space>
                </div>
              </div>
            </a-card>
          </a-tab-pane>

          <!-- Tab 5: Chẩn đoán -->
          <a-tab-pane key="diagnosis" tab="Chẩn đoán">
            <a-card title="Thông tin chẩn đoán" class="edit-card">
              <a-form ref="diagnosisFormRef" :model="diagnosisForm" layout="vertical">
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item name="finalDiagnosis" label="Chẩn đoán cuối cùng">
                      <a-textarea v-model:value="diagnosisForm.finalDiagnosis" :rows="3" :maxlength="250" show-count
                        placeholder="Nhập chẩn đoán cuối cùng" />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item name="treatment" label="Điều trị">
                      <a-textarea v-model:value="diagnosisForm.treatment" :rows="3" :maxlength="250" show-count
                        placeholder="Nhập phương pháp điều trị" />
                    </a-form-item>
                  </a-col>
                </a-row>

                <a-form-item>
                  <a-space>
                    <a-button type="primary" @click="handleUpdateDiagnosis" :loading="submitting">
                      Cập nhật chẩn đoán
                    </a-button>
                    <a-button @click="handleCancel">Hủy</a-button>
                  </a-space>
                </a-form-item>
              </a-form>
            </a-card>
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>

    <!-- Add Result Modal -->
    <a-modal
      v-model:open="showCategoryModal"
      :title="selectedCategoryType === 'clinical' ? 'Thêm kết quả khám lâm sàng' : 'Thêm kết quả khám cận lâm sàng'"
      @ok="handleCategorySelection"
      @cancel="handleCancelModal"
      :confirmLoading="modalSubmitting"
      width="800px"
    >
      <a-form ref="modalFormRef" :model="modalForm" :rules="modalFormRules" layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="categoryId" label="Mục khám" required>
              <a-select v-model:value="modalForm.categoryId" placeholder="Chọn danh mục khám">
                <a-select-option 
                  v-for="cat in selectedCategoryType === 'clinical' ? clinicalCategories : paraclinicalCategories" 
                  :key="cat.id" 
                  :value="cat.id"
                >
                  {{ cat.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="selectedCategoryType === 'paraclinical'">
            <a-form-item name="score" label="Tính điểm">
              <a-checkbox v-model:checked="modalForm.score">
                Có
              </a-checkbox>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="textResult" label="Kết quả">
          <a-textarea 
            v-model:value="modalForm.textResult" 
            :rows="4" 
            placeholder="Nhập kết quả khám"
            :maxlength="500"
            show-count
          />
        </a-form-item>

        <a-form-item label="Hình ảnh">
          <ImageUploader 
            ref="modalImageUploader" 
            v-model="modalForm.imageIds" 
            :max-files="5" 
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { APIClient } from '@/api'
import ImageUploader from '@/components/ui/ImageUploader.vue'
import RichTextEditor from '@/components/ui/RichTextEditor.vue'
import type { PatientDetail } from '@/types'
import {
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const caseData = ref<PatientDetail | null>(null)
const caseId = ref<string>('')
const activeTab = ref('profile')

// Modal state for category selection
const showCategoryModal = ref(false)
const selectedCategoryType = ref<'clinical' | 'paraclinical'>('clinical')
const modalSubmitting = ref(false)
const modalFormRef = ref()
const modalImageUploader = ref()

// Modal form
const modalForm = reactive({
  categoryId: 0,
  textResult: '',
  score: false,
  imageIds: [] as number[]
})

// Modal form validation rules
const modalFormRules = {
  categoryId: [{ required: true, message: 'Vui lòng chọn danh mục khám', trigger: 'change' }],
}

// Form refs
const profileFormRef = ref()
const diagnosisFormRef = ref()
const profileImageUploader = ref()
const clinicalImageUploaders = ref<any[]>([])
const paraclinicalImageUploaders = ref<any[]>([])

// Categories
const clinicalCategories = ref<any[]>([])
const paraclinicalCategories = ref<any[]>([])

// Profile form
const profileForm = reactive({
  name: '',
  language: 'vi',
  gender: 'MALE',
  age: 50,
  occupation: '',
  reasonForVisit: '',
  medicalHistory: '',
  dentalHistory: '',
  clinicalHistory: '',
  aiContext: '',
  instruction: '',
  imageIds: [] as number[]
})

// Diagnosis form
const diagnosisForm = reactive({
  finalDiagnosis: '',
  treatment: ''
})

// Clinical results
const clinicalResults = ref<any[]>([])

// Paraclinical results
const paraclinicalResults = ref<any[]>([])

// Differential diagnoses
const diffDiagnoses = ref<any[]>([])

// Form validation rules
const profileFormRules = {
  name: [{ required: true, message: 'Vui lòng nhập tên ca bệnh', trigger: 'blur' }],
  language: [{ required: true, message: 'Vui lòng chọn ngôn ngữ', trigger: 'change' }],
  gender: [{ required: true, message: 'Vui lòng chọn giới tính', trigger: 'change' }],
  age: [{ required: true, message: 'Vui lòng nhập tuổi', trigger: 'change' }]
}

// Methods
const fetchCaseDetail = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    caseId.value = id
    const response = await APIClient.getPatient(id)
    caseData.value = response.data.data
    // Populate profile form
    Object.assign(profileForm, {
      name: caseData.value.name,
      language: caseData.value.language,
      gender: caseData.value.gender,
      age: caseData.value.age,
      occupation: caseData.value.occupation,
      reasonForVisit: caseData.value.reasonForVisit,
      medicalHistory: caseData.value.medicalHistory,
      dentalHistory: caseData.value.dentalHistory,
      clinicalHistory: caseData.value.clinicalHistory,
      aiContext: caseData.value.aiContext,
      instruction: caseData.value.instruction,
      imageIds: caseData.value.images?.map(img => img.id) || []
    })

    // Populate clinical results
    clinicalResults.value = caseData.value.clinicalResult?.map(result => ({
      id: result.id,
      clinicalCateId: result.clinicalCateId,
      textResult: result.textResult,
      imageIds: result.images?.map(img => img.id) || [],
      images: result.images || [], // Keep original images for ImageUploader
      saving: false
    }))
    clinicalImageUploaders.value = []

    // Populate paraclinical results
    paraclinicalResults.value = caseData.value.paraclinicalResult?.map(result => ({
      id: result.id,
      paraClinicalCateId: result.paraclinicalCateId,
      textResult: result.textResult,
      score: result.score,
      imageIds: result.images?.map(img => img.id) || [],
      images: result.images || [], // Keep original images for ImageUploader
      saving: false
    }))
    paraclinicalImageUploaders.value = []

    // Populate differential diagnoses
    diffDiagnoses.value = caseData.value.diffDiagnosis?.map((diagnosis: any) => ({
      id: diagnosis.id,
      name: diagnosis.name,
      score: diagnosis.score,
      saving: false
    })) || []

    // Set existing images for ImageUploader after data is populated
    setTimeout(() => {
      // Set existing images for profile ImageUploader
      if (profileImageUploader.value && caseData.value) {
        profileImageUploader.value.clearExistingImages()
        profileImageUploader.value.setExistingImages(caseData.value.images)
      }

      // Set existing images for clinical results
      clinicalResults.value.forEach((result, index) => {
        const uploader = clinicalImageUploaders.value[index]
        if (uploader && result.images && result.images.length > 0) {
          uploader.clearExistingImages()
          uploader.setExistingImages(result.images)
        }
      })

      // Set existing images for paraclinical results
      paraclinicalResults.value.forEach((result, index) => {
        const uploader = paraclinicalImageUploaders.value[index]
        if (uploader && result.images && result.images.length > 0) {
          uploader.clearExistingImages()
          uploader.setExistingImages(result.images)
        }
      })
    }, 500) // Increased delay to ensure all components are mounted

    // Populate diagnosis form
    Object.assign(diagnosisForm, {
      finalDiagnosis: caseData.value.finalDiagnosis?.name || '',
      treatment: caseData.value.treatment?.treatmentNotes || ''
    })

  } catch (error) {
    console.error('Error fetching case detail:', error)
    message.error('Lỗi khi tải thông tin ca bệnh')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const [clinicalResponse, paraclinicalResponse] = await Promise.all([
      APIClient.getClinicalCategories(),
      APIClient.getParaclinicalCategories()
    ])

    clinicalCategories.value = clinicalResponse.data.data.items
    paraclinicalCategories.value = paraclinicalResponse.data.data.items
  } catch (error) {
    console.error('Error loading categories:', error)
    message.error('Lỗi khi tải danh sách danh mục')
  }
}

// Profile update
const handleUpdateProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
    submitting.value = true

    await APIClient.updatePatientProfile(caseId.value, profileForm)
    message.success('Cập nhật thông tin thành công')
    
    // Clear uploaded images before refresh to prevent duplicates
    clearAllUploadedImages()
    // Refresh entire page
    await refreshPage()
  } catch (error: any) {
    if (error?.errorFields) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc')
    } else {
      message.error('Lỗi khi cập nhật thông tin')
    }
  } finally {
    submitting.value = false
  }
}

// Method to refresh existing images for all uploaders
const refreshExistingImages = () => {
  setTimeout(() => {
    // Refresh profile images
    if (profileImageUploader.value && caseData.value) {
      profileImageUploader.value.clearExistingImages()
      profileImageUploader.value.setExistingImages(caseData.value.images)
    }

    // Refresh clinical results images
    clinicalResults.value.forEach((result, index) => {
      const uploader = clinicalImageUploaders.value[index]
      if (uploader && result.images && result.images.length > 0) {
        uploader.clearExistingImages()
        uploader.setExistingImages(result.images)
      }
    })

    // Refresh paraclinical results images
    paraclinicalResults.value.forEach((result, index) => {
      const uploader = paraclinicalImageUploaders.value[index]
      if (uploader && result.images && result.images.length > 0) {
        uploader.clearExistingImages()
        uploader.setExistingImages(result.images)
      }
    })
  }, 100)
}

// Method to clear all uploaded images from ImageUploaders
const clearAllUploadedImages = () => {
  // Clear profile uploader
  if (profileImageUploader.value) {
    profileImageUploader.value.clearUploadedImages()
  }

  // Clear clinical results uploaders
  clinicalImageUploaders.value.forEach(uploader => {
    if (uploader) {
      uploader.clearUploadedImages()
    }
  })

  // Clear paraclinical results uploaders
  paraclinicalImageUploaders.value.forEach(uploader => {
    if (uploader) {
      uploader.clearUploadedImages()
    }
  })
}

// Method to refresh images when tab changes
const refreshImagesOnTabChange = () => {
  setTimeout(() => {
    if (activeTab.value === 'clinical') {
      // Refresh clinical results images
      clinicalResults.value.forEach((result, index) => {
        const uploader = clinicalImageUploaders.value[index]
        if (uploader && result.images && result.images.length > 0) {
          uploader.clearExistingImages()
          uploader.setExistingImages(result.images)
        }
      })
    } else if (activeTab.value === 'paraclinical') {
      // Refresh paraclinical results images
      paraclinicalResults.value.forEach((result, index) => {
        const uploader = paraclinicalImageUploaders.value[index]
        if (uploader && result.images && result.images.length > 0) {
          uploader.clearExistingImages()
          uploader.setExistingImages(result.images)
        }
      })
    }
  }, 300) // Increased delay to ensure components are mounted
}

// Clinical results
const addClinicalResult = () => {
  selectedCategoryType.value = 'clinical'
  resetModalForm()
  showCategoryModal.value = true
}

const saveClinicalResult = async (result: any, _index: number) => {
  try {
    result.saving = true
    
    if (result.id) {
      // Update existing
      await APIClient.updateClinicalResult(result.id.toString(), {
        clinicalCateId: result.clinicalCateId,
        textResult: result.textResult,
        imageIds: result.imageIds
      })
    } else {
      // Create new
      const response = await APIClient.createClinicalResult({
        patientId: parseInt(caseId.value),
        clinicalCateId: result.clinicalCateId,
        textResult: result.textResult,
        imageIds: result.imageIds
      })
      result.id = response.data.data.id
    }
    
    message.success('Lưu kết quả khám lâm sàng thành công')
    // Clear uploaded images before refresh to prevent duplicates
    clearAllUploadedImages()
    // Refresh entire page after successful save
    await refreshPage()
  } catch (error) {
    console.error('Error saving clinical result:', error)
    message.error('Lỗi khi lưu kết quả khám lâm sàng')
  } finally {
    result.saving = false
  }
}

const removeClinicalResult = async (result: any, index: number) => {
  if (!result.id) {
    clinicalResults.value.splice(index, 1)
    clinicalImageUploaders.value = []
    return
  }

  try {
    await APIClient.deleteClinicalResult(result.id.toString())
    message.success('Xóa kết quả khám lâm sàng thành công')
    // Refresh entire page after successful delete
    await refreshPage()
  } catch (error) {
    console.error('Error deleting clinical result:', error)
    message.error('Lỗi khi xóa kết quả khám lâm sàng')
  }
}

// Paraclinical results
const addParaclinicalResult = () => {
  selectedCategoryType.value = 'paraclinical'
  resetModalForm()
  showCategoryModal.value = true
}

const saveParaclinicalResult = async (result: any, _index: number) => {
  try {
    result.saving = true
    
    if (result.id) {
      // Update existing
      await APIClient.updateParaclinicalResult(result.id.toString(), {
        paraClinicalCateId: result.paraClinicalCateId,
        textResult: result.textResult,
        score: result.score,
        imageIds: result.imageIds
      })
    } else {
      // Create new
      const response = await APIClient.createParaclinicalResult({
        patientId: parseInt(caseId.value),
        paraClinicalCateId: result.paraClinicalCateId,
        textResult: result.textResult,
        score: result.score,
        imageIds: result.imageIds
      })
      result.id = response.data.data.id
    }
    
    message.success('Lưu kết quả khám cận lâm sàng thành công')
    // Clear uploaded images before refresh to prevent duplicates
    clearAllUploadedImages()
    // Refresh entire page after successful save
    await refreshPage()
  } catch (error) {
    console.error('Error saving paraclinical result:', error)
    message.error('Lỗi khi lưu kết quả khám cận lâm sàng')
  } finally {
    result.saving = false
  }
}

const removeParaclinicalResult = async (result: any, index: number) => {
  if (!result.id) {
    paraclinicalResults.value.splice(index, 1)
    paraclinicalImageUploaders.value = []
    return
  }

  try {
    await APIClient.deleteParaclinicalResult(result.id.toString())
    message.success('Xóa kết quả khám cận lâm sàng thành công')
    // Refresh entire page after successful delete
    await refreshPage()
  } catch (error) {
    console.error('Error deleting paraclinical result:', error)
    message.error('Lỗi khi xóa kết quả khám cận lâm sàng')
  }
}

// Differential diagnosis methods
const addDiffDiagnosis = () => {
  diffDiagnoses.value.push({
    id: null,
    name: '',
    score: false,
    saving: false
  })
}

const saveDiffDiagnosis = async (diagnosis: any, _index: number) => {
  try {
    diagnosis.saving = true
    
    if (diagnosis.id) {
      // Update existing
      await APIClient.updateDiffDiagnosis(diagnosis.id.toString(), {
        name: diagnosis.name,
        score: diagnosis.score
      })
    } else {
      // Create new
      const response = await APIClient.createDiffDiagnosis({
        name: diagnosis.name,
        score: diagnosis.score,
        patientId: parseInt(caseId.value)
      })
      diagnosis.id = response.data.data.id
    }
    
    message.success('Lưu chẩn đoán phân biệt thành công')
    // Refresh entire page after successful save
    await refreshPage()
  } catch (error) {
    console.error('Error saving differential diagnosis:', error)
    message.error('Lỗi khi lưu chẩn đoán phân biệt')
  } finally {
    diagnosis.saving = false
  }
}

const removeDiffDiagnosis = async (diagnosis: any, index: number) => {
  if (!diagnosis.id) {
    diffDiagnoses.value.splice(index, 1)
    return
  }

  try {
    await APIClient.deleteDiffDiagnosis(diagnosis.id.toString())
    message.success('Xóa chẩn đoán phân biệt thành công')
    // Refresh entire page after successful delete
    await refreshPage()
  } catch (error) {
    console.error('Error deleting differential diagnosis:', error)
    message.error('Lỗi khi xóa chẩn đoán phân biệt')
  }
}

// Diagnosis update
const handleUpdateDiagnosis = async () => {
  try {
    submitting.value = true
    await APIClient.updatePatientExamination(caseId.value, {
      finalDiagnosis: diagnosisForm.finalDiagnosis,
      treatment: diagnosisForm.treatment
    })
    message.success('Cập nhật chẩn đoán thành công')
    // Clear uploaded images before refresh to prevent duplicates
    clearAllUploadedImages()
    // Refresh entire page after successful update
    await refreshPage()
  } catch (error) {
    console.error('Error updating diagnosis:', error)
    message.error('Lỗi khi cập nhật chẩn đoán')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  router.push(`/patient/cases/${caseId.value}`)
}

// Method to refresh entire page
const refreshPage = async () => {
  try {
    loading.value = true
    // Fetch fresh data
    await fetchCaseDetail()
    // Reset all forms and states
    clinicalImageUploaders.value = []
    paraclinicalImageUploaders.value = []
    // Set existing images after a delay to ensure components are mounted
    setTimeout(() => {
      refreshExistingImages()
      // Also refresh images for current tab
      if (activeTab.value === 'clinical' || activeTab.value === 'paraclinical') {
        refreshImagesOnTabChange()
      }
    }, 500)
  } catch (error) {
    console.error('Error refreshing page:', error)
    message.error('Lỗi khi tải lại trang')
  } finally {
    loading.value = false
  }
}

// Helper methods to get category names
const getClinicalCategoryName = (categoryId: number) => {
  const category = clinicalCategories.value.find(cat => cat.id === categoryId)
  return category ? category.name : 'Không xác định'
}

const getParaclinicalCategoryName = (categoryId: number) => {
  const category = paraclinicalCategories.value.find(cat => cat.id === categoryId)
  return category ? category.name : 'Không xác định'
}

// Modal cancel handler
const handleCancelModal = () => {
  showCategoryModal.value = false
  resetModalForm()
}

// Reset modal form
const resetModalForm = () => {
  modalForm.categoryId = 0
  modalForm.textResult = ''
  modalForm.score = false
  modalForm.imageIds = []
  if (modalImageUploader.value) {
    modalImageUploader.value.clearExistingImages()
    modalImageUploader.value.clearUploadedImages()
  }
}

// Category selection modal
const handleCategorySelection = async () => {
  if (!modalFormRef.value) return

  try {
    await modalFormRef.value.validate()
    modalSubmitting.value = true

    if (selectedCategoryType.value === 'clinical') {
      // Create new clinical result
      await APIClient.createClinicalResult({
        patientId: parseInt(caseId.value),
        clinicalCateId: modalForm.categoryId,
        textResult: modalForm.textResult,
        imageIds: modalForm.imageIds
      })
      message.success('Thêm kết quả khám lâm sàng thành công')
    } else {
      // Create new paraclinical result
      await APIClient.createParaclinicalResult({
        patientId: parseInt(caseId.value),
        paraClinicalCateId: modalForm.categoryId,
        textResult: modalForm.textResult,
        score: modalForm.score,
        imageIds: modalForm.imageIds
      })
      message.success('Thêm kết quả khám cận lâm sàng thành công')
    }

    showCategoryModal.value = false
    resetModalForm()
    
    // Clear uploaded images before refresh to prevent duplicates
    clearAllUploadedImages()
    // Refresh entire page after successful creation
    await refreshPage()
  } catch (error: any) {
    if (error?.errorFields) {
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc')
    } else {
      console.error('Error creating result:', error)
      message.error('Lỗi khi thêm kết quả khám')
    }
  } finally {
    modalSubmitting.value = false
  }
}

// Watch for tab changes to refresh images
watch(activeTab, (newTab) => {
  if (newTab === 'clinical' || newTab === 'paraclinical') {
    refreshImagesOnTabChange()
  }
})

onMounted(() => {
  fetchCaseDetail()
  loadCategories()
})
</script>

<style scoped>
.edit-medical-case {
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

.edit-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.edit-tabs {
  padding: 24px;
}

.edit-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
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

.result-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-start;
  background: #fafafa;
  padding: 12px 16px;
  border-radius: 0 0 6px 6px;
  margin: 0 -20px -20px -20px;
}

/* Dark theme support */
[data-theme="dark"] .edit-container {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .edit-card {
  background: #1f1f1f;
  border-color: #434343;
}

[data-theme="dark"] .result-item {
  background: #262626;
  border-color: #434343;
}

[data-theme="dark"] .empty-section {
  background: #262626;
  border-color: #434343;
  color: #666;
}
</style>