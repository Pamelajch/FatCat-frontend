import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import axios from 'axios'

export const useCartStore = defineStore('cart', () => {
    const items = ref(JSON.parse(localStorage.getItem('cart')) || [
        // { 
        //     id: 1,
        //     name: '一般般牛肉片',
        //     price: 5,
        //     quantity: 2,
        //     image: ''
        // },
        // {
        //     id: 2,
        //     name: '一般般豬肉片',
        //     price: 4,
        //     quantity: 1,
        //     image: ''
        // },
        // {
        //     id: 3,
        //     name: '烏龍麵',
        //     price: 3,
        //     quantity: 3,
        //     image: ''
        // }
    ])

    const total = computed(() =>
        items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )

    // ✅ 加入購物車功能（避免重複）
    function addItem(product) {
        if (!product) {
            console.warn('加入購物車失敗，product 為 undefined')
            return
        }

        const productId = product.productsId || product.id
        const found = items.value.find(i => i.id === productId)

        if (found) {
            found.quantity += 1
        } else {
            items.value.push({
                id: productId,
                name: product.name,
                price: product.price ?? 0,
                quantity: 1,
                image: product.image || ''
            })
        }
    }


    // ✅ 自動同步至 localStorage
    watch(items, (val) => {
        localStorage.setItem('cart', JSON.stringify(val))
    }, { deep: true })

    // ✅ 抓主圖片
    async function fetchMainImage(productId) {
        if (!productId) return '/default.jpg'

        try {
            const res = await axios.get(`/api/ProductImages/byProduct/${productId}`)
            const images = res.data || []

            const mainImage = images.find(img => img.isMain === 1) || images[0]
            return mainImage?.imageUrl || '/default.jpg'
        } catch (error) {
            console.error(`取圖片失敗 [商品 ID: ${productId}]`, error)
            return '/default.jpg'
        }
    }


    // ✅ 批次載入圖片
    async function loadImagesForCartItems() {
        for (const item of items.value) {
            if (!item.id) {
                console.warn('商品 ID 缺失，無法載入圖片', item)
                item.image = '/default.jpg'
                continue
            }
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
        addItem, // ✅ ⬅️ 一定要有這個才不會出錯
        increaseQty,
        decreaseQty,
        setQty,
        removeItem,
        clearCart,
        loadImagesForCartItems
    }
})
