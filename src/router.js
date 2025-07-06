import { createRouter, createWebHistory } from "vue-router"
import HomeView from "./views/HomeView.vue"
import ProductlistView from "./views/ProductlistView.vue"
import CartView from "./views/CartView.vue"
import FavoriteView from "./views/FavoriteView.vue"
import UserView from "./views/UserView.vue"
import NotificationView from "./views/NotificationView.vue"

const routes = [
    //http://localhost:5173/ => http://localhost:5173/home
    { path: "/", redirect: "/home" },
    //首頁
    //http://localhost:5173/home
    { path: "/home", component: HomeView, name: "home" },
    //商品列表 --玥彤
    //http://localhost:5173/productlist
    { path: "/productlist", component: ProductlistView, name: "productlist" },
    //購物車 --梓瑋
    //http://localhost:5173/cart
    { path: "/cart", component: CartView, name: "cart" },
    //我的最愛 --如謙
    //http://localhost:5173/favorite
    { path: "/favorite", component: FavoriteView, name: "favorite" },
    //會員中心 --佳馨
    //http://localhost:5173/user
    { path: "/user", component: UserView, name: "user" },
    //通知 --佳馨
    //http://localhost:5173/notification
    { path: "/notification", component: NotificationView, name: "notification" },

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router