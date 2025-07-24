<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const DRINK_CATEGORY_ID = 99

const drinkSorts = [
  { sortId: '', name: '全部' },
  { sortId: 1, name: '幻覺系' },
  { sortId: 2, name: '力量系' },
  { sortId: 3, name: '治癒系' },
  { sortId: 4, name: '時間系' },
  { sortId: 5, name: '靈魂系' },
]

const selectedSort = ref('')
const products = ref([
  { productsId: 201, name: '星光精華', categoryId: DRINK_CATEGORY_ID, sortId: 1, imageUrl: '/magic.png', description: '閃爍微光的神秘液體' },
  { productsId: 202, name: '夢境露滴', categoryId: DRINK_CATEGORY_ID, sortId: 1, imageUrl: '/magic.png', description: '散發淡紫色迷霧的濃縮露' },
  { productsId: 203, name: '龍焰汁', categoryId: DRINK_CATEGORY_ID, sortId: 2, imageUrl: '/magic.png', description: '熱辣噴發，據說能暫時提高攻擊力' },
  { productsId: 204, name: '猛虎液', categoryId: DRINK_CATEGORY_ID, sortId: 2, imageUrl: '/magic.png', description: '讓你如猛虎出柙，活力暴增' },
  { productsId: 205, name: '綠意茶', categoryId: DRINK_CATEGORY_ID, sortId: 3, imageUrl: '/magic.png', description: '充滿生命力的草本飲' },
  { productsId: 206, name: '柔光蜜露', categoryId: DRINK_CATEGORY_ID, sortId: 3, imageUrl: '/magic.png', description: '甜甜的療癒飲品，據說能穩定心神' },
  { productsId: 207, name: '時光沙', categoryId: DRINK_CATEGORY_ID, sortId: 4, imageUrl: '/magic.png', description: '喝了會覺得時間放慢一點點' },
  { productsId: 208, name: '回憶之泉', categoryId: DRINK_CATEGORY_ID, sortId: 4, imageUrl: '/magic.png', description: '讓你回憶起最溫柔的瞬間' },
  { productsId: 209, name: '幽冥花茶', categoryId: DRINK_CATEGORY_ID, sortId: 5, imageUrl: '/magic.png', description: '泡製靈魂的花朵，略帶苦味' },
  { productsId: 210, name: '月影之酒', categoryId: DRINK_CATEGORY_ID, sortId: 5, imageUrl: '/magic.png', description: '濃郁如夜色，深沉如靈魂的低語' }
])

const filteredProducts = computed(() => {
  if (!selectedSort.value) return products.value
  return products.value.filter(p => p.sortId === Number(selectedSort.value))
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
  timer = setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length
    currentMessage.value = messages[messageIndex]
  }, 5000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="drink-view">

    <!-- 上方主要互動區域 -->
    <div class="top-zone">
      <!-- 左：貓貓預言師 -->
      <div class="cat-zone">
        <img src="/cat-head.png" class="cat-img" />
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
    <div class="filter-bar">
      <label>材料風格分類：</label>
      <select v-model="selectedSort">
        <option v-for="sort in drinkSorts" :key="sort.sortId" :value="sort.sortId">
          {{ sort.name }}
        </option>
      </select>
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

/* 👉 上方：貓貓、杯子、已選材料 */
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

/* 中下方：分類篩選 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
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
  background: rgba(255, 255, 255, 0.1);
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
</style>