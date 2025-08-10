<template>
    <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { Chart, ChartConfiguration, registerables } from 'chart.js'
import type { ExamSessionStats } from '@/types'

// Register Chart.js components
Chart.register(...registerables)

interface Props {
    data: ExamSessionStats[]
    loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    loading: false
})

const chartCanvas = ref<HTMLCanvasElement>()
let chartInstance: Chart | null = null

const createChart = () => {
    if (!chartCanvas.value || !props.data.length) return

    // Destroy existing chart
    if (chartInstance) {
        chartInstance.destroy()
    }

    // Prepare data
    const labels = props.data.map(item => {
        const date = new Date(item.date)
        return date.toLocaleDateString('vi-VN', { 
            month: 'short', 
            day: 'numeric' 
        })
    })

    const datasets = [
        {
            label: 'Tổng số',
            data: props.data.map(item => item.totalCount),
            backgroundColor: 'rgba(24, 144, 255, 0.8)',
            borderColor: 'rgb(24, 144, 255)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        },
        {
            label: 'Hoàn thành',
            data: props.data.map(item => item.completedCount),
            backgroundColor: 'rgba(82, 196, 26, 0.8)',
            borderColor: 'rgb(82, 196, 26)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        },
        {
            label: 'Đang thực hiện',
            data: props.data.map(item => item.processingCount),
            backgroundColor: 'rgba(250, 140, 22, 0.8)',
            borderColor: 'rgb(250, 140, 22)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        },
        {
            label: 'Hết hạn',
            data: props.data.map(item => item.expiredCount),
            backgroundColor: 'rgba(255, 77, 79, 0.8)',
            borderColor: 'rgb(255, 77, 79)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
        }
    ]

    const config: ChartConfiguration = {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Thống kê bài kiểm tra theo ngày'
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Ngày'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Số lượng'
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    }

    chartInstance = new Chart(chartCanvas.value, config)
}

// Watch for data changes
watch(() => props.data, () => {
    createChart()
}, { deep: true })

onMounted(() => {
    createChart()
})

onUnmounted(() => {
    if (chartInstance) {
        chartInstance.destroy()
    }
})
</script>

<style scoped>
.chart-container {
    position: relative;
    height: 300px;
    width: 100%;
}
</style>