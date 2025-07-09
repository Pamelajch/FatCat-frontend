<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()

const productId = route.query.id
// 然後用這個 id 去 call API 拿商品細項
</script>

<template>
    <div>

    </div>
</template>

<style lang="css" scoped>

</style>