<template>
  <ion-page>
    <ion-content :fullscreen="true" class="host-content">
      <header class="host-header">
        <a class="brand" href="/home" aria-label="Casa home"><img src="/casa-logo.png" alt="" class="brand-mark" /><span>casa<span class="brand-dot">.</span></span></a>
        <nav class="host-nav" aria-label="Host navigation">
          <a class="active" href="/host">Dashboard</a>
          <a href="/host/spaces">My spaces</a>
          <a href="/host/requests">Requests</a>
        </nav>
        <div class="host-account"><span class="avatar">{{ initials }}</span><span class="host-name">{{ displayName }}</span><button type="button" aria-label="Log out" @click="logout">Log out</button></div>
      </header>

      <main class="host-shell">
        <section class="welcome-row">
          <div><span class="eyebrow">HOST DASHBOARD</span><h1>{{ greeting }}, {{ firstName }}.</h1><p>Here’s an overview of your listings and availability.</p></div>
          <a class="add-button" href="/host/spaces/new"><ion-icon :icon="addOutline" /> Add a space</a>
        </section>

        <section class="stats-grid" aria-label="Host performance summary">
          <article class="stat-card"><span class="stat-icon green"><ion-icon :icon="homeOutline" /></span><div><span>Total listings</span><strong>{{ isLoading || errorMessage ? '—' : spaces.length }}</strong><small>Published and drafts</small></div></article>
          <article class="stat-card"><span class="stat-icon orange"><ion-icon :icon="checkmarkCircleOutline" /></span><div><span>Published</span><strong>{{ isLoading || errorMessage ? '—' : publishedCount }}</strong><small>Visible to renters</small></div></article>
          <article class="stat-card"><span class="stat-icon blue"><ion-icon :icon="lockClosedOutline" /></span><div><span>Reserved spots</span><strong>{{ availabilityLoaded ? inventory.booked : '—' }}</strong><small>{{ availabilityLoaded ? 'Beds and private rooms' : 'Availability unavailable' }}</small></div></article>
          <article class="stat-card"><span class="stat-icon purple"><ion-icon :icon="bedOutline" /></span><div><span>Available spots</span><strong>{{ availabilityLoaded ? inventory.available : '—' }}</strong><small>{{ availabilityLoaded ? 'Across published listings' : 'Availability unavailable' }}</small></div></article>
        </section>

        <p v-if="errorMessage" class="data-message error-message" role="alert">{{ errorMessage }}</p>
        <p v-if="availabilityError" class="data-message error-message" role="alert">
          Availability couldn’t be loaded: {{ availabilityError }}
        </p>

        <div class="dashboard-grid">
          <section class="dashboard-card occupancy-card">
            <div class="section-heading"><div><span class="eyebrow">LIVE LISTINGS</span><h2>Availability</h2></div><span class="occupancy-rate">{{ availabilityLoaded ? `${inventory.rate}%` : '—' }}</span></div>
            <div class="occupancy-bar"><span :style="{ width: availabilityLoaded ? `${inventory.rate}%` : '0%' }" /></div>
            <div class="occupancy-copy">
              <strong>{{ availabilityLoaded ? (inventory.total ? `${inventory.booked} of ${inventory.total} spots reserved` : 'No bookable spaces found') : 'Availability data unavailable' }}</strong>
              <span>{{ availabilityLoaded ? (inventory.total ? `${inventory.available} spots are still available to renters.` : 'Add rooms or beds to a published listing to track availability.') : 'Try refreshing the dashboard.' }}</span>
            </div>
            <div class="legend"><span><i class="occupied-dot" /> Reserved</span><span><i class="available-dot" /> Available</span></div>
          </section>
          <section class="dashboard-card quick-actions-card">
            <div class="section-heading"><div><span class="eyebrow">LISTING MANAGEMENT</span><h2>Quick actions</h2></div></div>
            <a class="quick-action" href="/host/spaces/new"><ion-icon :icon="addOutline" /> Create a listing <ion-icon :icon="arrowForwardOutline" /></a>
            <a class="quick-action" href="/host/spaces"><ion-icon :icon="homeOutline" /> Manage your listings <ion-icon :icon="arrowForwardOutline" /></a>
          </section>
        </div>

        <section id="listings" class="spaces-section">
          <div class="section-heading"><div><span class="eyebrow">YOUR SPACES</span><h2>Recently added</h2></div><a href="/host/spaces">Manage all <ion-icon :icon="arrowForwardOutline" /></a></div>
          <p v-if="isLoading" class="data-message" role="status">Loading your listings…</p>
          <p v-else-if="errorMessage" class="data-message">Your listings couldn’t be displayed.</p>
          <div v-else-if="!errorMessage && spaces.length === 0" class="empty-state">
            <ion-icon :icon="homeOutline" /><h2>No listings yet</h2><p>Create a listing to start showing your spaces to renters.</p>
            <a href="/host/spaces/new" class="add-button"><ion-icon :icon="addOutline" /> Add your first space</a>
          </div>
          <div v-else class="space-grid">
            <article v-for="space in recentSpaces" :key="space.id" class="space-card" role="link" tabindex="0" @click="openHostListing(space.id)" @keydown.enter="openHostListing(space.id)">
              <div class="space-photo" :style="{ backgroundImage: `url(${space.cover_photo_url || defaultListingImage})` }">
                <span class="live-badge" :class="{ draft: space.status === 'draft' }"><i /> {{ space.status === 'published' ? 'Published' : 'Draft' }}</span>
              </div>
              <div class="space-card-body">
                <div class="space-title"><div><h3>{{ space.name }}</h3><span><ion-icon :icon="locationOutline" /> {{ space.location }}</span></div><strong>{{ getSpaceAvailability(space) }}</strong></div>
                <div class="space-footer"><span>₱{{ Number(space.monthly_rent).toLocaleString() }} <small>/ month from</small></span><span class="manage-link">Manage listing <ion-icon :icon="arrowForwardOutline" /></span></div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { addOutline, arrowForwardOutline, bedOutline, checkmarkCircleOutline, homeOutline, locationOutline, lockClosedOutline } from 'ionicons/icons';
import { useLogout } from '../composables/useLogout';
import { useAuthUser } from '../composables/useAuthUser';
import { defaultListingImage } from '../data/listings';
import { getHostSpaceAvailability, type HostReservation } from '../data/hostAvailability';
import { getSupabaseClient } from '../lib/supabase';

const { logout } = useLogout();
const router = useRouter();
const { user } = useAuthUser();
const displayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'Host');
const initials = computed(() => displayName.value.split(/\s+/).filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase());
type SpaceStatus = 'published' | 'draft';
type DashboardBedspace = { id: number; price: number };
type DashboardRoom = { id: number; monthly_rent: number | null; bedspaces: DashboardBedspace[] };
type DashboardFloor = { rooms: DashboardRoom[] };
type DashboardSpace = {
  id: number;
  name: string;
  location: string;
  type: 'Bedspace' | 'Private room';
  monthly_rent: number;
  cover_photo_url: string | null;
  status: SpaceStatus;
  created_at: string;
  floors: DashboardFloor[];
};
const spaces = ref<DashboardSpace[]>([]);
const bookedSpots = ref<HostReservation[]>([]);
const isLoading = ref(false);
const availabilityLoaded = ref(false);
const errorMessage = ref('');
const availabilityError = ref('');
const displayError = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'An unexpected error occurred.';
};
const firstName = computed(() => displayName.value.trim().split(/\s+/)[0] || 'Host');
const greeting = computed(() => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
});
const publishedCount = computed(() => spaces.value.filter((space) => space.status === 'published').length);
const inventory = computed(() => {
  const publishedSpaces = spaces.value.filter((space) => space.status === 'published');
  const counts = publishedSpaces.map((space) => getHostSpaceAvailability(space, bookedSpots.value));
  const total = counts.reduce((sum, count) => sum + count.total, 0);
  const booked = counts.reduce((sum, count) => sum + count.reserved, 0);
  const available = counts.reduce((sum, count) => sum + count.available, 0);
  return { total, booked, available, rate: total ? Math.round((booked / total) * 100) : 0 };
});
const recentSpaces = computed(() => spaces.value.slice(0, 4));
function openHostListing(id: number) {
  void router.push({ name: 'HostSpaces', query: { spaceId: String(id) } });
}

function getSpaceAvailability(space: DashboardSpace): string {
  if (space.status !== 'published' || !availabilityLoaded.value) return space.status === 'draft' ? 'Draft' : '—';
  const { total, reserved: booked } = getHostSpaceAvailability(space, bookedSpots.value);
  return total ? `${booked}/${total} reserved` : 'No spaces configured';
}

async function loadDashboard() {
  isLoading.value = true;
  errorMessage.value = '';
  availabilityError.value = '';
  availabilityLoaded.value = false;
  try {
    const client = getSupabaseClient();
    const { data: { user: currentUser }, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!currentUser) throw new Error('Sign in to view your host dashboard.');

    const [spacesResult, bookingsResult] = await Promise.all([
      client.from('spaces')
        .select(`id, name, location, type, monthly_rent, cover_photo_url, status, created_at,
          floors(rooms(id, monthly_rent, bedspaces(id, price)))`)
        .eq('host_id', currentUser.id)
        .order('created_at', { ascending: false }),
      client.rpc('get_booked_listing_spaces'),
    ]);

    if (spacesResult.error) throw spacesResult.error;
    spaces.value = (spacesResult.data ?? []) as DashboardSpace[];
    if (bookingsResult.error) {
      availabilityError.value = displayError(bookingsResult.error);
      bookedSpots.value = [];
    } else {
      bookedSpots.value = (bookingsResult.data ?? []) as HostReservation[];
      availabilityLoaded.value = true;
    }
  } catch (error) {
    errorMessage.value = displayError(error);
    spaces.value = [];
  } finally {
    isLoading.value = false;
  }
}

onIonViewWillEnter(() => { void loadDashboard(); });
const refreshAfterBooking = () => { void loadDashboard(); };
onMounted(() => window.addEventListener('casa:booking-completed', refreshAfterBooking));
onUnmounted(() => window.removeEventListener('casa:booking-completed', refreshAfterBooking));
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
:global(body) { background: #f7f8f4; color: #174b35; font-family: 'DM Sans', sans-serif; } :global(*) { box-sizing: border-box; }
.host-content { --background: #f7f8f4; }.host-header { align-items: center; background: #fff; border-bottom: 1px solid #e5ebe4; display: flex; height: 78px; justify-content: space-between; padding: 0 clamp(22px, 5vw, 74px); }.brand { align-items: center; color: #174b35; display: flex; font-size: 26px; font-weight: 700; gap: 8px; letter-spacing: -1.5px; text-decoration: none; }.brand-mark { height: 35px; width: 35px; }.brand-dot { color: #e2743e; }.host-nav { display: flex; gap: 28px; }.host-nav a { color: #849087; font-size: 11px; font-weight: 600; padding: 29px 0 25px; text-decoration: none; }.host-nav a.active { border-bottom: 2px solid #e2743e; color: #174b35; }.nav-count { background: #e2743e; border-radius: 10px; color: #fff; font-size: 8px; margin-left: 3px; padding: 2px 5px; }.host-account { align-items: center; display: flex; gap: 9px; }.avatar, .request-avatar { align-items: center; background: #dcebdd; border-radius: 50%; color: #35744a; display: flex; font-size: 10px; font-weight: 700; height: 32px; justify-content: center; width: 32px; }.host-name { color: #174b35; font-size: 11px; font-weight: 700; }.host-account button { background: transparent; border: 0; color: #99a59d; cursor: pointer; font: inherit; font-size: 10px; margin-left: 10px; padding: 0; }.host-shell { margin: 0 auto; max-width: 1240px; padding: 52px 38px 75px; }.welcome-row { align-items: end; display: flex; justify-content: space-between; }.eyebrow { color: #e2743e; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; }.welcome-row h1 { color: #174b35; font-family: 'Playfair Display', serif; font-size: clamp(36px, 4vw, 52px); letter-spacing: -2px; margin: 13px 0 8px; }.welcome-row p { color: #849087; font-size: 12px; margin: 0; }.add-button { align-items: center; background: #e2743e; border-radius: 7px; color: #fff; display: flex; font-size: 11px; font-weight: 700; gap: 7px; padding: 12px 15px; }.add-button ion-icon { font-size: 16px; }.stats-grid { display: grid; gap: 16px; grid-template-columns: repeat(4, 1fr); margin-top: 37px; }.stat-card { align-items: center; background: #fff; border: 1px solid #e5ebe4; border-radius: 11px; display: flex; gap: 12px; padding: 17px; }.stat-icon { align-items: center; border-radius: 8px; display: flex; font-size: 19px; height: 40px; justify-content: center; width: 40px; }.stat-icon.green { background: #e5f1e4; color: #4b9b61; }.stat-icon.orange { background: #fff0e8; color: #e2743e; }.stat-icon.blue { background: #e8f1f5; color: #5e95ad; }.stat-icon.purple { background: #eeeafa; color: #8b78bb; }.stat-card div { display: flex; flex-direction: column; gap: 3px; }.stat-card span:not(.stat-icon) { color: #8a968e; font-size: 9px; }.stat-card strong { color: #174b35; font-size: 20px; }.stat-card small { color: #abb4ae; font-size: 8px; }.dashboard-grid { display: grid; gap: 20px; grid-template-columns: 1.25fr .75fr; margin-top: 25px; }.dashboard-card { background: #fff; border: 1px solid #e5ebe4; border-radius: 12px; padding: 22px; }.section-heading { align-items: start; display: flex; justify-content: space-between; }.section-heading h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 23px; margin: 7px 0 0; }.section-heading a { align-items: center; color: #e2743e; display: flex; font-size: 10px; font-weight: 700; gap: 4px; margin-top: 8px; text-decoration: none; }.request-row { align-items: center; border-top: 1px solid #edf1ec; display: flex; gap: 11px; margin-top: 18px; padding-top: 15px; }.request-avatar { background: #fff0e8; color: #c26439; flex: 0 0 33px; height: 33px; width: 33px; }.request-details { display: flex; flex: 1; flex-direction: column; gap: 3px; }.request-details strong { color: #174b35; font-size: 11px; }.request-details span, .request-details small { color: #8a968e; font-size: 9px; }.request-actions { display: flex; gap: 7px; }.request-actions button { border-radius: 5px; font-size: 9px; font-weight: 700; padding: 7px 9px; }.approve { background: #e5f1e4; color: #35744a; }.decline { background: transparent; color: #a0aaa3; }.notice { background: #fff4ed; border-radius: 5px; color: #c26439; font-size: 9px; margin: 13px 0 0; padding: 9px; }.occupancy-rate { color: #4b9b61; font-size: 23px; font-weight: 700; }.occupancy-bar { background: #edf1ec; border-radius: 10px; height: 12px; margin-top: 28px; overflow: hidden; }.occupancy-bar span { background: linear-gradient(90deg, #76ae80, #4b9b61); border-radius: inherit; display: block; height: 100%; width: 78%; }.occupancy-copy { display: flex; flex-direction: column; gap: 5px; margin-top: 18px; }.occupancy-copy strong { color: #174b35; font-size: 12px; }.occupancy-copy span { color: #8a968e; font-size: 9px; }.legend { display: flex; gap: 16px; margin-top: 26px; }.legend span { align-items: center; color: #89968d; display: flex; font-size: 9px; gap: 5px; }.legend i, .live-badge i { background: #4b9b61; border-radius: 50%; display: inline-block; height: 7px; width: 7px; }.legend .available-dot { background: #d9e3da; }.spaces-section { margin-top: 35px; }.space-grid { display: grid; gap: 20px; grid-template-columns: repeat(2, 1fr); margin-top: 17px; }.space-card { background: #fff; border: 1px solid #e5ebe4; border-radius: 11px; cursor: pointer; overflow: hidden; }.space-photo { background-position: center; background-size: cover; height: 190px; padding: 13px; position: relative; }.live-badge { align-items: center; background: #fff; border-radius: 4px; color: #35744a; display: inline-flex; font-size: 9px; font-weight: 700; gap: 5px; padding: 6px 8px; }.more-button { background: rgba(255,255,255,.92); border-radius: 50%; color: #174b35; font-size: 14px; height: 28px; position: absolute; right: 12px; top: 12px; width: 28px; }.space-card-body { padding: 17px; }.space-title { align-items: start; display: flex; justify-content: space-between; }.space-title h3 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 20px; margin: 0 0 5px; }.space-title span { color: #89968d; display: flex; font-size: 9px; gap: 4px; }.space-title ion-icon { color: #e2743e; font-size: 13px; }.space-title strong { color: #4b9b61; font-size: 10px; }.space-footer { align-items: center; border-top: 1px solid #edf1ec; display: flex; justify-content: space-between; margin-top: 15px; padding-top: 13px; }.space-footer > span { color: #174b35; font-size: 14px; font-weight: 700; }.space-footer small { color: #89968d; font-size: 9px; font-weight: 400; }.space-footer .manage-link { align-items: center; color: #e2743e; display: inline-flex; font-size: 10px; font-weight: 700; gap: 4px; }
.data-message { color: #849087; font-size: 12px; margin: 18px 0 0; }
.error-message { background: #fff0e8; border-radius: 7px; color: #a4472a; padding: 12px 14px; }
.quick-actions-card { display: flex; flex-direction: column; gap: 14px; }
.quick-action { align-items: center; border-top: 1px solid #edf1ec; color: #35744a; display: flex; font-size: 11px; font-weight: 600; gap: 9px; padding-top: 14px; text-decoration: none; }
.quick-action ion-icon:first-child { font-size: 17px; }
.quick-action ion-icon:last-child { color: #e2743e; margin-left: auto; }
.empty-state { align-items: center; background: #fff; border: 1px dashed #d7e1d7; border-radius: 11px; display: flex; flex-direction: column; margin-top: 17px; padding: 38px 20px; text-align: center; }
.empty-state > ion-icon { color: #76ae80; font-size: 30px; }
.empty-state h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 21px; margin: 12px 0 5px; }
.empty-state p { color: #849087; font-size: 11px; margin: 0 0 17px; }
.empty-state .add-button { text-decoration: none; }
.live-badge.draft { color: #8a6a37; }
.live-badge.draft i { background: #c6a45e; }
.space-footer a { color: #e2743e; font-size: 10px; font-weight: 700; text-decoration: none; }
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); }.dashboard-grid { grid-template-columns: 1fr; }.host-nav { gap: 16px; } }
@media (max-width: 620px) { .host-header { height: 70px; padding: 0 18px; }.host-nav { display: none; }.host-name, .host-account a { display: none; }.host-shell { padding: 38px 18px 55px; }.welcome-row { align-items: start; flex-direction: column; gap: 22px; }.welcome-row h1 { font-size: 39px; }.add-button { align-self: stretch; justify-content: center; }.stats-grid, .space-grid { grid-template-columns: 1fr; }.stat-card { padding: 14px; }.dashboard-card { padding: 18px 15px; }.request-row { align-items: start; flex-wrap: wrap; }.request-actions { margin-left: 44px; width: calc(100% - 44px); }.request-actions button { flex: 1; }.space-photo { height: 210px; } }
.add-button { text-decoration: none; }
</style>
