<script setup>
import { ref, onMounted } from 'vue'

const cards = ref([])
const selectedIndex = ref(null)
const mode = ref('loading')

// 撈取特殊泡麵
const fetchSpecialNoodles = async () => {
  try {
    const res = await fetch('https://localhost:7017/api/Products/special')
    const data = await res.json()
    cards.value = data.slice(0, 6).map(p => ({
      name: p.name,
      image: `/ProductImages/${p.imageUrl}`,
      description: p.description || '一碗神秘的泡麵...'
    }))
  } catch (err) {
    console.error('泡麵資料取得失敗', err)
  }
}

const startDraw = () => {
  mode.value = 'spinning'
  // 模擬洗牌動畫延遲
  setTimeout(() => {
    selectedIndex.value = Math.floor(Math.random() * cards.value.length)
    mode.value = 'result'
  }, 1200)
}

const reset = () => {
  mode.value = 'loading'
  selectedIndex.value = null
}

const addToCart = (noodle) => {
  alert(`已將 ${noodle.name} 加入購物車！`)
}

onMounted(() => {
  fetchSpecialNoodles()
})
</script>

<template>
  <div class="tarot-container">
  <h1 class="title">今日的命運泡麵是...</h1>

  <!-- 包住卡牌的容器 -->
  <div class="cards-wrapper">
    <div
      v-for="(card, index) in cards"
      :key="index"
      class="card"
    >
      <div
        class="card-inner"
        :class="{ flipped: selectedIndex === index && mode === 'result' }"
      >
        <!-- 背面 -->
        <div class="card-back">
          <img src="/card-back.png" alt="卡牌背面" />
        </div>
        <!-- 正面 -->
        <div class="card-front">
          <img :src="card.image" alt="泡麵圖" />
          <h3>{{ card.name }}</h3>
        </div>
      </div>
    </div>
  </div>

  <!-- START 按鈕 -->
  <button v-if="mode === 'loading'" class="start-btn" @click="startDraw">START</button>

  <!-- 結果 -->
  <div v-if="mode === 'result'" class="result-info">
    <p>{{ cards[selectedIndex].description }}</p>
    <div class="result-actions">
      <button @click="reset">再抽一次</button>
      <button @click="addToCart(cards[selectedIndex])">加入購物車</button>
    </div>
  </div>
</div>
</template>

<style scoped>
.tarot-container {
  background: linear-gradient(to bottom, #2c003e, #5b108c);
  color: white;
  min-height: 100vh;
  padding: 2rem 1rem;
  text-align: center;
}

.cards-wrapper {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 每排 3 張 */
  gap: 1.5rem;
  justify-content: center;
  margin: 2rem auto;
  max-width: 700px;
}

.card {
  width: 150px;
  height: 220px;
  perspective: 1000px;
  position: relative;
  overflow: visible; /* 防止動畫溢出被切到 */
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.8s ease;
  transform-style: preserve-3d;
}

.card-inner.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #999;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
}

.card-back {
  min-width: 100%;
  min-height: 100%;
  background-color: #fff;
  transform: rotateY(0deg);
  display: flex; /* 圖片置中並撐滿容器 */
  align-items: center;
  justify-content: center;
}

.card-back img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 避免圖片拉爆、被切角 */
  padding: 10px;
}

.card-front {
  background: #fff;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.card-front h3 {
  font-size: 14px;
  margin-top: 0.5rem;
  color: #333;
}

.card-front img {
  width: 100%;
  height: 120px;
  object-fit: contain;
  padding: 10px;
}

.card.flipped {
  transform: rotateY(180deg);
}

.start-btn {
  margin-top: 2rem;
  font-size: 24px;
  padding: 12px 32px;
  background: linear-gradient(45deg, #ff94d4, #cc7eff);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: white;
  font-weight: bold;
  transition: transform 0.2s;
}

.start-btn:hover {
  transform: scale(1.05);
}

.result-info {
  margin-top: 2rem;
}

.result-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.result-actions button {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: bold;
  background: #fff;
  border: none;
  color: #5b108c;
  cursor: pointer;
}

.result-actions button:hover {
  background: #eee;
}
</style>
