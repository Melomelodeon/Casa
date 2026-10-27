import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'
import AuthPage from '../views/AuthPage.vue'
import BrowsePage from '../views/BrowsePage.vue'
import ListingsPage from '../views/ListingsPage.vue'
import CheckoutPage from '../views/CheckoutPage.vue'
import HostDashboardPage from '../views/HostDashboardPage.vue'
import HostSpacesPage from '../views/HostSpacesPage.vue'
import HostRequestsPage from '../views/HostRequestsPage.vue'
import AddSpacePage from '../views/AddSpacePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: AuthPage
  },
  {
    path: '/signup',
    name: 'Signup',
    component: AuthPage
  },
  {
    path: '/browse',
    name: 'Browse',
    component: BrowsePage
  },
  {
    path: '/listings',
    name: 'Listings',
    component: ListingsPage
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutPage
  },
  {
    path: '/host',
    name: 'HostDashboard',
    component: HostDashboardPage
  },
  {
    path: '/host/spaces',
    name: 'HostSpaces',
    component: HostSpacesPage
  },
  {
    path: '/host/requests',
    name: 'HostRequests',
    component: HostRequestsPage
  },
  {
    path: '/host/spaces/new',
    name: 'AddSpace',
    component: AddSpacePage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
