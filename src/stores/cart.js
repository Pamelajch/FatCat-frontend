import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import axios from 'axios'

export const useCartStore = defineStore('cart', () => {
    const items = ref(JSON.parse(localStorage.getItem('cart')) || [])
    const cartItemIds = ref(JSON.parse(localStorage.getItem('cartItemIds')) || [])

    const total = computed(() =>
        items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    )

    function addItem(product) {
        const id = product.productsId || product.id
        const found = items.value.find(i => i.id === id)
        if (found) {
            found.quantity += 1
        } else {
            items.value.push({
                id,
                name: product.name,
                price: product.price ?? 0,
                quantity: 1,
                image: product.image || ''
            })
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
        const found = items.value.find(i => i.id === item.id)
        if (found) found.quantity = newQty
    }

    const removeItem = (itemId) => {
        items.value = items.value.filter(i => i.id !== itemId)
    }

    const clearCart = () => {
        items.value = []
        cartItemIds.value = []
        localStorage.removeItem('cart')
        localStorage.removeItem('cartItemIds')
    }

    // 載入購物車商品主圖（呼叫此函式會逐一載入每個商品的主圖並更新 items 裡的 image）
    async function loadImagesForCartItems() {
        for (const item of items.value) {
            item.image = await fetchMainImage(item.id)
        }
    }

    async function fetchMainImage(productId) {
        try {
            const res = await axios.get(`/api/ProductImages/byProduct/${productId}`)
            const images = res.data || []
            const mainImage = images.find(img => img.isMain === 1) || images[0]
            return mainImage?.imageUrl || '/default.jpg'
        } catch {
            return '/default.jpg'
        }
    }

    // 從後端 API 載入購物車資料（包含產品與數量）
    async function loadCartFromApi() {
        try {
            const res = await axios.get('/api/ShoppingCartItems')
            if (Array.isArray(res.data)) {
                items.value = res.data.map(item => ({
                    id: item.productsId,
                    name: item.productName || '',
                    price: item.unitprice,
                    quantity: item.quantity,
                    image: item.image || ''
                }))
                setCartItemIds(res.data.map(i => i.itemId))
                localStorage.setItem('cart', JSON.stringify(items.value))
            }
        } catch (error) {
            console.error('載入購物車失敗', error)
        }
    }

    function setCartItemIds(ids) {
        cartItemIds.value = ids
        localStorage.setItem('cartItemIds', JSON.stringify(ids))
    }

    watch(items, (val) => {
        localStorage.setItem('cart', JSON.stringify(val))
    }, { deep: true })

    watch(cartItemIds, (val) => {
        localStorage.setItem('cartItemIds', JSON.stringify(val))
    }, { deep: true })

    return {
        items,
        total,
        addItem,
        increaseQty,
        decreaseQty,
        setQty,
        removeItem,
        clearCart,
        loadImagesForCartItems,   // 一定要放這裡，讓外部能調用
        loadCartFromApi,
        cartItemIds,
        setCartItemIds,
    }
})
