import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useCartStore = defineStore('cart', () => {
    const items = ref([
        {
            id: 1,
            name: '一般般牛肉片',
            price: 5,
            quantity: 2,
            image: '' // 將圖片欄位設為空，待 API 填入
        },
        {
            id: 2,
            name: '一般般豬肉片',
            price: 4,
            quantity: 1,
            image: ''
        },
        {
            id: 3,
            name: '烏龍麵',
            price: 3,
            quantity: 3,
            image: ''
        }
    ])

    const total = computed(() =>
        items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )

    // ✅ 抓主圖片 (呼叫 /api/ProductImages/byProduct/{id})
    async function fetchMainImage(productId) {
        try {
            const res = await axios.get(`/api/ProductImages/byProduct/${productId}`)
            const images = res.data

            // 找主圖 isMain = 1，如果沒有就取第一張
            const mainImage = images.find(img => img.isMain === 1) || images[0]
            return mainImage?.imageUrl || '/default.jpg'
        } catch (error) {
            console.error('取圖片失敗', error)
            return '/default.jpg'
        }
    }

    // ✅ 批次載入所有商品圖片
    async function loadImagesForCartItems() {
        for (const item of items.value) {
            item.image = await fetchMainImage(item.id)
        }
    }

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
        total,
        increaseQty,
        decreaseQty,
        setQty,
        removeItem,
        clearCart,
        loadImagesForCartItems // ✅ 暴露給外部使用
    }
})
