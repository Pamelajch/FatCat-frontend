import { createRouter, createWebHistory } from "vue-router"
import HomeView from "./views/HomeView.vue"
import ProductlistView from "./views/ProductlistView.vue"
import CartView from "./views/CartView.vue"
import FavoriteView from "./views/FavoriteView.vue"
import UserView from "./views/UserView.vue"
import NotificationView from "./views/NotificationView.vue"
import LoginView from "./views/LoginView.vue"

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
    //登入頁面 --佳馨
    {
        path: "/login", component: LoginView, name: "login", meta: {
            hideHeaderFooter: true //讓登入頁面不要套用Header及Footer(方法寫在app.vue)
        }
    },
    // 註冊頁面--佳馨
    {
        path: "/register",
        component: RegisterView,
        name: "register",
        meta: {
            hideHeaderFooter: true
        }
    },
    // 忘記密碼頁面--佳馨
    {
        path: "/forgot-password",
        component: ForgotPasswordView,
        name: "forgot-password",
        meta: {
            hideHeaderFooter: true
        }
    },






    //404頁面一定要放在最下面

]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router