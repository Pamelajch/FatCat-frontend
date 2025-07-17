<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Bar, Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

// --- 1. 定義一個漂亮的藍色系調色盤 ---
const bluePalette = {
  darkest: '#0d47a1',    // 最深藍
  dark: '#1976d2',       // 深藍
  medium: '#2196f3',     // 主藍色 (Material Design Blue)
  light: '#64b5f6',      // 淺藍
  lightest: '#bbdefb',   // 最淺藍
  // 帶透明度的版本，用於背景做出層次感
  medium_bg: 'rgba(33, 150, 243, 0.6)',
  dark_hover: 'rgba(25, 118, 210, 0.9)'
};

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
    const response = await axios.get('/api/analysis/member', { params });
    chartData.value = response.data;
  } catch (error) {
    console.error("無法獲取會員分析數據:", error);
  } finally {
    loading.value = false;
  }
};

// --- 2. 更新 Computed Properties 來使用新色盤 ---

// 新註冊會員趨勢
const newMemberTrendData = computed(() => ({
  labels: chartData.value?.newMemberTrend.labels || [],
  datasets: [{ 
    label: '新會員數',
    data: chartData.value?.newMemberTrend.values || [],
    backgroundColor: bluePalette.medium_bg,
    borderColor: bluePalette.medium,
    borderWidth: 2,
    hoverBackgroundColor: bluePalette.dark_hover,
    borderRadius: 5,
  }]
}));

// 會員忠誠度分布 (環圈圖)
const loyaltyDistributionData = computed(() => ({
  labels: chartData.value?.loyaltyDistribution.labels || [],
  datasets: [{
    data: chartData.value?.loyaltyDistribution.values || [],
    // 直接使用調色盤，Chart.js 會自動為每個區塊分配顏色
    backgroundColor: [bluePalette.darkest, bluePalette.dark, bluePalette.medium, bluePalette.light],
    borderColor: '#ffffff', // 加上白色邊框讓區塊更分明
    borderWidth: 2,
  }]
}));

// 高消費會員排行榜
const topSpendersData = computed(() => ({
    labels: chartData.value?.topSpenders.map(u => u.userName).reverse() || [],
    datasets: [{
        label: '消費總額 (NT$)',
        data: chartData.value?.topSpenders.map(u => u.totalAmount).reverse() || [],
        backgroundColor: bluePalette.dark,
        borderColor: bluePalette.darkest,
        borderWidth: 1,
        hoverBackgroundColor: bluePalette.darkest
    }]
}));

// 會員性別分布 (環圈圖)
const genderDistributionData = computed(() => ({
    labels: chartData.value?.genderDistribution.map(g => g.key) || [],
    datasets: [{
        data: chartData.value?.genderDistribution.map(g => g.count) || [],
        // 為性別指定特定顏色，例如藍色代表男性，粉色代表女性
        backgroundColor: [
            bluePalette.medium, // 男性
            '#e91e63',      // 女性 (粉色)
            '#9e9e9e'       // 未提供 (灰色)
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
    }]
}));

// 會員年齡分布
const ageDistributionData = computed(() => ({
    labels: chartData.value?.ageDistribution.map(a => a.key) || [],
    datasets: [{
        label: '會員人數',
        data: chartData.value?.ageDistribution.map(a => a.count) || [],
        backgroundColor: bluePalette.light,
        borderColor: bluePalette.medium,
        borderWidth: 1,
        borderRadius: 5,
    }]
}));


// --- Chart Options (可以微調讓圖表更美觀) ---
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                // 字體可以稍微調整
                font: {
                    size: 14,
                    family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                }
            }
        }
    }
};

const barChartOptions = { 
    ...commonOptions,
    scales: {
        x: {
            ticks: { color: '#333' }
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#333' }
        }
    }
};

const doughnutChartOptions = { 
    ...commonOptions,
    plugins: {
        legend: { position: 'right', ...commonOptions.plugins.legend }
    }
};

const horizontalBarChartOptions = {
    ...commonOptions,
    indexAxis: 'y',
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
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-header"><i class="fas fa-user-plus me-1"></i> 新註冊會員趨勢</div>
            <div class="card-body" style="height: 300px;">
              <Bar v-if="chartData?.newMemberTrend?.Values?.length > 0" :data="newMemberTrendData" :options="barChartOptions" />
              <div v-else class="no-data-message">此區間無新註冊會員</div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
            <div class="card mb-4">
                <div class="card-header"><i class="fas fa-venus-mars me-1"></i> 會員性別分布</div>
                <div class="card-body" style="height: 300px;">
                    <Doughnut v-if="chartData?.genderDistribution?.length > 0" :data="genderDistributionData" :options="doughnutChartOptions" />
                    <div v-else class="no-data-message">無會員數據</div>
                </div>
            </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-lg-4">
          <div class="card mb-4">
            <div class="card-header"><i class="fas fa-shopping-basket me-1"></i> 會員忠誠度分佈</div>
            <div class="card-body" style="height: 300px;">
              <Doughnut v-if="chartData?.loyaltyDistribution?.Values?.length > 0" :data="loyaltyDistributionData" :options="doughnutChartOptions" />
              <div v-else class="no-data-message">此區間無訂單數據</div>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
            <div class="card mb-4">
                <div class="card-header"><i class="fas fa-birthday-cake me-1"></i> 會員年齡分布</div>
                <div class="card-body" style="height: 300px;">
                    <Bar v-if="chartData?.ageDistribution?.length > 0" :data="ageDistributionData" :options="barChartOptions" />
                    <div v-else class="no-data-message">無會員數據</div>
                </div>
            </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><i class="fas fa-crown me-1"></i> 高消費會員排行榜 (Top 10)</div>
        <div class="card-body" style="height: 400px;">
          <Bar v-if="chartData?.topSpenders?.length > 0" :data="topSpendersData" :options="horizontalBarChartOptions" />
          <div v-else class="no-data-message">此區間無消費紀錄</div>
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
</style>