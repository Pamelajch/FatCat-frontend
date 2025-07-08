import api from "./jjapi";

// 認證相關的 API 服務
export const authService = {
    // 呼叫登入 API
    async login(loginData) {
        try {
            const response = await api.post('/auth/login', loginData)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: '登入失敗' }
        }
    },

    //  呼叫註冊 API
    async register(registerData) {
        try {
            const response = await api.post('/auth/register', registerData)
            return response.data
        }
        catch (error) {
            throw error.response?.data || { message: '註冊失敗' }
        }
    },

    // 獲取用戶資訊
    async getProfile() {
        try {
            const response = await api.get('/auth/profile')
            return response.data
        }
        catch (error) {
            throw error.response?.data || { message: '獲取用戶資訊失敗' }
        }
    },

    // 呼叫登出 API
    async logout() {
        try {
            const response = await api.post('/auth/logout')
            return response.data
        }
        catch (error) {
            throw error.response?.data || { message: '登出失敗' }
        }
    },

    // 檢查用戶是否已登入
    isAuthenticated() {
        const token = localStorage.getItem('token')
        if (!token) {
            return false
        }
        try {
            // 簡單的 token 格式檢查
            const payload = JSON.parse(atob(token.split('.')[1]))
            const currentTime = Date.now() / 1000
            return payload.exp > currentTime
        }
        catch (error) {
            return false
        }
    },

    // 儲存認證資訊到 localStorage
    saveAuthData(authData) {
        localStorage.setItem('token', authData.token)
        localStorage.setItem('user', JSON.stringify({
            userId: authData.userId,
            name: authData.name,
            email: authData.email,
            picPath: authData.picPath
        }))
    },

    // 清除認證資訊
    clearAuthData() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
    },

    // 獲取當前用戶資訊
    getCurrentUser() {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    }
}
export default authService
