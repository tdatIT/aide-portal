import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import router from './router'
import i18n from './locales'
import App from './App.vue'
import heartbeatPlugin from './plugins/heartbeat'

// Import Ant Design styles
import 'ant-design-vue/dist/reset.css'
import './style.css'

const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(Antd)
app.use(heartbeatPlugin)

// Mount app
app.mount('#app')
