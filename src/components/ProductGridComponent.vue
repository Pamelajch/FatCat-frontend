<script setup>
// 以下是假資料，等後端完成後改成 API 撈資料
const products = [
  {
    id: 1,
    name: '地獄椒鹽豚骨',
    imageUrl: '/fakenoodle.jpg',
    tag: '強檔'
  },
  {
    id: 2,
    name: '爆香麻辣牛肉',
    imageUrl: '/fakenoodle.jpg',
    tag: '強檔'
  },
  {
    id: 3,
    name: '濃厚蝦味拉麵',
    imageUrl: '/fakenoodle.jpg',
    tag: '強檔'
  },
  {
    id: 4,
    name: '咖哩起司燉雞',
    imageUrl: '/fakenoodle.jpg',
    tag: '強檔'
  }
]
</script>

<template>
  <section class="hot-products">
    <h2 class="section-title">🔥 強檔泡麵推薦</h2>
    <p class="subtitle">這些人氣口味你吃過了嗎？</p>

    <div class="product-list">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-tag"> {{ product.tag }} </div>
        <img :src="product.imageUrl" :alt="product.name" class="product-image" />
        <div class="product-name">{{ product.name }}</div>
      </div>
    </div>

    <button class="more-btn">查看更多 ➜</button>
  </section>
</template>

<style scoped>
.hot-products {
  padding: 40px 20px;
  background-color: #fdf8ff; /* 淺紫背景 */
  text-align: center;
}

.section-title {
  font-size: 36px;
  color: #ff8800; /* 橘色標題 */
  margin-bottom: 10px;
}

.subtitle {
  font-size: 18px;
  color: #6f42c1; /* 紫色小標 */
  margin-bottom: 30px;
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin-bottom: 30px;
}

.product-card {
  background-color: white;
  border: 2px solid #e6d6f0; /* 淡紫邊框 */
  border-radius: 12px;
  width: 440px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-6px);
}

.product-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: #ff8800;
  color: white;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 14px;
}

.product-image {
  width: 100%;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.product-name {
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  color: #4a2e6e; /* 深紫 */
}

.more-btn {
  background-color: #ff8800;
  color: white;
  font-weight: bold;
  font-size: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.more-btn:hover {
  background-color: #e37000;
}
</style>
