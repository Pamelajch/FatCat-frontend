import axios from "axios"

//建立axios 實例
const api = axios.create({
    baseURL: 'https://localhost:7017/api',
    timeout: 10000, //請求逾時設定10秒
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

//請求攔截器 --自動添加JWT Token
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

// 回應攔截器 - 統一處理錯誤
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