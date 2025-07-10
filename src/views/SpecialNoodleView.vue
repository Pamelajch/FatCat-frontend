<script setup>
import { ref } from 'vue'

const categories = [
  '如果我是宋朝人系列',
  '社畜都在吃系列',
  '我是你的小女友系列',
  '猛男都有16塊腹肌系列',
  '微波即正義系列',
  '古怪食物系列'
]

const selectedCategory = ref('強檔泡麵系列')

const products = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `宋朝人應該不吃素吧`,
  imageUrl: '/fakenoodle.jpg',
  tag: '強檔'
}))
</script>

<template>
  <div class="special-page">
    <!-- 左側分類 -->
    <aside class="category-menu">
      <h3 class="menu-title">🍜 商品分類</h3>
      <ul>
        <li
          v-for="category in categories"
          :key="category"
          :class="{ active: selectedCategory === category }"
          @click="selectedCategory = category"
        >
          <i class="bi bi-caret-right-fill"></i>
          {{ category }}
        </li>
      </ul>
    </aside>

    <!-- 商品展示 -->
    <section class="product-section">
      <h2 class="title title-arrow">🔥 {{ selectedCategory }}</h2>

      <div class="product-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          <img :src="product.imageUrl" :alt="product.name" class="product-image" />
          <div class="product-info">
            <span class="product-tag">{{ product.tag }}</span>
            <h3 class="product-name">{{ product.name }}</h3>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.special-page {
  display: flex;
  padding: 2rem;
  background-image: url('/CatsWalking.gif'); /* GIF路徑 */
  background-repeat: repeat;
  background-size: 300px;
  animation: scroll 40s linear infinite;
}

/* 分類選單 */
.category-menu {
  width: 220px;
  margin-right: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5e1ff, #e0d4f7);
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(150, 130, 200, 0.3);
}

.menu-title {
  font-size: 1.3rem;
  font-weight: bold;
  color: #663399;
  margin-bottom: 1.2rem;
  text-align: center;
}

.category-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-menu li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1rem;
  margin-bottom: 0.5rem;
  background-color: white;
  border-radius: 8px;
  cursor: pointer;
  color: #4a2e6e;
  transition: all 0.3s ease;
  font-weight: 500;
  border-left: 5px solid transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-menu li:hover i {
  animation: bounce 0.4s ease;
  color: #d63384;
}

.category-menu li:hover {
  background: linear-gradient(135deg, #e2ccff, #ffe0f7);
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(175, 100, 255, 0.4);
  color: #6a1ea1;
}

.category-menu li.active {
  background-color: #ff4d4f;
  color: white;
  font-weight: bold;
  border-left: 5px solid #cc0000;
}

.product-section {
  flex: 1;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #663399;
  margin-bottom: 1.5rem;
}

.title-arrow {
  display: inline-block;
  position: relative;
  color: white;
  background-color: #b48ce3; /* 淡紫色底 */
  padding: 0.7rem 2rem 0.7rem 1.5rem;
  font-size: 1.6rem;
  font-weight: bold;
  clip-path: polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%);
  margin-bottom: 2rem;
  box-shadow: 0 3px 8px rgba(100, 50, 150, 0.3);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background-color: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  margin-top: 10px; /* 圖片上方間距 */
}

.product-info {
  padding: 1rem;
  text-align: center;
}

.product-tag {
  display: inline-block;
  font-size: 0.8rem;
  padding: 0.2rem 0.6rem;
  background-color: #ff8c00;
  color: white;
  border-radius: 999px;
  margin-bottom: 0.5rem;
}

.product-name {
  font-size: 1.1rem;
  color: #4a2e6e;
  font-weight: bold;
}

/* 動畫背景可加這個做平滑滑動 (optional) */
@keyframes bounce {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>