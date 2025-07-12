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
            // 檢查是否已經在登入頁面或是登入相關的 API 呼叫
            const isLoginPage = window.location.pathname === '/login'
            const isLoginAPI = error.config?.url?.includes('/auth/login') || error.config?.url?.endsWith('/auth/login')
            
            // 如果不是登入頁面且不是登入 API，才進行重新導向
            if (!isLoginPage && !isLoginAPI) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                //跳轉到登入頁
                window.location.href = '/login'
            }
            
            // 如果是登入 API 失敗，不要清除本地存儲（因為用戶可能只是密碼錯誤）
            console.log('登入失敗，但不重新導向頁面')
        }
        return Promise.reject(error)
    }
)

export default api