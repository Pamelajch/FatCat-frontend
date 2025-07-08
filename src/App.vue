<script setup>
import { RouterLink, RouterView } from 'vue-router'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue'
</script>

<template>
  <div>
    <HeaderComponent></HeaderComponent>
    <main>
      <RouterView></RouterView>
    </main>
    
    <FooterComponent></FooterComponent>
  </div>

</template>

<style scoped>

</style>
