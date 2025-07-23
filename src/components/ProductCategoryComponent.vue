<script setup>
import { ref, onMounted } from 'vue'

const categories = ref([])

const fetchCategories = async () => {
  try {
    const res = await fetch('https://localhost:7017/api/ProductCategories')
    const data = await res.json()
    categories.value = data.filter(cat => cat.productCategoriesId !== 9) // 過濾特殊款泡麵
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
    6: '#66B3FF',  // 調味料
    7: '#FFD700', // 蛋奶類 🥚🧀
    8: '#A0A0A0'  // 古怪食物 🌀
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
    6: '🧂', // 調味料
    7: '🥚', // 蛋奶類
    8: '🌀'  // 古怪食物
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
        <div class="flip-inner">
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
  background: linear-gradient(135deg, #1d0b28, #462a6f, #8949b7);
}

.title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #fff;
  text-shadow:
    0 0 6px #fff,
    0 0 10px #d4bfff,
    0 0 20px #c780ff;
  margin-bottom: 2rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 每列 4 個 */
  gap: 1rem;
  justify-items: center;
}

.flip-box {
  width: 180px;
  height: 180px;
  perspective: 1000px;
}

.flip-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s;
  background-image: url('/coin.png'); 
  background-size: cover;
  background-position: center;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
  cursor: pointer;
}

.flip-box:hover .flip-inner {
  transform: rotateY(180deg);
  box-shadow: 0 0 18px 6px rgba(215, 190, 255, 0.6);
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
  transform: translateZ(5px);
}

.flip-back {
  transform: rotateY(180deg);
}

.category-name {
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  text-shadow:
    0 0 5px #ffffff,
    0 0 10px #d4bfff,
    0 0 15px #cba3ff,
    0 0 20px #b678ff;
  text-align: center;
}

.category-emoji {
  font-size: 2.5rem;
}
</style>