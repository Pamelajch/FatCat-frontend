<script setup>
import { ref } from 'vue';
import ReportList from '../components/ReportList.vue'; // 引入我們等下要做的子元件

const activeTab = ref('reports'); // 'reports' 或 'appeals'
</script>

<template>
  <div class="container my-5 feedback-view">
    <h2 class="mb-4">進度追蹤</h2>

    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'reports' }" 
          href="#" 
          @click.prevent="activeTab = 'reports'"
        >
          檢舉紀錄
        </a>
      </li>
      <li class="nav-item">
        <a 
          class="nav-link" 
          :class="{ active: activeTab === 'appeals' }" 
          href="#" 
          @click.prevent="activeTab = 'appeals'"
        >
          申訴紀錄
        </a>
      </li>
    </ul>

    <div class="tab-content">
      <div v-if="activeTab === 'reports'">
        <ReportList />
      </div>

      <div v-if="activeTab === 'appeals'" class="text-center text-muted p-5">
        <p class="fs-4">申訴功能還沒寫ㄎㄎ！</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feedback-view {
  max-width: 960px;
}
.nav-tabs .nav-link {
  color: #6c757d;
}
.nav-tabs .nav-link.active {
  color: #495057;
  background-color: #fff;
  border-color: #dee2e6 #dee2e6 #fff;
  font-weight: 500;
}
</style>