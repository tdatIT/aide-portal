# Heartbeat Implementation

## Tổng quan

Hệ thống heartbeat đã được implement để tracking user activity bằng cách gửi request định kỳ mỗi 1 phút 30 giây (90 giây) đến backend.

## Cấu trúc Files

### 1. Core Service
- `src/utils/heartbeat.ts`: Heartbeat service chính
- `src/composables/useHeartbeat.ts`: Vue composable để sử dụng trong components
- `src/plugins/heartbeat.ts`: Vue plugin để tự động khởi tạo

### 2. Components
- `src/components/HeartbeatStatus.vue`: Component debug để hiển thị trạng thái heartbeat

### 3. Integration
- `src/stores/index.ts`: Tích hợp với auth store
- `src/main.ts`: Đăng ký plugin

## Cách hoạt động

### 1. Tự động khởi tạo
- Khi app khởi động, plugin sẽ kiểm tra xem user đã đăng nhập chưa
- Nếu có token trong localStorage và user đã authenticated, heartbeat sẽ tự động bắt đầu

### 2. Lifecycle Management
- **Login**: Heartbeat tự động bắt đầu khi user đăng nhập
- **Logout**: Heartbeat tự động dừng khi user đăng xuất
- **Token Refresh**: Heartbeat tiếp tục hoạt động sau khi refresh token

### 3. Error Handling
- Nếu heartbeat request thất bại với lỗi 401, refresh token sẽ xử lý
- Nếu user không còn authenticated, heartbeat sẽ tự động dừng

## API Endpoint

```typescript
// Heartbeat API
heartbeat: (): Promise<AxiosResponse<ApiResponse>> =>
  axiosClient.get(`${PATIENT_API_URL}/api/v1/tracking/heartbeat`)
```

## Sử dụng trong Components

### 1. Sử dụng Composable
```vue
<script setup>
import { useHeartbeat } from '@/composables/useHeartbeat'

const { isActive, startHeartbeat, stopHeartbeat } = useHeartbeat()
</script>
```

### 2. Sử dụng Global Properties
```vue
<script setup>
// Trong component
const { $heartbeatService } = getCurrentInstance()

// Sử dụng
$heartbeatService.start()
$heartbeatService.stop()
</script>
```

### 3. Debug Component
```vue
<template>
  <!-- Hiển thị trạng thái heartbeat (chỉ trong development) -->
  <HeartbeatStatus :show-debug="true" />
</template>
```

## Configuration

### 1. Interval Time
```typescript
// Trong src/utils/heartbeat.ts
private readonly HEARTBEAT_INTERVAL = 90000 // 90 giây = 1 phút 30 giây
```

### 2. Development Mode
```typescript
// Trong MainLayout.vue
const isDevelopment = computed(() => import.meta.env.DEV)
```

## Best Practices

### 1. Performance
- Sử dụng singleton pattern để tránh tạo nhiều instance
- Tự động dừng khi user logout để tiết kiệm tài nguyên
- Sử dụng setInterval thay vì setTimeout để đảm bảo timing chính xác

### 2. Error Handling
- Graceful handling khi network error
- Tự động retry với refresh token
- Log errors để debugging

### 3. User Experience
- Heartbeat chạy ngầm, không ảnh hưởng UX
- Debug component chỉ hiển thị trong development
- Tự động restart khi cần thiết

## Monitoring & Debugging

### 1. Console Logs
```javascript
// Khi bắt đầu heartbeat
console.log('Bắt đầu heartbeat service')

// Khi gửi heartbeat thành công
console.log('Heartbeat sent successfully:', response.data)

// Khi có lỗi
console.error('Heartbeat failed:', error)
```

### 2. Debug Component
- Hiển thị trạng thái active/inactive
- Hiển thị thời gian heartbeat cuối cùng
- Chỉ hiển thị trong development mode

### 3. Network Tab
- Kiểm tra requests trong browser dev tools
- Verify timing của heartbeat requests
- Monitor response status

## Testing

### 1. Manual Testing
```javascript
// Trong browser console
// Kiểm tra trạng thái
window.$heartbeatService.isActive()

// Bắt đầu/dừng thủ công
window.$heartbeatService.start()
window.$heartbeatService.stop()
```

### 2. Network Testing
- Disconnect network để test error handling
- Test với token hết hạn
- Test với refresh token không hợp lệ

### 3. Performance Testing
- Monitor memory usage
- Check CPU usage
- Verify không có memory leaks

## Troubleshooting

### 1. Heartbeat không bắt đầu
- Kiểm tra user đã đăng nhập chưa
- Kiểm tra token trong localStorage
- Kiểm tra console logs

### 2. Heartbeat dừng đột ngột
- Kiểm tra network connection
- Kiểm tra token expiration
- Kiểm tra refresh token logic

### 3. Multiple Heartbeat Instances
- Kiểm tra singleton pattern
- Kiểm tra cleanup logic
- Restart app nếu cần

## Future Enhancements

### 1. Configurable Interval
```typescript
// Có thể config từ environment variables
const HEARTBEAT_INTERVAL = import.meta.env.VITE_HEARTBEAT_INTERVAL || 90000
```

### 2. Advanced Error Handling
- Exponential backoff cho retry
- Circuit breaker pattern
- Offline detection

### 3. Analytics
- Track heartbeat success rate
- Monitor user activity patterns
- Performance metrics

### 4. User Preferences
- Allow user to disable heartbeat
- Configurable intervals
- Privacy controls 