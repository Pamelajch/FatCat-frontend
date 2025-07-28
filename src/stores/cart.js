// stores/cart.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import axios from 'axios'

export const useCartStore = defineStore('cart', () => {
    const items = ref(JSON.parse(localStorage.getItem('cart')) || [])

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

    watch(items, (val) => {
        localStorage.setItem('cart', JSON.stringify(val))
    }, { deep: true })

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
        const found = items.value.find(i => i.id === item.id)
        if (found) found.quantity = newQty
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
        addItem,
        increaseQty,
        decreaseQty,
        setQty,
        removeItem,
        clearCart,
        loadImagesForCartItems
    }
})
