<script setup>
import { ref } from 'vue'
import api from '@/services/jjapi'

const title = ref('')
const description = ref('')
const receiverType = ref('all_admins') // 預設
const receiverIds = ref([]) // 若選特定對象
const notificationType = ref(6) // 例如 6=系統公告

const sending = ref(false)
const message = ref('')

// 常用範例
function fillTemplate(t, d) {
  title.value = t
  description.value = d
}

// 發送通知
async function sendNotification() {
  if (!title.value || !description.value) {
    message.value = '請填寫標題與內容'
    return
  }
  sending.value = true
  try {
    await api.post('/Notifications/Send', {
      title: title.value,
      description: description.value,
      notificationType: notificationType.value,
      receiverType: receiverType.value,
      receiverIds: receiverType.value === 'specific' ? receiverIds.value : []
    })
    message.value = '發送成功！'
    // 清空表單
    title.value = ''
    description.value = ''
    receiverIds.value = []
  } catch (e) {
    message.value = '發送失敗'
  }
  sending.value = false
}
</script>

<template>
  <div class="container-fluid">
    <h2><i class="fas fa-bell me-2"></i>系統通知</h2>
    <div v-if="message" class="alert" :class="message.includes('成功') ? 'alert-success' : 'alert-danger'">{{ message }}</div>
    <form @submit.prevent="sendNotification">
      <div class="mb-3">
        <label class="form-label">通知標題 <span class="text-danger">*</span></label>
        <input v-model="title" maxlength="50" class="form-control" required>
        <div class="form-text">{{ title.length }}/50 字元</div>
      </div>
      <div class="mb-3">
        <label class="form-label">通知內容 <span class="text-danger">*</span></label>
        <textarea v-model="description" maxlength="100" class="form-control" rows="4" required></textarea>
        <div class="form-text">{{ description.length }}/100 字元</div>
      </div>
      <div class="mb-3">
        <label class="form-label">通知對象 <span class="text-danger">*</span></label>
        <select v-model="receiverType" class="form-select">
          <option value="all_admins">所有管理員</option>
          <option value="all_users">所有使用者</option>
          <option value="specific">特定對象</option>
        </select>
      </div>
      <div v-if="receiverType === 'specific'" class="mb-3">
        <label class="form-label">請輸入 UserId（可多選, 以逗號分隔）</label>
        <input class="form-control" @input="e => receiverIds.value = e.target.value.split(',').map(s => parseInt(s.trim())).filter(Boolean)" placeholder="例如：1001,1002,1003">
      </div>
      <div class="mb-3">
        <button type="button" class="btn btn-outline-secondary me-2" @click="fillTemplate('系統維護公告', '系統將於今晚23:00-01:00進行維護，請提前保存工作。')">維護公告</button>
        <button type="button" class="btn btn-outline-secondary me-2" @click="fillTemplate('系統更新通知', '系統已更新至新版本，新增了多項功能改進。')">更新通知</button>
        <button type="button" class="btn btn-outline-secondary me-2" @click="fillTemplate('緊急系統公告', '發現系統異常，請暫停相關操作，技術人員正在處理中。')">緊急公告</button>
        <button type="button" class="btn btn-outline-secondary" @click="fillTemplate('系統恢復正常', '系統維護已完成，所有功能已恢復正常，感謝您的耐心等待。')">恢復通知</button>
      </div>
      <div class="d-grid gap-2 d-md-flex justify-content-md-end">
        <button type="submit" class="btn btn-warning" :disabled="sending">
          <i class="fas fa-paper-plane me-2"></i>發送通知
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>

</style>