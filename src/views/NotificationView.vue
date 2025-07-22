<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/jjapi'

const notifications = ref([])
const loading = ref(true)
const message = ref('')

// 取得 userId（假設存在 localStorage）
const user = localStorage.getItem('user')
const userId = user ? JSON.parse(user).userId : null

// 取得通知列表
async function fetchNotifications() {
  if (!userId) {
    message.value = '請先登入'
    loading.value = false
    return
  }
  loading.value = true
  try {
    const res = await api.get(`/Notifications/User/${userId}`)
    notifications.value = res.data
  } catch (e) {
    message.value = '取得通知失敗'
  }
  loading.value = false
}

// 單一通知標為已讀
async function markAsRead(notification) {
    console.log('標記通知為已讀:', notification)
    console.log('通知 ID:', notification.notificationId)
  try {
    await api.post('/Notifications/Read', {
      receiverId: notification.receiverId 
    })
    notification.isRead = true
    notification.readTime = new Date().toISOString()
  } catch (e) {
    message.value = '標為已讀失敗'
  }
}

// 全部標為已讀
async function markAllAsRead() {
  const unread = notifications.value.filter(n => !n.isRead)
  for (const n of unread) {
    await markAsRead(n)
  }
  message.value = '全部已標為已讀'
}

onMounted(fetchNotifications)
</script>

<template>
  <div class="container">
    <h2><i class="fas fa-bell me-2"></i>我的通知</h2>
    <div v-if="message" class="alert alert-danger">{{ message }}</div>
    <div v-if="loading" class="text-center py-5">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
    </div>
    <div v-else>
      <div class="mb-3 text-end">
        <button class="btn btn-outline-secondary" @click="markAllAsRead" :disabled="notifications.every(n => n.isRead)">
          <i class="fas fa-check-double me-2"></i>全部標為已讀
        </button>
      </div>
      <div v-if="notifications.length">
        <div class="list-group">
          <div v-for="n in notifications" :key="n.notificationId"
               class="list-group-item"
               :class="!n.isRead ? 'list-group-item-primary border-start border-4 border-primary' : ''">
            <div class="d-flex w-100 justify-content-between">
              <div>
                <h5 class="mb-1">{{ n.title }}
                  <span v-if="!n.isRead" class="badge bg-primary ms-2">新</span>
                  <span class="badge bg-info ms-2">
                    {{ n.notificationType === 1 ? '訂單' : n.notificationType === 2 ? '付款' : n.notificationType === 3 ? '物流' : n.notificationType === 4 ? '優惠券' : n.notificationType === 5 ? '客訴' : n.notificationType === 6 ? '系統' : n.notificationType === 7 ? '促銷' : n.notificationType === 8 ? '退款' : n.notificationType === 9 ? '評論檢舉' : '其他' }}
                  </span>
                </h5>
                <p class="mb-1 text-muted">{{ n.description }}</p>
                <small class="text-muted">
                  <i class="fas fa-clock me-1"></i>
                  {{ n.time ? new Date(n.time).toLocaleString() : '' }}
                </small>
                <span v-if="n.isRead" class="badge bg-success ms-2">已讀</span>
              </div>
              <div class="ms-3" v-if="!n.isRead">
                <button class="btn btn-sm btn-outline-success" @click="markAsRead(n)">
                  <i class="fas fa-check"></i> 標為已讀
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-5">
        <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
        <h4 class="text-muted">目前沒有通知</h4>
        <p class="text-muted">當有新的通知時，會顯示在這裡</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container { max-width: 80%; margin: 40px auto; }
</style>