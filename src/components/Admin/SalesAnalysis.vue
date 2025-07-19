<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { Bar, Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Filler } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Filler);

// --- 粉色系調色盤 ---
const pinkPalette = {
  dark: 'rgba(219, 112, 147, 1)',  // PaleVioletRed
  light_bg: 'rgba(255, 182, 193, 0.6)', // LightPink with transparency
  medium_bg: 'rgba(219, 112, 147, 0.7)',
  line_fill: 'rgba(255, 182, 193, 0.25)',
  line_border: '#C71585' // MediumVioletRed
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
    const response = await axios.get('/api/analysis/sales', { params });
    chartData.value = response.data;
  } catch (error) {
    console.error("無法獲取銷售分析數據:", error);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(value);
};

// --- Computed Properties for Charts ---

const dailySalesData = computed(() => ({
  labels: chartData.value?.dailySales.map(d => d.label) || [],
  datasets: [{
    label: '日銷售額',
    data: chartData.value?.dailySales.map(d => d.value) || [],
    backgroundColor: pinkPalette.medium_bg,
    borderColor: pinkPalette.dark,
    borderWidth: 1,
    borderRadius: 5
  }]
}));

const yearRevenueData = computed(() => ({
  labels: chartData.value?.yearRevenueTrend.map(d => d.label) || [],
  datasets: [{
    label: '營業額',
    data: chartData.value?.yearRevenueTrend.map(d => d.value) || [],
    backgroundColor: pinkPalette.line_fill,
    borderColor: pinkPalette.dark,
    fill: true,
  }]
}));

const yearOrderCountData = computed(() => ({
  labels: chartData.value?.yearOrderCountTrend.map(d => d.label) || [],
  datasets: [{
    label: '訂單量',
    data: chartData.value?.yearOrderCountTrend.map(d => d.value) || [],
    backgroundColor: pinkPalette.light_bg,
    borderColor: pinkPalette.dark,
    borderWidth: 1,
  }]
}));

// --- Chart Options ---
const commonYAxisOptions = {
    y: {
        ticks: {
            callback: value => formatCurrency(value)
        },
        beginAtZero: true
    }
};

const lineChartOptions = { responsive: true, maintainAspectRatio: false, scales: commonYAxisOptions };
const barChartOptions = { responsive: true, maintainAspectRatio: false, scales: commonYAxisOptions };
const yearLineChartOptions = { ...lineChartOptions, plugins: { legend: { display: false } } };
const yearBarChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };


onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="time-filter-controls mb-4">
      <!-- <p>時間篩選器區域 (暫用文字替代)</p> -->
    </div>

    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-if="!loading && chartData" class="all-charts-container">
      
      <div class="row">
        
        <div class="col-xl-6">
            <div class="card mb-4 ">
                <div class="card-header"><i class="fas fa-wallet me-1"></i> 本月目前銷售總額</div>
                <div class="card-body d-flex justify-content-center align-items-center">
                    <div class="text-center">
                        <h2 class="display-6 display-md-5 fw-semibold kpi-number">
                            {{ formatCurrency(chartData.selectedRangeTotalRevenue) }}
                        </h2>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-6">
          <div class="card mb-4">
            <div class="card-header"><i class="fas fa-chart-bar me-1"></i>每日銷售額</div>
            <div class="card-body" style="height: 320px;">
              <Bar v-if="chartData?.dailySales?.length > 0" :data="dailySalesData" :options="barChartOptions" />
              <div v-else class="no-data-message">此區間無銷售數據</div>
            </div>
          </div>
        </div>

      </div> <div class="row">
        
        <div class="col-xl-6">
          <div class="card mb-4">
            <div class="card-header"><i class="fas fa-dollar-sign me-1"></i>今年營業額趨勢圖</div>
            <div class="card-body" style="height: 320px;">
              <Line v-if="chartData?.yearRevenueTrend?.length > 0" :data="yearRevenueData" :options="yearLineChartOptions" />
              <div v-else class="no-data-message">今年尚無銷售數據</div>
            </div>
          </div>
        </div>

        <div class="col-xl-6">
          <div class="card mb-4">
            <div class="card-header"><i class="fas fa-file-invoice me-1"></i>今年訂單量統計圖</div>
            <div class="card-body" style="height: 320px;">
              <Bar v-if="chartData?.yearOrderCountTrend?.length > 0" :data="yearOrderCountData" :options="yearBarChartOptions" />
              <div v-else class="no-data-message">今年尚無訂單</div>
            </div>
          </div>
        </div>

      </div> <div class="card mb-4">
        <div class="card-header"><i class="fas fa-table me-1"></i>銷售數據明細</div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>日期</th>
                  <th class="text-end">銷售總額</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="chartData?.salesDetails?.length === 0">
                  <td colspan="2" class="text-center">此區間無銷售數據</td>
                </tr>
                <tr v-for="item in chartData.salesDetails" :key="item.date">
                  <td>{{ item.date }}</td>
                  <td class="text-end">{{ formatCurrency(item.amount) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div> </div> 
    
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
.table-responsive {
  max-height: 400px; /* 讓表格可以滾動 */
}
.text-end {
  text-align: right;
}
.kpi-container h2 {
  color: #C71585; /* 使用粉色系的主色調 */
}
.kpi-number {
  color: #C71585; /* 使用粉色系的主色調 */
}
</style>