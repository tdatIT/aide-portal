<template>
  <div class="image-uploader">
    <div class="uploaded-images" v-if="totalImageCount > 0">
      <!-- Existing images -->
      <div v-for="(image, index) in (existingImages || [])" :key="`existing-${image.id}`" class="image-item">
        <div class="image-preview">
          <img :src="image.url" :alt="`Existing ${index + 1}`" />
          <div class="image-overlay">
            <a-button type="text" danger size="small" @click="removeExistingImage(image.id)">
              <DeleteOutlined />
            </a-button>
          </div>
        </div>
      </div>
      
      <!-- Newly uploaded images -->
      <div v-for="(image, index) in uploadedImages" :key="`uploaded-${image.id}`" class="image-item">
        <div class="image-preview">
          <img :src="image.publicUrl" :alt="`Upload ${index + 1}`" />
          <div class="image-overlay">
            <a-button type="text" danger size="small" @click="removeImage(index)">
              <DeleteOutlined />
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <a-upload
      :file-list="fileList"
      :before-upload="beforeUpload"
      @remove="removeFile"
      :show-upload-list="false"
      multiple
      accept="image/*"
      :disabled="totalImageCount >= maxFiles || uploading"
    >
      <a-button 
        :disabled="totalImageCount >= maxFiles || uploading" 
        :loading="uploading"
        type="dashed"
        style="width: 100%; height: 100px; display: flex; align-items: center; justify-content: center; flex-direction: column;"
      >
        <LoadingOutlined v-if="uploading" />
        <PlusOutlined v-else />
        <div style="margin-top: 8px">
          {{ uploading ? 'Đang tải lên...' : 'Tải ảnh' }}
        </div>
      </a-button>
    </a-upload>

    <div class="upload-hint">
      <p>Cho phép tải lên tối đa {{ maxFiles }} ảnh. Định dạng: JPG, PNG, GIF</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { APIClient } from '@/api'
import type { UploadedImage } from '@/types'
import { DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { ref, watch, computed } from 'vue'

interface Props {
  modelValue: number[]
  maxFiles?: number
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number[]): void
}

const props = withDefaults(defineProps<Props>(), {
  maxFiles: 5,
  disabled: false
})

const emit = defineEmits<Emits>()

const uploading = ref(false)
const fileList = ref<any[]>([])
const uploadedImages = ref<UploadedImage[]>([])

// Watch modelValue to initialize uploaded images if needed
watch(() => props.modelValue, (newIds) => {
  // Note: We can't fetch existing images by IDs since there's no API for that
  // So we only track newly uploaded images in this component
  if (newIds.length === 0) {
    uploadedImages.value = []
  }
}, { immediate: true })

// Track existing images (for edit mode)
const existingImages = ref<{id: number, url: string}[]>([])

// Computed property for total image count
const totalImageCount = computed(() => {
  return uploadedImages.value.length + (existingImages.value?.length || 0)
})

// Method to set existing images (for edit mode)
const setExistingImages = (images: {id: number, url: string}[]) => {
  existingImages.value = images || []
}

// Method to clear existing images
const clearExistingImages = () => {
  existingImages.value = []
}

// Method to clear uploaded images
const clearUploadedImages = () => {
  uploadedImages.value = []
  fileList.value = []
}

// Expose methods to parent component
defineExpose({
  setExistingImages,
  clearExistingImages,
  clearUploadedImages
})

// Keep track of files being processed
const pendingFiles = ref<File[]>([])
const processingTimeout = ref<number | null>(null)

const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  const isImage = file.type?.startsWith('image/')
  if (!isImage) {
    message.error('Chỉ có thể tải lên file ảnh!')
    return false
  }

  const isLt10M = file.size! / 1024 / 1024 < 10
  if (!isLt10M) {
    message.error('Kích thước ảnh phải nhỏ hơn 10MB!')
    return false
  }

  // Add to pending files
  pendingFiles.value.push(file)
  
  // Clear existing timeout
  if (processingTimeout.value) {
    window.clearTimeout(processingTimeout.value)
  }
  
  // Set a timeout to process all pending files together
  processingTimeout.value = window.setTimeout(async () => {
    const filesToProcess = [...pendingFiles.value]
    pendingFiles.value = []
    
    // Check total files including current selection
    const totalFilesAfterUpload = totalImageCount.value + filesToProcess.length
    if (totalFilesAfterUpload > props.maxFiles) {
      message.error(`Chỉ có thể tải lên tối đa ${props.maxFiles} ảnh! Hiện tại: ${totalImageCount.value}, đang chọn: ${filesToProcess.length}`)
      return
    }
    
    // Process files in batch
    await handleBatchUpload(filesToProcess)
  }, 100) // Wait 100ms for other files in the same selection
  
  return false // Prevent auto upload
}

// Track processed batches to avoid duplicate uploads
const processedBatches = ref(new Set())

const handleBatchUpload = async (fileList: File[]) => {
  // Create a unique identifier for this batch
  const batchId = fileList.map(f => f.name + f.size + f.lastModified).join('|')
  
  // Skip if already processed
  if (processedBatches.value.has(batchId)) {
    return
  }
  
  processedBatches.value.add(batchId)
  
  if (uploading.value) return

  try {
    uploading.value = true
    const formData = new FormData()
    
    // Add all files to FormData
    fileList.forEach(file => {
      formData.append('images', file)
    })

    const response = await APIClient.uploadImages(formData)
    
    if (response.data.code === 0 && response.data.data.images.length > 0) {
      // Add all uploaded images
      uploadedImages.value.push(...response.data.data.images)
      
      // Update model value with new image IDs
      const newImageIds = [...props.modelValue, ...response.data.data.images.map(img => img.id)]
      emit('update:modelValue', newImageIds)
      
      message.success(`Tải lên thành công ${response.data.data.images.length} ảnh!`)
    } else {
      message.error('Lỗi khi tải ảnh lên')
    }
  } catch (error) {
    console.error('Upload error:', error)
    message.error('Lỗi khi tải ảnh lên')
  } finally {
    uploading.value = false
    // Clean up processed batch after some time to prevent memory leak
    window.setTimeout(() => {
      processedBatches.value.delete(batchId)
    }, 5000)
  }
}


const removeImage = (index: number) => {
  const removedImage = uploadedImages.value[index]
  uploadedImages.value.splice(index, 1)
  
  // Update model value by removing the image ID
  const newImageIds = props.modelValue.filter(id => id !== removedImage.id)
  emit('update:modelValue', newImageIds)
  
  message.success('Đã xóa ảnh')
}

const removeExistingImage = async (imageId: number) => {
  try {
    await APIClient.deleteImage(imageId.toString())
    
    // Remove from existing images
    if (existingImages.value) {
      const index = existingImages.value.findIndex(img => img.id === imageId)
      if (index > -1) {
        existingImages.value.splice(index, 1)
      }
    }
    
    // Update model value by removing the image ID
    const newImageIds = props.modelValue.filter(id => id !== imageId)
    emit('update:modelValue', newImageIds)
    
    message.success('Đã xóa ảnh')
  } catch (error) {
    console.error('Error deleting image:', error)
    message.error('Lỗi khi xóa ảnh')
  }
}

const removeFile = (file: any) => {
  const index = fileList.value.indexOf(file)
  if (index > -1) {
    const newFileList = fileList.value.slice()
    newFileList.splice(index, 1)
    fileList.value = newFileList
  }
  return true
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  padding: 4px;
  border-bottom-left-radius: 6px;
}

.image-overlay .ant-btn {
  color: white;
  border: none;
  padding: 4px;
  width: auto;
  height: auto;
}

.upload-hint {
  margin-top: 8px;
}

.upload-hint p {
  color: #666;
  font-size: 12px;
  margin: 0;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .image-item {
    width: 80px;
    height: 80px;
  }
}
</style>