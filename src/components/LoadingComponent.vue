<script setup>
import { ref, onMounted } from 'vue'

const scrollContainer = ref(null)

let isDown = false
let startX
let scrollLeft
let velocity = 0
let animationFrame

onMounted(() => {
  const container = scrollContainer.value

  container.addEventListener('mousedown', (e) => {
    isDown = true
    startX = e.pageX - container.offsetLeft
    scrollLeft = container.scrollLeft
    cancelAnimationFrame(animationFrame)
  })

  container.addEventListener('mouseleave', () => {
    isDown = false微調
  })

  container.addEventListener('mouseup', () => {
    isDown = false
    inertiaScroll()
  })

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - container.offsetLeft
    const walk = (x - startX)
    velocity = walk - (container.scrollLeft - scrollLeft)
    container.scrollLeft = scrollLeft - walk
  })

  function inertiaScroll() {
    const damping = 0.95 // 摩擦係數
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
    <div>
        <img src="/logofont.png" alt="logo" class="logo" />
    </div>
        
    <h2 class="loading-text">你今天想吃啥？</h2>
    
    <button class="start-button">START</button>

    <div ref="scrollContainer" class="noodles-wrapper">
      <div class="noodles-row">
        <img v-for="n in 30" :key="n" src="/LoadingNoodle.png" alt="cup noodle" class="noodle-img" />
      </div>
    </div>
    
  </div>
</template>

<style scoped>
.loading-text {
  font-size: 70px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.loading-container {
  background-color: #c99cd3;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
}

.start-button {
  background-color: #f8b63d;
  color: white;
  padding: 15px 45px;     /* 加大內距（上下/左右） */
  font-size: 2rem;        /* 放大字體 */
  font-weight: bold;
  border: none;
  border-radius: 50px;    /* 更圓一點 */
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0,0,0,0.25);  /* 陰影更明顯 */
  transition: background-color 0.2s ease;
}

.start-button:hover {
  background-color: #e9a029;
}

.noodles-wrapper {
  width: 100%;
  overflow-x: auto;
  cursor: grab;
  user-select: none;
  /* 隱藏滾輪樣式 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.noodles-wrapper::-webkit-scrollbar {
  display: none; /* Chrome / Safari */
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
  width: 400px;
  height: auto;
  flex-shrink: 0;
  pointer-events: none;
}

.logo {
  width: 400px;
}
</style>