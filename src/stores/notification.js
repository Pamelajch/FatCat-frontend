import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/jjapi'

export const useNotificationStore = defineStore('notification', () => {
    // 狀態
    const notifications = ref([])
    const loading = ref(false)
    const error = ref(null)

    // 計算屬性：未讀通知數量
    const unreadCount = computed(() => {
        return notifications.value.filter(n => !n.isRead).length
    })

    // 取得管理員通知列表
    const fetchAdminNotifications = async (adminId) => {
        if (!adminId) {
            notifications.value = []
            return
        }

        loading.value = true
        error.value = null

        try {
            const res = await api.get(`/Notifications/Admin/${adminId}`)
            notifications.value = res.data
        } catch (e) {
            error.value = '取得通知失敗'
            notifications.value = []
        } finally {
            loading.value = false
        }
    }

    // 標記單一通知為已讀
    const markAsRead = async (notification) => {
        try {
            await api.post('/Notifications/Read', {
                receiverId: notification.receiverId
            })
            notification.isRead = true
            notification.readTime = new Date().toISOString()
        } catch (e) {
            error.value = '標為已讀失敗'
            throw e
        }
    }

    // 全部標為已讀
    const markAllAsRead = async () => {
        const unread = notifications.value.filter(n => !n.isRead)
        for (const n of unread) {
            await markAsRead(n)
        }
    }

    // 清除錯誤
    const clearError = () => {
        error.value = null
    }

    // 清除通知列表
    const clearNotifications = () => {
        notifications.value = []
    }

    return {
        // 狀態
        notifications,
        loading,
        error,
        // 計算屬性
        unreadCount,
        // 方法
        fetchAdminNotifications,
        markAsRead,
        markAllAsRead,
        clearError,
        clearNotifications
    }
})