import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    const items = ref([
        {
            id: 1,
            name: '一般般牛肉片',
            price: 5,
            quantity: 2,
            image: '/images/product1.jpg'
        },
        {
            id: 2,
            name: '一般般豬肉片',
            price: 4,
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

    const clearCart = () => {
        items.value = []
    }

    return {
        items,
        totalAmount,
        increaseQty,
        decreaseQty,
        removeItem,
        clearCart  // ✅ 新增這個
    }
})
