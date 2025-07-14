import { createApp } from 'vue'
import { createPinia } from 'pinia'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import App from './App.vue'
import router from './router'

// Facebook SDK 初始化
window.fbAsyncInit = function () {
    FB.init({
        appId: '1307390251394742',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
    });
};


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.mount('#app')
