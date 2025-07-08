import axios from "axios"

//建立axios 實例
const api = axios.create({
    baseURL: 'https://localhost:7017/api', //baseURL 設定 - 統一的後端 API 基礎路徑
    timeout: 10000, //請求逾時設定10秒 防止請求卡死
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

//請求攔截器 - 自動在每個請求中添加 JWT Token
api.interceptors.request.use(
    (config) => {
        // 從 localStorage 獲取 token
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 回應攔截器 - 統一處理 401 認證錯誤
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        // 如果 token 過期或無效，清除本地儲存並跳轉到登入頁
        if (error.response?.status == 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            //跳轉到登入頁
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api