<script setup>
import { ref, onMounted, nextTick } from 'vue'

const scrollContainer = ref(null)
const mode = ref('loading') // 'loading' | 'spinning' | 'result'
const selectedNoodle = ref(null)
let animationFrame
let isDown = false
let startX, scrollLeft, velocity = 0

const specialNoodles = ref([
  {
    id: 1,
    name: '天降龍蝦泡麵',
    image: 'LoadingNoodle.png',
    description: '豪華龍蝦大餐，只給特別的你 🍜🦞',
  },
  {
    id: 2,
    name: '滿漢大雞腿麵',
    image: 'LoadingNoodle.png',
    description: '雞腿大到蓋不住的幸福！🍗',
  },
  {
    id: 3,
    name: '印尼炒泡麵特辣版！！',
    image: 'LoadingNoodle.png',
    description: '來自南洋的辣味衝擊🔥🌶️',
  },
])

// START 按鈕 disable 防連點
const startDraw = async () => {
  if (mode.value === 'spinning') return
  mode.value = 'spinning'
  selectedNoodle.value = null
  await nextTick()
  const container = scrollContainer.value
  let scrollSpeed = 80
  let spinTime = 1500
  let start = null

  const spin = (timestamp) => {
    if (!start) start = timestamp
    const elapsed = timestamp - start
    scrollSpeed *= 0.97
    container.scrollLeft += scrollSpeed

    if (elapsed < spinTime) {
      animationFrame = requestAnimationFrame(spin)
    } else {
      const index = Math.floor(Math.random() * specialNoodles.value.length)
      selectedNoodle.value = specialNoodles.value[index]
      mode.value = 'result'
    }
  }

  requestAnimationFrame(spin)
}

const addToCart = (noodle) => {
  alert(`已將 ${noodle.name} 加入購物車！`)
}

onMounted(() => {
  const container = scrollContainer.value
  if (!container) return

  container.addEventListener('mousedown', (e) => {
    isDown = true
    startX = e.pageX - container.offsetLeft
    scrollLeft = container.scrollLeft
    cancelAnimationFrame(animationFrame)
  })

  container.addEventListener('mouseleave', () => {
    isDown = false
  })

  container.addEventListener('mouseup', () => {
    isDown = false
    inertiaScroll()
  })

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = x - startX
    velocity = walk - (container.scrollLeft - scrollLeft)
    container.scrollLeft = scrollLeft - walk
  })

  function inertiaScroll() {
    const damping = 0.95
    function animate() {
      velocity *= damping
      container.scrollLeft -= velocity
      if (Math.abs(velocity) > 0.5) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    animate()
  }
})
</script>

<template>
  <div class="loading-container">
    <!-- logo：除了結果都顯示 -->
    <img v-if="mode !== 'result'" src="/logofont.png" alt="logo" class="logo" />

    <!-- 標題：除了結果都顯示 -->
    <h2 v-if="mode !== 'result'" class="loading-text">你今天想吃啥？</h2>

    <!-- START 按鈕：除了結果都顯示，spinning 時 disable -->
    <button
      v-if="mode !== 'result'"
      class="start-button"
      :disabled="mode === 'spinning'"
      @click="startDraw"
    >
      START
    </button>

    <!-- 泡麵輪播動畫：除了結果都顯示 -->
    <div v-if="mode !== 'result'" ref="scrollContainer" class="noodles-wrapper">
      <div class="noodles-row">
        <img v-for="n in 30" :key="n" src="/LoadingNoodle.png" alt="cup noodle" class="noodle-img" />
      </div>
    </div>

    <!-- 抽出結果 -->
    <div v-if="mode === 'result'" class="draw-result">
      <h1 class="result-name-overlay">{{ selectedNoodle.name }}</h1>
      <img :src="selectedNoodle.image" :alt="selectedNoodle.name" class="result-img" />
    </div>

    <!-- 結果按鈕 -->
    <div v-if="mode === 'result'" class="result-buttons">
      <button class="draw-again-btn" @click="mode = 'loading'">再抽一次</button>
      <button class="add-to-cart-btn" @click="addToCart(selectedNoodle)">加入購物車</button>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  background-color: #c99cd3;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  text-align: center;
  padding-top: 30px;
}

.loading-text {
  font-size: 70px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.start-button {
  background-color: #f8b63d;
  color: white;
  padding: 15px 45px;
  font-size: 2rem;
  font-weight: bold;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
  transition: background-color 0.2s ease;
  margin-bottom: 1rem;
}
.start-button:hover {
  background-color: #e9a029;
}

.noodles-wrapper {
  width: 100%;
  height: 250px;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  user-select: none;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.noodles-wrapper::-webkit-scrollbar {
  display: none;
}
.noodles-row {
  display: flex;
  justify-content: center;
  gap: 50px;
  flex-wrap: nowrap;
  margin-top: 20px;
  padding: 10px;
}
.noodle-img {
  width: 350px;
  height: auto;
  flex-shrink: 0;
  pointer-events: none;
}
.logo {
  width: 400px;
}

.draw-result {
  margin-top: 40px;
  position: relative;
}
.result-img {
  max-width: 600px;
  width: 100%;
  height: auto;
  z-index: 1;
}
.result-name-overlay {
  font-size: 50px;
  color: white;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
  font-weight: bold;
  margin-bottom: -30px;
  position: relative;
  z-index: 2;
}

.result-buttons {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
  transform: translateY(-50%);
}

.draw-again-btn,
.add-to-cart-btn {
  padding: 12px 30px;
  font-size: 18px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  background-color: #f8b63d;
  color: white;
}
</style>
