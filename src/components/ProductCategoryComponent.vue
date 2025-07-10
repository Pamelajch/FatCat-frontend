<script setup>
import { ref, onMounted } from 'vue'

const categories = ref([])

const fetchCategories = async () => {
  try {
    const res = await fetch('https://localhost:7017/api/ProductCategories')
    categories.value = await res.json()
  } catch (error) {
    console.error('無法取得分類資料:', error)
  }
}

// 背景顏色設定
const getCategoryColor = (id) => {
  const colorMap = {
    1: '#FF2D2D', // 肉類
    2: '#FF79BC', // 蔬菜
    3: '#FF77FF', // 麵粉
    4: '#BE77FF', // 火鍋配料
    5: '#9393FF', // 湯頭
    6: '#66B3FF'  // 調味料
  }
  return colorMap[id] || '#d1d5db'
}

// emoji 設定
const getEmoji = (id) => {
  const emojiMap = {
    1: '🍖', // 肉類
    2: '🥬', // 蔬菜
    3: '🍜', // 麵粉
    4: '🔥', // 火鍋配料
    5: '🥣', // 湯頭
    6: '🧂'  // 調味料
  }
  return emojiMap[id] || '❓'
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="category-container">
    <h2 class="title">🍜 選擇你的泡麵分類 🍥</h2>
    <div class="category-grid">
      <div
        v-for="cat in categories"
        :key="cat.productCategoriesId"
        class="flip-box"
      >
        <div
          class="flip-inner"
          :style="{ backgroundColor: getCategoryColor(cat.productCategoriesId) }"
        >
          <!-- 正面：分類名稱 -->
          <div class="flip-front">
            <p class="category-name">{{ cat.name }}</p>
          </div>
          <!-- 背面：emoji -->
          <div class="flip-back">
            <p class="category-emoji">{{ getEmoji(cat.productCategoriesId) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-container {
  padding: 2rem;
  text-align: center;
  background-color: #f7f3fa;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: #663399;
  margin-bottom: 2rem;
}

.category-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
}

.flip-box {
  width: 150px;
  height: 150px;
  perspective: 1000px;
}

.flip-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
}

.flip-box:hover .flip-inner {
  transform: rotateY(180deg);
}

.flip-front, .flip-back {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip-back {
  transform: rotateY(180deg); /* 背面 */
}

.category-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px #000;
}

.category-emoji {
  font-size: 2.5rem;
}
</style>