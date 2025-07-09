<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const productId = route.query.id
const product = ref(null)

const fetchProductDetail = async () => {
  try {
    const res = await fetch(`https://localhost:7017/api/Products/Details/${productId}`)
    const data = await res.json()
    product.value = data
  } catch (error) {
    console.error('無法取得商品資料:', error)
  }
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<template>
  <div class="product-detail-container" v-if="product">
    <div class="image-box">
      <img :src="product.imageUrl" :alt="product.name" class="main-image" />
    </div>
    <div class="info-box">
      <h1 class="product-name">{{ product.name }}</h1>
      <p class="price">💰 ${{ product.price }}</p>
      <p class="meta">
        分類：{{ product.categoryName }} / {{ product.sortName }}<br />
        庫存：{{ product.stock }} 個<br />
        狀態：<span :class="{'on-sale': product.status === 1, 'off-sale': product.status === 0}">{{ product.statusText }}</span>
      </p>
      <p class="description">{{ product.description }}</p>
      <router-link to="/productlist" class="back-btn">← 返回商品列表</router-link>
    </div>
  </div>
  <div v-else class="loading">載入中...</div>
</template>

<style scoped>
.product-detail-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f8f3ff;
  padding: 24px;
  border-radius: 16px;
  max-width: 800px;
  margin: 40px auto;
  box-shadow: 0 4px 12px rgba(100, 0, 200, 0.1);
}

.image-box {
  text-align: center;
}

.main-image {
  width: 100%;
  max-width: 400px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(150, 100, 255, 0.2);
}

.info-box {
  text-align: left;
  color: #4a2e6e;
}

.product-name {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 8px;
}

.price {
  color: #ff6600;
  font-size: 1.5rem;
  margin-bottom: 12px;
}

.meta {
  font-size: 1rem;
  margin-bottom: 12px;
  line-height: 1.6;
}

.description {
  font-size: 1rem;
  margin-bottom: 24px;
  white-space: pre-wrap;
}

.back-btn {
  display: inline-block;
  background-color: #d9c7eb;
  color: #4a2e6e;
  padding: 8px 16px;
  border-radius: 8px;
  text-decoration: none;
  transition: 0.3s;
}
.back-btn:hover {
  background-color: #c5b0e0;
  color: white;
}

.on-sale {
  color: green;
  font-weight: bold;
}
.off-sale {
  color: gray;
  font-style: italic;
}
.loading {
  text-align: center;
  margin-top: 100px;
  font-size: 1.5rem;
  color: #aaa;
}
</style>