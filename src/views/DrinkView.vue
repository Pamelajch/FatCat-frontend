<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const catRef = ref(null)
const catX = ref(0)
const catY = ref(0)
let catFloatTimer = null

const colors = ['#ffffffcc', '#e2b8ffcc', '#ffe6aacc'] // 白、粉紫、淡金（都有透明度）

const particles = ref(Array.from({ length: 80 }, () => {
  const size = Math.random() * 4 + 2 // 2~6px
  return {
    top: Math.random() * 100 + '%',
    left: Math.random() * 100 + '%',
    size: size + 'px',
    duration: Math.random() * 4 + 3 + 's',
    delay: Math.random() * 5 + 's',
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: size < 3 ? 0.4 : 0.8
  }
}))

const DRINK_CATEGORY_ID = 10

const drinkSorts = ref([{ sortId: '', name: '全部' }])
const selectedSort = ref('')
const products = ref([])

const fetchDrinks = async () => {
  try {
    const res = await fetch(`https://localhost:7017/api/Products/filter?categoryId=${DRINK_CATEGORY_ID}`)
    const data = await res.json()

    data.forEach(p => {
      if (!p.imageUrl.startsWith('http')) {
        p.imageUrl = `https://localhost:7017/ProductImages/${encodeURIComponent(p.imageUrl)}`
      }
    })

    products.value = data
  } catch (err) {
    console.error('飲料資料取得失敗', err)
  }
}

const fetchDrinkSorts = async () => {
  try {
    const res = await fetch('https://localhost:7017/api/Sorts/byCategory/10')
    const data = await res.json()
    drinkSorts.value.push(...data)
  } catch (err) {
    console.error('取得飲料小分類失敗', err)
  }
}

const filteredProducts = computed(() => {
  if (!selectedSort.value) return products.value

  const selectedSortObj = drinkSorts.value.find(s => s.sortId == selectedSort.value)
  if (!selectedSortObj) return products.value

  return products.value.filter(p => p.sortName === selectedSortObj.name)
})

const cup = ref([])

const cupImage = computed(() =>
  cup.value.length === 0 ? '/cup1.png' : '/cup2.png'
)

const onDragStart = (event, item) => {
  event.dataTransfer.setData('product-id', item.productsId)
}

const onDrop = (event) => {
  const id = parseInt(event.dataTransfer.getData('product-id'))
  const product = products.value.find(p => p.productsId === id)
  if (product && !cup.value.some(p => p.productsId === id) && cup.value.length < 3) {
    cup.value.push(product)
  }
}

const removeFromCup = (index) => {
  cup.value.splice(index, 1)
}

// 貓貓預言師輪播
const messages = [
  '你確定這樣好喝嗎？',
  '本喵絕對不喝。',
  '你開心就好。',
  '這人腦袋有毛病…',
  '給本喵來100杯！'
]
const currentMessage = ref(messages[0])
let messageIndex = 0
let timer = null

onMounted(() => {
  fetchDrinks()
  fetchDrinkSorts()
  timer = setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length
    currentMessage.value = messages[messageIndex]
  }, 5000)
  floatCat()
  catFloatTimer = setInterval(floatCat, 3000)
})

onBeforeUnmount(() => {
  clearInterval(catFloatTimer)
})

const floatCat = () => {
  catX.value = Math.random() * 40 - 20 // -20 ~ +20 px
  catY.value = Math.random() * 30 - 15
  if (catRef.value) {
    catRef.value.style.transform = `translate(${catX.value}px, ${catY.value}px)`
  }
}

const runAway = () => {
  const x = Math.random() * 200 - 100
  const y = Math.random() * 150 - 75
  if (catRef.value) {
    catRef.value.style.transition = 'transform 0.5s ease'
    catRef.value.style.transform = `translate(${x}px, ${y}px)`
    setTimeout(floatCat, 1000) // 一秒後回復漂浮
  }
}
</script>

<template>
  <div class="drink-view">

    <!-- 上方主要互動區域 -->
    <div class="top-zone">
      <!-- 左：貓貓預言師 -->
      <div
        class="cat-zone"
        ref="catRef"
        @mouseenter="runAway"
      >
        <img src="/cat-head.png" class="cat-img glowy" />
        <div class="cat-message">{{ currentMessage }}</div>
      </div>

      <!-- 中：燒杯 -->
      <div class="cup-drop-area" @dragover.prevent @drop="onDrop">
        <img :src="cupImage" class="cup-img" />
      </div>

      <!-- 右：已加入的材料卡片 -->
      <div class="card-area">
        <div
          class="material-card"
          v-for="(item, index) in cup"
          :key="item.productsId"
        >
          <img :src="item.imageUrl" />
          <span class="material-name">{{ item.name }}</span>
          <button class="remove-btn" @click="removeFromCup(index)">❌</button>
        </div>
      </div>
    </div>

    <!-- 中下：篩選 -->
    <div class="filter-container">
      <div class="filter-card">
        <label for="sort-select">🧪 材料風格分類：</label>
        <select id="sort-select" v-model="selectedSort">
          <option v-for="sort in drinkSorts" :key="sort.sortId" :value="sort.sortId">
            {{ sort.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- 最下方：可拖曳材料清單 -->
    <div class="grid">
      <div
        v-for="item in filteredProducts"
        :key="item.productsId"
        class="ingredient-card"
        draggable="true"
        @dragstart="(event) => onDragStart(event, item)"
      >
        <img :src="item.imageUrl" :alt="item.name" />
        <h4>{{ item.name }}</h4>
        <p>{{ item.description }}</p>
      </div>
    </div>
    <!-- 星光粒子效果 -->
    <div class="particles">
      <div
        v-for="(p, i) in particles"
        :key="i"
        class="particle"
        :style="{
          top: p.top,
          left: p.left,
          width: p.size,
          height: p.size,
          background: p.color,
          opacity: p.opacity,
          animationDuration: p.duration,
          animationDelay: p.delay
        }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.drink-view {
  min-height: 100vh;
  padding: 2rem;
  background-image: url('/magicdrink.png');
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 毛玻璃遮罩效果 */
.drink-view::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1); /* 淡淡的霧感 */
  backdrop-filter: blur(14px);          /* 毛玻璃模糊 */
  z-index: 0;
}

/* 讓內容蓋在毛玻璃上面 */
.drink-view > * {
  position: relative;
  z-index: 1;
}

/* 上方：貓貓、杯子、已選材料 */
.top-zone {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 3rem;
  width: 100%;
}

/* 貓貓預言師 */
.cat-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 160px;
}
.cat-img {
  width: 100px;
  height: 100px;
}
.cat-message {
  margin-top: 10px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid #fff;
  border-radius: 12px;
  color: #a27bff;
  font-weight: bold;
  text-align: center;
  font-size: 14px;
  backdrop-filter: blur(4px);
  box-shadow: 0 0 10px rgba(200, 200, 255, 0.2);
  white-space: pre-line;
  min-width: 120px;
}

.glowy {
  filter: drop-shadow(0 0 10px #ffffff)
          drop-shadow(0 0 14px #e2b8ff)
          drop-shadow(0 0 20px #ffe6aa);
  transition: transform 0.5s ease;
  animation: glowPulse 4s ease-in-out infinite;
}

@keyframes glowPulse {
  0% {
    filter: drop-shadow(0 0 10px #ffffff)
            drop-shadow(0 0 14px #e2b8ff);
  }
  50% {
    filter: drop-shadow(0 0 16px #ffffff)
            drop-shadow(0 0 20px #ffddcc);
  }
  100% {
    filter: drop-shadow(0 0 10px #ffffff)
            drop-shadow(0 0 14px #e2b8ff);
  }
}

/* 杯子區域 */
.cup-drop-area {
  position: relative;
  width: 200px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
.cup-img {
  max-height: 100%;
  max-width: 100%;
}

/* 材料卡片（右側） */
.card-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.material-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #d8bbff;
  border-radius: 12px;
  backdrop-filter: blur(8px);
  box-shadow: 0 0 10px #a27bff80;
  animation: floatCard 4s infinite ease-in-out;
}
.material-card img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.material-name {
  font-weight: bold;
  color: #a27bff;
}
.remove-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  font-size: 20px;
  cursor: pointer;
  margin-left: auto;
}

/* 篩選區包裝容器：置中用 */
.filter-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 魔法小卡片樣式 */
.filter-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid #e0c3ff;
  border-radius: 16px;
  box-shadow: 0 0 12px #a27bff66;
  backdrop-filter: blur(10px);
  color: #fff;
  font-weight: bold;
  animation: floatCard 6s ease-in-out infinite;
}

/* 下拉選單樣式美化 */
.filter-card select {
  background: rgba(255, 255, 255, 0.15);
  color: black;
  padding: 8px 12px;
  border: 1px solid #d8bbff;
  border-radius: 10px;
  font-size: 14px;
  backdrop-filter: blur(6px);
  appearance: none;
  cursor: pointer;
  box-shadow: 0 0 6px #ffffff33;
}

.filter-card select:focus {
  outline: none;
  border-color: #ffccff;
  box-shadow: 0 0 8px #eac8ff;
}

/* 最下方：可拖曳材料清單 */
.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}
.ingredient-card {
  width: 160px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.466);
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  text-align: center;
  transition: transform 0.2s;
}
.ingredient-card:hover {
  transform: scale(1.05);
}
.ingredient-card img {
  width: 100%;
  border-radius: 10px;
}

/* 卡片漂浮動畫 */
@keyframes floatCard {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
}

/* 星光粒子效果 */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.particle {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  box-shadow: 0 0 8px currentColor;
  animation: twinkle 6s ease-in-out infinite, float 10s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(4px, -6px);
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>