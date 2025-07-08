<script setup>
// Composition API 可以留空，之後加上 click 事件或動畫
</script>

<template>
  <div class="loading-container">

    <h2>你今天想吃啥？</h2>
    
    <button class="start-button">START</button>

    <div class="noodles-row">
      <img v-for="n in 7" :key="n" src="/LoadingNoodle.png" alt="cup noodle" class="noodle-img" />
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  background-color: #c99cd3; /* 紫色背景 */
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: relative;
}

.logo {
  width: 80px;
  position: absolute;
  top: 20px;
  left: 20px;
}

.start-button {
  background-color: #f8b63d;
  color: white;
  padding: 10px 20px;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  transition: background-color 0.2s ease;
}

.start-button:hover {
  background-color: #e9a029;
}

.noodles-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: nowrap;
  margin-top: 20px;
}

.noodle-img {
  width: 80px;
  height: auto;
}
</style>