<template>
  <div class="quill-editor-wrapper">
    <div ref="editorRef"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Nhập nội dung...',
  disabled: false
})

const emit = defineEmits<Emits>()

const editorRef = ref<HTMLElement | null>(null)
let quill: Quill | null = null

onMounted(() => {
  if (!editorRef.value) return

  quill = new Quill(editorRef.value, {
    theme: 'snow',
    placeholder: props.placeholder,
    readOnly: props.disabled,
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['clean'],
        ['link', 'image']
      ]
    }
  })

  // Set initial content
  quill.root.innerHTML = props.modelValue || ''

  // Handle content changes
  quill.on('text-change', () => {
    const content = quill?.root.innerHTML || ''
    emit('update:modelValue', content)
  })
})

// Watch for model value changes from parent
watch(() => props.modelValue, (newValue) => {
  if (quill && quill.root.innerHTML !== newValue) {
    quill.root.innerHTML = newValue || ''
  }
})

// Watch for disabled state changes
watch(() => props.disabled, (newValue) => {
  if (quill) {
    quill.enable(!newValue)
  }
})

// Cleanup on component unmount
onBeforeUnmount(() => {
  if (quill) {
    quill.off('text-change')
  }
})
</script>

<style scoped>
.quill-editor-wrapper {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.quill-editor-wrapper:hover {
  border-color: #40a9ff;
}

.quill-editor-wrapper:focus-within {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

:deep(.ql-toolbar) {
  border: none;
  border-bottom: 1px solid #d9d9d9;
  background: #fafafa;
  border-radius: 6px 6px 0 0;
}

:deep(.ql-container) {
  border: none;
  border-radius: 0 0 6px 6px;
}

:deep(.ql-editor) {
  min-height: 200px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
}

:deep(.ql-editor.ql-blank::before) {
  color: #bfbfbf;
  font-style: normal;
}

:deep(.ql-snow .ql-tooltip) {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.ql-snow .ql-picker.ql-expanded .ql-picker-options) {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Custom button styles to match Ant Design */
:deep(.ql-snow .ql-toolbar button) {
  border-radius: 4px;
  margin: 0 1px;
}

:deep(.ql-snow .ql-toolbar button:hover) {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

:deep(.ql-snow .ql-toolbar button.ql-active) {
  background-color: #1890ff;
  color: white;
}
</style>