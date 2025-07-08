<script setup>
import ReviewComponent from '../components/ReviewComponent.vue';
</script>

<template>
  <div class="container">
    <h1>這是評論元件的測試頁面</h1>
    <hr>
    <!-- 
      我們在這裡使用 ReviewComponent，
      並手動提供一個「假的」產品 ID 給它，例如 1。
      這樣它就能去呼叫 /api/products/1/reviews 來抓取資料。
    -->
    <ReviewComponent :product-id="1" />
  </div>
</template>