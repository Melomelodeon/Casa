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
import ClientPage from '../views/ClientPage.vue'
import AddSpacePage from '../views/AddSpacePage.vue'
import PaymentPage from '../views/PaymentPage.vue'
import ReceiptPage from '../views/ReceiptPage.vue'
import NotFoundPage from '../views/NotFoundPage.vue'
import { getSupabaseClient } from '../lib/supabase'

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
    component: CheckoutPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/payment',
    name: 'Payment',
    component: PaymentPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/receipt',
    name: 'Receipt',
    component: ReceiptPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/client',
    name: 'ClientDashboard',
    component: ClientPage,
    meta: { requiresAuth: true, requiresTenant: true }
  },
  {
    path: '/host',
    name: 'HostDashboard',
    component: HostDashboardPage,
    meta: { requiresAuth: true, requiresLandlord: true }
  },
  {
    path: '/host/spaces',
    name: 'HostSpaces',
    component: HostSpacesPage,
    meta: { requiresAuth: true, requiresLandlord: true }
  },
  {
    path: '/host/requests',
    name: 'HostRequests',
    component: HostRequestsPage,
    meta: { requiresAuth: true, requiresLandlord: true }
  },
  {
    path: '/host/spaces/new',
    name: 'AddSpace',
    component: AddSpacePage,
    meta: { requiresAuth: true, requiresLandlord: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth && !to.meta.requiresLandlord && !to.meta.requiresTenant) {
    return true
  }

  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser()

    if (!user) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }

    const role = user.user_metadata?.role

    if (to.meta.requiresLandlord && role !== 'landlord') {
      return role === 'tenant' ? { name: 'ClientDashboard' } : { name: 'Browse' }
    }

    if (to.meta.requiresTenant && role !== 'tenant') {
      return role === 'landlord' ? { name: 'HostDashboard' } : { name: 'Browse' }
    }

    return true
  } catch (error) {
    console.error('Unable to verify the current user.', error)
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})

export default router
