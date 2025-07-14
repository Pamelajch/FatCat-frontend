import api from './jjapi'

export const exLoginService = {
    // 獲取用戶的第三方登入連結
    async getConnections() {
        try {
            const response = await api.get('/ExternalLogin/connections')
            return response.data
        }
        catch (error) {
            throw error.response?.data || { message: '獲取第三方帳號連結失敗' }
        }
    },

    //綁定第三方帳號
    async bindAccount(providerData) {
        try {
            const response = await api.post('/ExternalLogin/bind', providerData)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: '綁定第三方帳號失敗' }
        }
    },

    //解除綁定第三方帳號
    async unbindAccount(provider) {
        try {
            const response = await api.post(`/ExternalLogin/unbind/${provider}`)
            return response.data
        } catch (error) {
            throw error.response?.data || { message: '解除綁定第三方帳號失敗' }
        }
    },

    //Facebook登入
    async initFBLogin() {
        return new Promise((resolve, reject) => {
            //檢查 FB SDK 是否已載入
            if (!window.FB) {
                reject(new Error(' FB SDK 尚未載入'))
                return
            }

            window.FB.login((response) => {
                if (response.authResponse) {
                    resolve({
                        accessToken: response.authResponse.accessToken,
                        userID: response.authResponse.userID
                    })
                } else {
                    reject(new Error('Facebook 登入失敗'))
                }
            }, { scope: 'email' })
        })
    },

    //Google 登入
    async initGoogleLogin() {
        return new Promise((resolve, reject) => {
            // 檢查 Google SDK 是否已載入
            if (!window.google) {
                reject(new Error('Google SDK 尚未載入'))
                return
            }

            // 這裡需要實作 Google 登入邏輯
            // 目前先回傳 mock 資料
            resolve({
                accessToken: 'mock_google_token',
                userID: 'mock_google_id'
            })
        })
    },

    // LINE 登入
    async initLineLogin() {
        return new Promise((resolve, reject) => {
            // 檢查 LINE SDK 是否已載入
            if (!window.liff) {
                reject(new Error('LINE SDK 尚未載入'))
                return
            }

            // 這裡需要實作 LINE 登入邏輯
            // 目前先回傳 mock 資料
            resolve({
                accessToken: 'mock_line_token',
                userID: 'mock_line_id'
            })
        })
    }

}