import dayjs from 'dayjs'
import 'dayjs/locale/vi' // import locale tiếng Việt
import utc from 'dayjs/plugin/utc' // plugin xử lý UTC
import timezone from 'dayjs/plugin/timezone' // plugin xử lý timezone

// Cấu hình dayjs
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('vi') // Sử dụng locale tiếng Việt

// Hàm parse date
const formatDateTime = (isoString: string): string => {
  return dayjs(isoString)
    .tz('Asia/Ho_Chi_Minh')
    .format('DD/MM/YYYY HH:mm')
}

export default formatDateTime