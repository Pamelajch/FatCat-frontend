import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    const items = ref([
        {
            id: 1,
            name: '貓咪罐頭',
            price: 80,
            quantity: 2,
            image: '/images/product1.jpg'
        },
        {
            id: 2,
            name: '貓抓板',
            price: 150,
            quantity: 1,
            image: '/images/product2.jpg'
        }
    ])

    const totalAmount = computed(() =>
        items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )

    const increaseQty = (item) => {
        item.quantity++
    }

    const decreaseQty = (item) => {
        if (item.quantity > 1) item.quantity--
    }

    const removeItem = (itemId) => {
        items.value = items.value.filter(i => i.id !== itemId)
    }

    return {
        items,
        totalAmount,
        increaseQty,
        decreaseQty,
        removeItem
    }
})
