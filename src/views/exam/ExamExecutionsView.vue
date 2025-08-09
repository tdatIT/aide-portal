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
                    <a-select v-model:value="statusFilter" placeholder="Lọc theo trạng thái" style="width: 150px"
                        allow-clear @change="handleStatusFilter">
                        <a-select-option value="in_progress">Đang thực hiện</a-select-option>
                        <a-select-option value="expired">Hết hạn</a-select-option>
                    </a-select>

                    <a-button @click="handleRefresh" :loading="loading">
                        <template #icon>
                            <ReloadOutlined />
                        </template>
                        Làm mới
                    </a-button>
                </a-space>
            </div>

            <a-table :columns="columns" :data-source="dataSource" :loading="loading" :pagination="pagination"
                @change="handleTableChange" row-key="sessId" :scroll="{ x: 1400 }">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'user'">
                        <div class="user-info">
                            <a-avatar size="small">
                                {{ record.username?.charAt(0)?.toUpperCase() || 'U' }}
                            </a-avatar>
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
                        <a-tag color="green">{{ selectedRecord.patientId }}</a-tag>
                    </a-descriptions-item>
                    <a-descriptions-item label="Username">
                        <div class="user-info">
                            <a-avatar size="small">
                                {{ selectedRecord.username?.charAt(0)?.toUpperCase() || 'U' }}
                            </a-avatar>
                            <span style="margin-left: 8px">{{ selectedRecord.username || 'N/A' }}</span>
                        </div>
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

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-card size="small" title="Điểm giao tiếp">
                            <a-progress
                                v-if="selectedRecord.commScore !== null && selectedRecord.commScore !== undefined"
                                :percent="selectedRecord.commScore"
                                :status="getScoreStatus(selectedRecord.commScore)" />
                            <span v-else class="text-muted">Chưa có điểm</span>
                        </a-card>
                    </a-col>
                    <a-col :span="12">
                        <a-card size="small" title="Điểm lựa chọn lâm sàng">
                            <a-progress
                                v-if="selectedRecord.clinicalSelectScore !== null && selectedRecord.clinicalSelectScore !== undefined"
                                :percent="selectedRecord.clinicalSelectScore"
                                :status="getScoreStatus(selectedRecord.clinicalSelectScore)" />
                            <span v-else class="text-muted">Chưa có điểm</span>
                        </a-card>
                    </a-col>
                    <a-col :span="12" style="margin-top: 16px;">
                        <a-card size="small" title="Điểm chẩn đoán phân biệt">
                            <a-progress
                                v-if="selectedRecord.diffDiagScore !== null && selectedRecord.diffDiagScore !== undefined"
                                :percent="selectedRecord.diffDiagScore"
                                :status="getScoreStatus(selectedRecord.diffDiagScore)" />
                            <span v-else class="text-muted">Chưa có điểm</span>
                        </a-card>
                    </a-col>
                    <a-col :span="12" style="margin-top: 16px;">
                        <a-card size="small" title="Điểm chẩn đoán cuối cùng">
                            <a-progress
                                v-if="selectedRecord.finalDiagScore !== null && selectedRecord.finalDiagScore !== undefined"
                                :percent="selectedRecord.finalDiagScore"
                                :status="getScoreStatus(selectedRecord.finalDiagScore)" />
                            <span v-else class="text-muted">Chưa có điểm</span>
                        </a-card>
                    </a-col>
                </a-row>

                <a-row :gutter="16" style="margin-top: 16px;">
                    <a-col :span="24">
                        <a-card size="small" title="Điểm điều trị">
                            <a-progress
                                v-if="selectedRecord.treatmentScore !== null && selectedRecord.treatmentScore !== undefined"
                                :percent="selectedRecord.treatmentScore"
                                :status="getScoreStatus(selectedRecord.treatmentScore)" />
                            <span v-else class="text-muted">Chưa có điểm</span>
                        </a-card>
                    </a-col>
                </a-row>

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
import type { TableColumn, ExamSessionListItem } from '@/types'
import { APIClient } from '@/api'
import {
    EyeOutlined,
    ReloadOutlined
} from '@ant-design/icons-vue'
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'

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

const getScoreStatus = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'normal'
    return 'exception'
}

const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss')
}

const handleStatusFilter = () => {
    pagination.current = 1
    fetchData()
}

const handleDateFilter = () => {
    pagination.current = 1
    fetchData()
}

const calculateOverallScore = (record: ExamSessionListItem) => {
    return record.commScore * 0.25 + record.clinicalSelectScore * 0.25 +
        record.diffDiagScore * 0.25 + record.finalDiagScore * 0.125 + record.treatmentScore * 0.125;
}

const handleTableChange = (paginationData: any, filters: any, sorter: any) => {
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