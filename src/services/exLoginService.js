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
                    // 取得用戶基本資料
                    window.FB.api('/me', { fields: 'name,email' }, (userInfo) => {
                        if (userInfo && !userInfo.error) {
                            resolve({
                                accessToken: response.authResponse.accessToken,
                                userID: response.authResponse.userID,
                                email: userInfo.email || '',
                                name: userInfo.name || ''
                            })
                        } else {
                            reject(new Error('無法取得 Facebook 用戶資料'))
                        }
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

            try {
                // 初始化 Google OAuth
                window.google.accounts.oauth2.initTokenClient({
                    client_id: window.googleClientId,
                    scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
                    callback: async (response) => {
                        if (response.error) {
                            reject(new Error(`Google 登入失敗: ${response.error}`))
                            return
                        }

                        try {
                            // 使用 access_token 取得用戶資訊
                            const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
                            
                            if (!userInfoResponse.ok) {
                                throw new Error('無法取得 Google 用戶資料')
                            }

                            const userInfo = await userInfoResponse.json()
                            
                            resolve({
                                accessToken: response.access_token,
                                userID: userInfo.id,
                                email: userInfo.email || '',
                                name: userInfo.name || ''
                            })
                        } catch (error) {
                            reject(new Error('處理 Google 用戶資料時發生錯誤: ' + error.message))
                        }
                    }
                }).requestAccessToken()
            } catch (error) {
                reject(new Error('初始化 Google 登入時發生錯誤: ' + error.message))
            }
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