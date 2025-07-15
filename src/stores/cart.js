// stores/cart.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
    // ✅ 預設的假資料（開發用）
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

    // ✅ 商品總金額
    const total = computed(() =>
        items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )

    // 以下是操作方法
    const increaseQty = (item) => {
        const found = items.value.find(i => i.id === item.id)
        if (found) found.quantity++
    }

    const decreaseQty = (item) => {
        const found = items.value.find(i => i.id === item.id)
        if (found && found.quantity > 1) found.quantity--
    }

    function setQty(item, newQty) {
        const target = items.value.find(i => i.id === item.id)
        if (target) target.quantity = newQty
    }

    const removeItem = (itemId) => {
        items.value = items.value.filter(i => i.id !== itemId)
    }

    const clearCart = () => {
        items.value = []
    }

    return {
        items,
        total, // ✅ 這是給 PaymentInfo.vue 用的
        increaseQty,
        decreaseQty,
        setQty,
        removeItem,
        clearCart,
    }
})
