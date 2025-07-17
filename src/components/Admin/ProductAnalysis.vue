<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Bar, Doughnut, Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const purplePalette = [
  '#4A148C', '#6A1B9A', '#7B1FA2', '#8E24AA', '#9C27B0',
  '#AB47BC', '#BA68C8', '#CE93D8', '#E1BEE7', '#F3E5F5'
];

const loading = ref(true);
const chartData = ref(null);

const dateRange = ref({
  start: new Date(new Date().getFullYear(), 0, 1),
  end: new Date()
});

const fetchData = async () => {
  loading.value = true;
  try {
    const params = {
      startDate: dateRange.value.start.toISOString().split('T')[0],
      endDate: dateRange.value.end.toISOString().split('T')[0]
    };
    const response = await axios.get('/api/analysis/product', { params });
    chartData.value = response.data;
  } catch (error) {
    console.error("無法獲取產品分析數據:", error);
  } finally {
    loading.value = false;
  }
};

const categorySalesData = computed(() => ({
  labels: chartData.value?.categorySales.map(c => c.name) || [],
  datasets: [{
    data: chartData.value?.categorySales.map(c => c.totalQuantity) || [],
    backgroundColor: purplePalette,
    borderColor: '#ffffff',
    borderWidth: 2,
  }]
}));

const tagSalesData = computed(() => ({
  labels: chartData.value?.tagSales.map(t => t.name) || [],
  datasets: [{
    data: chartData.value?.tagSales.map(t => t.totalQuantity) || [],
    backgroundColor: purplePalette.slice(0,5).reverse(), // 取前5個顏色反轉
    borderColor: '#ffffff',
    borderWidth: 2,
  }]
}));

// 【新增】Sort 圖表的資料綁定
const sortSalesData = computed(() => ({
  labels: chartData.value?.sortSales.map(s => s.name) || [],
  datasets: [{
    data: chartData.value?.sortSales.map(s => s.totalQuantity) || [],
    backgroundColor: purplePalette.slice(5,10), // 取後5個顏色
    borderColor: '#ffffff',
    borderWidth: 2,
  }]
}));

const productSalesData = computed(() => ({
  labels: chartData.value?.productSales.map(p => p.name).reverse() || [],
  datasets: [{
    label: '銷售數量',
    data: chartData.value?.productSales.map(p => p.totalQuantity).reverse() || [],
    backgroundColor: 'rgba(126, 87, 194, 0.7)',
    borderColor: '#5E35B1',
    borderWidth: 1,
  }]
}));

// Chart Options 維持不變...
// --- Chart Options 的完整設定 ---
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                font: {
                    size: 14,
                    family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                }
            }
        }
    }
};

const doughnutChartOptions = { 
    ...commonOptions,
    plugins: {
        legend: { position: 'right', ...commonOptions.plugins.legend }
    }
};

const pieChartOptions = { 
    ...commonOptions,
    plugins: {
        legend: { position: 'right', ...commonOptions.plugins.legend }
    }
};

const horizontalBarChartOptions = {
    ...commonOptions,
    indexAxis: 'y', // 關鍵：讓長條圖變為水平
    plugins: {
        legend: { display: false },
    },
    scales: {
        x: {
            beginAtZero: true
        }
    }
};


onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="time-filter-controls mb-4">
      <p>時間篩選器區域 (暫用文字替代)</p>
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-if="!loading && chartData" class="all-charts-container">
      <div class="row">
        <div class="col-lg-4">
            <div class="card mb-4">
                <div class="card-header"><i class="fas fa-star me-1"></i>類別銷售排行</div>
                <div class="card-body" style="height: 350px;">
                    <Doughnut v-if="chartData?.categorySales?.length > 0" :data="categorySalesData" :options="doughnutChartOptions" />
                    <div v-else class="no-data-message">此區間無銷售數據</div>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card mb-4">
                <div class="card-header"><i class="fas fa-tags me-1"></i>標籤銷售排行</div>
                <div class="card-body" style="height: 350px;">
                    <Pie v-if="chartData?.tagSales?.length > 0" :data="tagSalesData" :options="pieChartOptions" />
                    <div v-else class="no-data-message">此區間無銷售數據</div>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card mb-4">
            <div class="card-header"><i class="fas fa-sort-amount-down me-1"></i>商品分類銷售排行</div>
                <div class="card-body" style="height: 350px;">
                    <Pie v-if="chartData?.sortSales?.length > 0" :data="sortSalesData" :options="pieChartOptions" />
                    <div v-else class="no-data-message">此區間無銷售數據</div>
                </div>
            </div>
        </div>
        </div>
      <div class="card mb-4">
            <div class="card-header"><i class="fas fa-trophy me-1"></i>產品銷售排行 (Top 10)</div>
            <div class="card-body" style="height: 400px;">
            <Bar v-if="chartData?.productSales?.length > 0" :data="productSalesData" :options="horizontalBarChartOptions" />
            <div v-else class="no-data-message">此區間無銷售數據</div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.no-data-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  font-size: 1.2rem;
}
.card-body {
  position: relative;
}
</style>