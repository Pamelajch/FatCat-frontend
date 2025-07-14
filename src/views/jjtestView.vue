<!-- jjtestView -->
<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/jjapi.js'

// 響應式資料
const loading = ref(false)
const error = ref(null)
const orderData = ref(null)

// 直接在組件中調用API
const loadOrders = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 🔑 重點：直接使用 api 調用後端，不需要額外的service
    const response = await api.get('/jjTEST/my-orders')
    
    if (response.data.success) {
      orderData.value = response.data.data
    } else {
      error.value = response.data.message || '取得訂單失敗'
    }
  } catch (err) {
    console.error('API調用失敗:', err)
    
    if (err.response?.status === 401) {
      error.value = '請先登入 - 需要JWT Token'
    } else if (err.response?.status === 404) {
      error.value = 'API端點不存在，請確認後端Controller已建立'
    } else {
      error.value = '網路錯誤，請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

// 組件掛載時執行
onMounted(() => {
  loadOrders()
})
</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4>📋 透過JWT Token 抓 UserId並回傳資料的使用範例 - 我的訂單</h4>
          </div>
          <div class="card-body">
            
            <!-- 說明區塊 -->
            <div class="alert alert-info">
              <h6 class="fw-bold">★ 會依據現在登入的是誰，抓取相對應的資料，所以測試前一定要登入</h6>
              <h5>🔑 重要觀念：</h5>
              <ul class="mb-0">
                <li>後端API Controller內、url後面、GET/POST/...方法之前，加上 <code>[Authorize]</code></li>
                <li>使用 <code>User.FindFirst("UserId")</code> 取得用戶ID</li>
                <li>前端不需要傳遞UserId，完全由JWT Token提供</li>
                <li>但前端的view要引用<code>import api from '@/services/jjapi.js'</code></li>
                <li>API路徑：<code>GET /api/jjTEST/my-orders</code></li>
                <li class="fw-bold">範例程式碼：後端-jjTESTController.cs 前端- src/views/jjtestView.vue </li>
              </ul>
              <img src="/getUserId.png" alt="" width="800px">
            </div>

            <!-- 載入中 -->
            <div v-if="loading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">載入中...</span>
              </div>
            </div>

            <!-- 錯誤訊息 -->
            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>

            <!-- 成功結果 -->
            <div v-if="orderData && !loading">
              <h5>✅ API回傳結果：</h5>
              <img src="/example2.png" alt="" width="800px">
              
              <div class="row">
                <div class="col-md-6">
                  <p><strong>用戶ID:</strong> {{ orderData.userId }}</p>
                  <p><strong>訂單數量:</strong> {{ orderData.orderCount }}</p>
                </div>
              </div>

              <!-- 訂單列表 -->
              <div v-if="orderData.orders.length > 0">
                <h6>📦 訂單列表：</h6>
                <div class="table-responsive">
                  <table class="table table-striped">
                    <thead>
                      <tr>
                        <th>訂單編號</th>
                        <th>訂單日期</th>
                        <th>地點</th>
                        <th>總金額</th>
                        <th>應付金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="order in orderData.orders" :key="order.orderId">
                        <td>{{ order.orderId }}</td>
                        <td>{{ order.orderDate }}</td>
                        <td>{{ order.location }}</td>
                        <td>NT$ {{ order.totalAmount }}</td>
                        <td>NT$ {{ order.payableAmount }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- 沒有訂單 -->
              <div v-else class="alert alert-warning">
                您目前沒有任何訂單
              </div>
            </div>

            <!-- 重新載入按鈕 -->
            <div class="text-center mt-3">
              <button class="btn btn-primary" @click="loadOrders" :disabled="loading">
                🔄 重新載入
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.alert {
  border-radius: 8px;
}

.table {
  margin-top: 15px;
}

code {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}
</style>