import api from './jjapi'

class AddressService {
    // 取得用戶所有地址
    async getUserAddresses() {
        try {
            const response = await api.get('/address')
            return response.data
        } catch (error) {
            console.error('取得地址列表失敗:', error)
            throw error
        }
    }

    // 取得單一地址
    async getAddress(addressId) {
        try {
            const response = await api.get(`/address/${addressId}`)
            return response.data
        } catch (error) {
            console.error('取得地址失敗:', error)
            throw error
        }
    }

    // 新增地址
    async createAddress(addressData) {
        try {
            const response = await api.post('/address', addressData)
            return response.data
        } catch (error) {
            console.error('新增地址失敗:', error)
            throw error
        }
    }

    // 更新地址
    async updateAddress(addressId, addressData) {
        try {
            const response = await api.put(`/address/${addressId}`, addressData)
            return response.data
        } catch (error) {
            console.error('更新地址失敗:', error)
            throw error
        }
    }

    // 刪除地址
    async deleteAddress(addressId) {
        try {
            const response = await api.delete(`/address/${addressId}`)
            return response.data
        } catch (error) {
            console.error('刪除地址失敗:', error)
            throw error
        }
    }

    // 設定預設地址
    async setDefaultAddress(addressId) {
        try {
            const response = await api.post(`/address/${addressId}/default`)
            return response.data
        } catch (error) {
            console.error('設定預設地址失敗:', error)
            throw error
        }
    }
}

export default new AddressService() 