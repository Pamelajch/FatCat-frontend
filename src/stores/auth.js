import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
    // 狀態
    const user = ref(null)
    const token = ref(null)
    const isLoading = ref(false) //載入狀態
    const error = ref(null)

    // 是否已登入（計算屬性）
    const isAuthenticated = computed(() => {
        return !!token.value && !!user.value
        // 第一個 ! - 將值轉換為布林值並取反 
        // 第二個 ! - 再次取反，得到真正的布林值
    })

    // 初始化認證狀態 - 從 localStorage 讀取認證資訊
    const initializeAuth = () => {
        const savedToken = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user')

        if (savedToken && savedUser) {
            token.value = savedToken
            user.value = JSON.parse(savedUser)
        }
    }

    // 登入
    const login = async (loginData) => {
        try {
            isLoading.value = true
            error.value = null

            const response = await authService.login(loginData)

            if (response.success) {
                const userData = response.data

                // 儲存到狀態
                token.value = userData.token
                user.value = {
                    userId: userData.userId,
                    name: userData.name,
                    email: userData.email,
                    picPath: userData.picPath
                }

                // 儲存到 localStorage
                authService.saveAuthData(userData)

                return { success: true, message: '登入成功' }
            } else {
                throw new Error(response.message || '登入失敗')
            }
        } catch (err) {
            error.value = err.message || '登入失敗'
            return { success: false, message: error.value }
        } finally {
            isLoading.value = false
        }
    }

    // 註冊
    const register = async (registerData) => {
        try {
            isLoading.value = true
            error.value = null

            const response = await authService.register(registerData)

            if (response.success) {
                return { success: true, message: '註冊成功' }
            } else {
                throw new Error(response.message || '註冊失敗')
            }
        } catch (err) {
            error.value = err.message || '註冊失敗'
            return { success: false, message: error.value }
        } finally {
            isLoading.value = false
        }
    }

    // 登出
    const logout = async () => {
        try {
            isLoading.value = true

            // 呼叫後端登出 API
            await authService.logout()

            // 清除狀態
            user.value = null
            token.value = null
            error.value = null

            // 清除 localStorage
            authService.clearAuthData()

            return { success: true, message: '登出成功' }
        } catch (err) {
            // 即使後端失敗，也要清除本地狀態
            user.value = null
            token.value = null
            error.value = null
            authService.clearAuthData()

            return { success: true, message: '登出成功' }
        } finally {
            isLoading.value = false
        }
    }

    // 獲取用戶資料
    const fetchUserProfile = async () => {
        try {
            isLoading.value = true
            error.value = null

            const response = await authService.getProfile()

            if (response.success) {
                // 更新用戶資料
                user.value = {
                    ...user.value, // 展開現有的用戶資料
                    ...response.data // 展開從API獲取的新資料
                    // ... 展開操作符 (Spread Operator)
                    //作用：展開物件或陣列的內容
                }
                return { success: true, data: response.data }
            } else {
                throw new Error(response.message || '獲取用戶資料失敗')
            }
        } catch (err) {
            error.value = err.message || '獲取用戶資料失敗'
            return { success: false, message: error.value }
        } finally {
            isLoading.value = false
        }
    }

    // 清除錯誤
    const clearError = () => {
        error.value = null
    }

    // 返回狀態和方法
    return {
        // 狀態
        user,
        token,
        isLoading,
        error,
        // 計算屬性
        isAuthenticated,
        // 方法
        initializeAuth,
        login,
        register,
        logout,
        fetchUserProfile,
        clearError
    }
})


