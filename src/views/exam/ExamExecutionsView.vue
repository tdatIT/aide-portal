<template>
    <div class="exam-executions">
        <div class="page-header">
            <h1>{{ $t('menu.examExecutions') }}</h1>
            <p>Theo dõi và quản lý các lượt thực hiện kiểm tra của người dùng</p>
        </div>

        <a-card class="execution-card">
            <div class="table-toolbar">
                <!-- Date range filter -->
                <a-space>
                    <a-date-picker v-model:value="fromDate" placeholder="Từ ngày" format="DD/MM/YYYY"
                        @change="handleDateFilter" allow-clear />
                    <a-date-picker v-model:value="toDate" placeholder="Đến ngày" format="DD/MM/YYYY"
                        @change="handleDateFilter" allow-clear />
                </a-space>

                <a-space>
                    <a-button @click="handleExportExcel" :loading="loading" type="primary">
                        <template #icon>
                            <DownloadOutlined />
                        </template>
                        Xuất Excel
                    </a-button>
                    <a-button @click="handleRefresh" :loading="loading">
                        <template #icon>
                            <FilterOutlined />
                        </template>
                       Lọc
                    </a-button>
                </a-space>
            </div>

            <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="pagination"
                @change="handleTableChange" row-key="sessId" :scroll="{ x: 1400 }">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'user'">
                        <div class="user-info">
                            <span style="margin-left: 8px">{{ record.username || 'N/A' }}</span>
                        </div>
                    </template>
                    <template v-else-if="column.key === 'status'">
                        <a-tag :color="getStatusColor(getStatus(record))">
                            {{ getStatusText(getStatus(record)) }}
                        </a-tag>
                    </template>
                    <template v-else-if="column.key === 'overallScore'">
                        {{ record.overallScore.toFixed(2) }}
                    </template>
                    <template v-else-if="column.key === 'startedAt'">
                        {{ formatDateTime(record.startedAt) }}
                    </template>
                    <template v-else-if="column.key === 'actions'">
                        <a-space>
                            <a-button type="text" size="small" @click="viewDetail(record)">
                                <EyeOutlined />
                                Chi tiết
                            </a-button>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>

        <!-- Detail Modal -->
        <a-modal v-model:open="detailVisible" title="Chi tiết lượt kiểm tra" @cancel="handleDetailCancel" width="900px"
            :footer="null">
            <div v-if="selectedRecord">
                <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="SessionID">
                        <a-tag color="blue">{{ selectedRecord.sessId }}</a-tag>
                    </a-descriptions-item>
                    <a-descriptions-item label="PatientID">
                       {{ selectedRecord.patientId }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Username">
                        {{ selectedRecord.username || 'N/A' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Trạng thái">
                        <a-tag :color="getStatusColor(getStatus(selectedRecord))">
                            {{ getStatusText(getStatus(selectedRecord)) }}
                        </a-tag>
                    </a-descriptions-item>
                    <a-descriptions-item label="Thời gian bắt đầu">
                        {{ formatDateTime(selectedRecord.startedAt) }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Thời gian hết hạn">
                        {{ formatDateTime(selectedRecord.expiresAt) }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Thời gian hoàn thành">
                        {{ selectedRecord.finishedAt ? formatDateTime(selectedRecord.finishedAt) : 'Chưa hoàn thành' }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Thời gian tạo">
                        {{ formatDateTime(selectedRecord.createdAt) }}
                    </a-descriptions-item>
                </a-descriptions>

                <a-divider>Điểm số chi tiết</a-divider>
                <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="Giao tiếp">
                        {{ selectedRecord.commScore }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Lâm sàng/cận lâm sàng">
                        {{ selectedRecord.clinicalSelectScore }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Chẩn đoán phân biệt">
                        {{ selectedRecord.diffDiagScore }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Chẩn đoán cuối">
                        {{ selectedRecord.finalDiagScore }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Điều trị">
                        {{ selectedRecord.treatmentScore }}
                    </a-descriptions-item>
                    <a-descriptions-item label="Tổng đi">
                        {{ calculateOverallScore(selectedRecord) }}
                    </a-descriptions-item>

                </a-descriptions>


                <!-- AI Feedback if available -->
                <template v-if="selectedRecord.aiFeedback">
                    <a-divider>Phản hồi từ AI</a-divider>
                    <a-card size="small">
                        <div v-html="selectedRecord.aiFeedback"></div>
                    </a-card>
                </template>

                <!-- Selection Feedback if available -->
                <template v-if="selectedRecord.selectionFeedback">
                    <a-divider>Phản hồi lựa chọn</a-divider>
                    <a-card size="small">
                        <div v-html="selectedRecord.selectionFeedback"></div>
                    </a-card>
                </template>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { APIClient } from '@/api'
import type { ExamSessionListItem, TableColumn } from '@/types'
import {
    DownloadOutlined,
    EyeOutlined,
    FilterOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { onMounted, reactive, ref } from 'vue'
import * as XLSX from 'xlsx'

// Reactive data
const dataSource = ref<ExamSessionListItem[]>([])
const loading = ref(false)
const statusFilter = ref<string>()
const fromDate = ref<Dayjs>()
const toDate = ref<Dayjs>()
const detailVisible = ref(false)
const selectedRecord = ref<ExamSessionListItem | null>(null)

// Pagination
const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
        `${range[0]}-${range[1]} của ${total} lượt kiểm tra`
})

// Table columns
const columns: TableColumn[] = [
    {
        title: 'SessionID',
        dataIndex: 'sessId',
        key: 'sessId',
        width: 100,
        fixed: 'left'
    },
    {
        title: 'PatientID',
        dataIndex: 'patientId',
        key: 'patientId',
        width: 80
    },
    {
        title: 'Email',
        key: 'user',
        width: 150
    },
    {
        title: 'Bắt đầu',
        key: 'startedAt',
        width: 100,
    },
    {
        title: 'Trạng thái',
        key: 'status',
        width: 80,
    },

    {
        title: 'Điểm tổng',
        key: 'overallScore',
        width: 80,
    },
    {
        title: 'Hành động',
        key: 'actions',
        width: 120,
        fixed: 'right'
    }
]

// Methods
const fetchData = async () => {
    try {
        loading.value = true

        const fromDateStr = fromDate.value ? fromDate.value.format('YYYY-MM-DD') : undefined
        const toDateStr = toDate.value ? toDate.value.format('YYYY-MM-DD') : undefined

        const response = await APIClient.getAllExam(
            pagination.current,
            pagination.pageSize,
            fromDateStr,
            toDateStr
        )
        dataSource.value = response.data.data.items.map(item => ({
            ...item,
            overallScore: calculateOverallScore(item)
        }))
        pagination.total = response.data.data.total

    } catch (error) {
        console.error('Error fetching exam data:', error)
        message.error('Có lỗi xảy ra khi tải dữ liệu')
    } finally {
        loading.value = false
    }
}

const getStatus = (record: ExamSessionListItem) => {
    const now = new Date()
    const expiresAt = new Date(record.expiresAt)
    if (record.finishedAt) {
        return 'completed'
    }

    // If expired
    if (expiresAt < now) {
        return 'expired'
    }

    // Still in progress
    return 'in_progress'
}

const getStatusColor = (status: string) => {
    const colors = {
        in_progress: 'blue',
        expired: 'red',
        completed: 'green'
    }
    return colors[status as keyof typeof colors] || 'default'
}

const getStatusText = (status: string) => {
    const texts = {
        in_progress: 'Đang thực hiện',
        expired: 'Hết hạn',
        completed: 'Hoàn thành'
    }
    return texts[status as keyof typeof texts] || status
}

const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss')
}

const handleDateFilter = () => {
    pagination.current = 1
    fetchData()
}

const calculateOverallScore = (record: ExamSessionListItem) => {
    return record.commScore * 0.25 + record.clinicalSelectScore * 0.25 +
        record.diffDiagScore * 0.25 + record.finalDiagScore * 0.125 + record.treatmentScore * 0.125;
}

const handleTableChange = (paginationData: any, filters: any) => {
    pagination.current = paginationData.current
    pagination.pageSize = paginationData.pageSize

    // Handle status filter from table
    if (filters.status && filters.status.length > 0) {
        statusFilter.value = filters.status[0]
    } else {
        statusFilter.value = undefined
    }

    fetchData()
}

const handleRefresh = () => {
    fetchData()
}

const handleExportExcel = () => {
    // Kiểm tra giới hạn 100 dòng
    if (dataSource.value.length > 100) {
        message.warning('Không thể xuất quá 100 dòng dữ liệu. Vui lòng lọc dữ liệu để giảm số lượng bản ghi.')
        return
    }

    if (dataSource.value.length === 0) {
        message.warning('Không có dữ liệu để xuất')
        return
    }

    try {
        // Chuẩn bị dữ liệu cho Excel - sử dụng array format
        const headers = [
            'STT', 'Session ID', 'Patient ID', 'Email', 'Thời gian bắt đầu', 
            'Thời gian hết hạn', 'Thời gian hoàn thành', 'Trạng thái', 
            'Điểm giao tiếp', 'Điểm lâm sàng/cận lâm sàng', 'Điểm chẩn đoán phân biệt', 
            'Điểm chẩn đoán cuối', 'Điểm điều trị', 'Điểm tổng', 'Thời gian tạo'
        ]

        const rows = dataSource.value.map((record, index) => [
            index + 1,
            record.sessId,
            record.patientId,
            record.username || 'N/A',
            formatDateTime(record.startedAt),
            formatDateTime(record.expiresAt),
            record.finishedAt ? formatDateTime(record.finishedAt) : 'Chưa hoàn thành',
            getStatusText(getStatus(record)),
            record.commScore,
            record.clinicalSelectScore,
            record.diffDiagScore,
            record.finalDiagScore,
            record.treatmentScore,
            calculateOverallScore(record).toFixed(2),
            formatDateTime(record.createdAt)
        ])

        const data = [headers, ...rows]

        // Tạo worksheet từ array
        const worksheet = XLSX.utils.aoa_to_sheet(data)

        // Thiết lập độ rộng cột
        const colWidths = [
            { wch: 5 },   // STT
            { wch: 15 },  // Session ID
            { wch: 12 },  // Patient ID
            { wch: 25 },  // Email
            { wch: 18 },  // Thời gian bắt đầu
            { wch: 18 },  // Thời gian hết hạn
            { wch: 18 },  // Thời gian hoàn thành
            { wch: 15 },  // Trạng thái
            { wch: 15 },  // Điểm giao tiếp
            { wch: 20 },  // Điểm lâm sàng/cận lâm sàng
            { wch: 20 },  // Điểm chẩn đoán phân biệt
            { wch: 18 },  // Điểm chẩn đoán cuối
            { wch: 15 },  // Điểm điều trị
            { wch: 12 },  // Điểm tổng
            { wch: 18 }   // Thời gian tạo
        ]
        worksheet['!cols'] = colWidths

        // Tạo workbook và thêm worksheet
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Exam Executions')

        // Tạo tên file với thời gian hiện tại
        const now = dayjs()
        const filename = `exam-executions-${now.format('YYYY-MM-DD-HH-mm-ss')}.xlsx`

        // Xuất file
        XLSX.writeFile(workbook, filename)
        
        message.success(`Đã xuất thành công ${dataSource.value.length} bản ghi ra file ${filename}`)
    } catch (error) {
        console.error('Error exporting Excel:', error)
        message.error('Có lỗi xảy ra khi xuất file Excel')
    }
}

const viewDetail = (record: ExamSessionListItem) => {
    selectedRecord.value = record
    detailVisible.value = true
}

const handleDetailCancel = () => {
    detailVisible.value = false
    selectedRecord.value = null
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.exam-executions {
    padding: 0;
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

.execution-card {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table-toolbar {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
}

.user-info {
    display: flex;
    align-items: center;
}

.text-muted {
    color: #999;
    font-style: italic;
}

[data-theme="dark"] .execution-card {
    background: #1f1f1f;
    border-color: #434343;
}

[data-theme="dark"] .page-header p {
    color: #ccc;
}

[data-theme="dark"] .text-muted {
    color: #666;
}

@media (max-width: 768px) {
    .table-toolbar {
        flex-direction: column;
        align-items: stretch;
    }
}
</style>