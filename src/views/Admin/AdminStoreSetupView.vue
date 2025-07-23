<script setup>
import { ref } from 'vue'

const tabs = ['商品種類', '商品小分類', '商品標籤']
const activeTab = ref(tabs[0])
</script>

<template>
  <div class="setting-wrapper">
    <h2>🛠️ 賣場設置</h2>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab"
        :class="{ active: tab === activeTab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- 區塊內容 -->
    <div class="tab-content">
      <!-- 商品種類 -->
      <div v-if="activeTab === '商品種類'">
        <h3>📂 商品種類管理</h3>
        <p>這裡會顯示所有商品種類，並提供新增、編輯、刪除功能。</p>
      </div>

      <!-- 商品小分類 -->
      <div v-if="activeTab === '商品小分類'">
        <h3>🧩 商品小分類管理</h3>
        <p>這裡可根據種類篩選，並管理小分類資料。</p>
      </div>

      <!-- 商品標籤 -->
      <div v-if="activeTab === '商品標籤'">
        <h3>🏷️ 商品標籤管理</h3>
        <p>列出全部標籤並可新增 / 修改 / 刪除。</p>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.setting-wrapper {
  padding: 2rem;
  background: #f9f6ff;
  border-radius: 16px;
  box-shadow: 0 0 12px rgba(120, 100, 200, 0.1);
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: #e0d4f7;
  color: #4b2ca0;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}

.tabs button.active {
  background: #7c4dff;
  color: white;
}

.tab-content {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 0 8px rgba(180, 160, 240, 0.1);
}
</style>