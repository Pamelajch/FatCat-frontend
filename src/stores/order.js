// src/stores/order.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useOrderStore = defineStore('order', () => {
    const latestOrderItems = ref([])
    const orders = ref([]) // ✅ 訂單列表

    const setOrderItems = (items) => {
        latestOrderItems.value = JSON.parse(JSON.stringify(items))

        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

        // ⬇️ 模擬產生一筆訂單
        const newOrder = {
            id: Date.now(),
            orderNumber: 'ORD' + Date.now().toString().slice(-5),
            status: '未處理',
            amount: `$${total}`,
            items: JSON.parse(JSON.stringify(items))

        }

        orders.value.unshift(newOrder) // 新訂單加入到 orders 列表
    }

    return {
        latestOrderItems,
        orders,
        setOrderItems
    }
})
