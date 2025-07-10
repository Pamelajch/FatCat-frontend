import { createRouter, createWebHistory } from "vue-router"
import HomeView from "./views/HomeView.vue"
import ProductlistView from "./views/ProductlistView.vue"
import CartView from "./views/CartView.vue"
import FavoriteView from "./views/FavoriteView.vue"
import UserView from "./views/UserView.vue"
import NotificationView from "./views/NotificationView.vue"
import ProductView from "./views/ProductView.vue"
import CampaignsView from '@/views/CampaignsView.vue'
import _ReviewTestView from "@/views/_ReviewTestView.vue"
import CheckoutView from "./views/CheckoutView.vue"
import CheckoutfinishView from "./views/CheckoutfinishView.vue"
import MyOrdersView from "./views/MyOrdersView.vue"
import OrderdetailView from "./views/OrderdetailView.vue"
import LoginView from "./views/LoginView.vue"
import NofundView from "./views/NofundView.vue"
import RegisterView from "./views/RegisterView.vue"
import SpecialNoodleView from "./views/SpecialNoodleView.vue"
import OneSpecialNoodleView from "./views/OneSpecialNoodleView.vue"

const routes = [
    //http://localhost:5173/ => http://localhost:5173/home
    { path: "/", redirect: "/home" },
    //首頁
    //http://localhost:5173/home
    { path: "/home", component: HomeView, name: "home" },
    //商品列表 --玥彤
    //http://localhost:5173/productlist
    { path: "/productlist", component: ProductlistView, name: "productlist" },
    //http://localhost:5173/Product
    { path: "/Product", component: ProductView, name: "product" },
    //http://localhost:5173/Specialnoodle
    { path:"/Specialnoodle", component:SpecialNoodleView, name:"specialnoodle"},
    //http://localhost:5173/OneSpecialNoodle
    { path:"/OneSpecialNoodle", component:OneSpecialNoodleView, name:"onespecialnoodle"},
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
    //活動 --如謙
    //http://localhost:5173/campaigns
    { path: "/campaigns", component: CampaignsView, name: "campaigns" },
    //rr測試站 --如謙
    //http://localhost:5173/_reviewtest
    { path: "/_reviewtest", component: _ReviewTestView, name: "_reviewtest" },

    //訂單結帳 -- 梓瑋
    //http://localhost:5173/checkout
    { path: "/checkout", component: CheckoutView, name: "checkout" },
    //完成結帳 -- 梓瑋
    //http://localhost:5173/checkoutfinish
    { path: "/checkoutfinish", component: CheckoutfinishView, name: "checkoutfinish" },
    //我的訂單 -- 梓瑋
    //http://localhost:5173/myorders
    { path: "/myorders", component: MyOrdersView, name: "myorders" },
    //訂單明細 -- 梓瑋
    //http://localhost:5173/orderdetail
    { path: "/orderdetail", component: OrderdetailView, name: "orderdetail" },
    //登入頁面
    {
        path: "/login", component: LoginView, name: "login", meta: {
            hideHeaderFooter: true //讓登入頁面不要套用Header及Footer(方法寫在app.vue)
        }
    },
    //註冊頁面
    {
        path: "/register", component: RegisterView, name: "register", meta: {
            hideHeaderFooter: true //讓註冊頁面不要套用Header及Footer
        }
    },








    //404頁面 !!一定要放在最下面!! 若要新增頁面請放上面↑↑
    // (.*)* 任意字元
    { path: "/:pathMatch(.*)*", component: NofundView, name: 'NotFund', meta: { hideHeaderFooter: true } }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router