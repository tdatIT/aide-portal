import dayjs from 'dayjs'
import 'dayjs/locale/vi' // import locale tiếng Việt
import utc from 'dayjs/plugin/utc' // plugin xử lý UTC
import timezone from 'dayjs/plugin/timezone' // plugin xử lý timezone

// Cấu hình dayjs
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('vi')


// Hàm format theo định dạng HH:MM DD-MM-YYYY
export const formatTimeDate = (isoString: string): string => {
  return dayjs(isoString)
    .tz('Asia/Ho_Chi_Minh')
    .format('HH:mm  DD-MM-YYYY')
}

export default formatTimeDate