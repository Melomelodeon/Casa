<template>
  <ion-page>
    <ion-content :fullscreen="true" class="host-content">
      <header class="host-header">
        <a class="brand" href="/home" aria-label="Casa home"><img src="/casa-logo.png" alt="" class="brand-mark" /><span>casa<span class="brand-dot">.</span></span></a>
        <nav class="host-nav" aria-label="Host navigation">
          <a class="active" href="/host">Dashboard</a>
          <a href="/host/spaces">My spaces</a>
          <a href="/host/requests">Requests <span class="nav-count">2</span></a>
        </nav>
        <div class="host-account"><span class="avatar">JM</span><span class="host-name">Jamie M.</span><a href="/home" aria-label="Log out">Log out</a></div>
      </header>

      <main class="host-shell">
        <section class="welcome-row">
          <div><span class="eyebrow">HOST DASHBOARD</span><h1>Good morning, Jamie.</h1><p>Here’s what’s happening with your Casa spaces today.</p></div>
          <a class="add-button" href="/host/spaces/new"><ion-icon :icon="addOutline" /> Add a space</a>
        </section>

        <section class="stats-grid" aria-label="Host performance summary">
          <article class="stat-card"><span class="stat-icon green"><ion-icon :icon="homeOutline" /></span><div><span>Active spaces</span><strong>2</strong><small>Across 2 properties</small></div></article>
          <article class="stat-card"><span class="stat-icon orange"><ion-icon :icon="calendarOutline" /></span><div><span>Pending requests</span><strong>2</strong><small>Needs your attention</small></div></article>
          <article class="stat-card"><span class="stat-icon blue"><ion-icon :icon="walletOutline" /></span><div><span>Estimated monthly</span><strong>₱31,400</strong><small>From occupied spaces</small></div></article>
          <article class="stat-card"><span class="stat-icon purple"><ion-icon :icon="starOutline" /></span><div><span>Host rating</span><strong>4.9</strong><small>Based on 24 reviews</small></div></article>
        </section>

        <div class="dashboard-grid">
          <section id="requests" class="dashboard-card requests-card">
            <div class="section-heading"><div><span class="eyebrow">ACTION NEEDED</span><h2>Booking requests</h2></div><a href="/host/requests">View all <ion-icon :icon="arrowForwardOutline" /></a></div>
            <article v-for="request in requests" :key="request.name" class="request-row">
              <span class="request-avatar">{{ request.initials }}</span>
              <div class="request-details"><strong>{{ request.name }}</strong><span>Interested in {{ request.space }}</span><small>Move-in {{ request.date }}</small></div>
              <div class="request-actions"><button type="button" class="approve" @click="approveRequest(request.name)">Approve</button><button type="button" class="decline" @click="showNotice('Request declined.')">Decline</button></div>
            </article>
            <p v-if="notice" class="notice" role="status">{{ notice }}</p>
          </section>

          <section class="dashboard-card occupancy-card">
            <div class="section-heading"><div><span class="eyebrow">THIS MONTH</span><h2>Occupancy</h2></div><span class="occupancy-rate">78%</span></div>
            <div class="occupancy-bar"><span /></div>
            <div class="occupancy-copy"><strong>7 of 9 spaces occupied</strong><span>Keep it up! Your spaces are in demand.</span></div>
            <div class="legend"><span><i class="occupied-dot" /> Occupied</span><span><i class="available-dot" /> Available</span></div>
          </section>
        </div>

        <section id="listings" class="spaces-section">
          <div class="section-heading"><div><span class="eyebrow">YOUR SPACES</span><h2>Manage your listings</h2></div><a href="/host/spaces">See all spaces <ion-icon :icon="arrowForwardOutline" /></a></div>
          <div class="space-grid">
            <article v-for="space in spaces" :key="space.name" class="space-card">
              <div class="space-photo" :style="{ backgroundImage: `url(${space.image})` }"><span class="live-badge"><i /> Live</span><button type="button" class="more-button" aria-label="More listing actions" @click="showNotice('Listing actions will be available soon.')">•••</button></div>
              <div class="space-card-body"><div class="space-title"><div><h3>{{ space.name }}</h3><span><ion-icon :icon="locationOutline" /> {{ space.location }}</span></div><strong>{{ space.occupancy }}</strong></div><div class="space-footer"><span>₱{{ space.price.toLocaleString() }} <small>/ month</small></span><button type="button" @click="showNotice('Editing will be available soon.')">Edit listing</button></div></div>
            </article>
          </div>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { addOutline, arrowForwardOutline, calendarOutline, homeOutline, locationOutline, starOutline, walletOutline } from 'ionicons/icons';

const notice = ref('');
const requests = [
  { name: 'Alex Reyes', initials: 'AR', space: 'Bed 03 · Sage House', date: 'Nov 01' },
  { name: 'Mika Santos', initials: 'MS', space: 'Private bed · The Greenhouse', date: 'Nov 15' },
];
const spaces = [
  { name: 'Sage House', location: 'Poblacion, Makati', occupancy: '4/5 occupied', price: 7200, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85' },
  { name: 'The Greenhouse', location: 'Katipunan, Quezon City', occupancy: '3/4 occupied', price: 8500, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85' },
];
let noticeTimer: number | undefined;
function showNotice(message: string) {
  notice.value = message;
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => { notice.value = ''; }, 2500);
}
function approveRequest(name: string) {
  showNotice(`${name}'s request has been approved.`);
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
:global(body) { background: #f7f8f4; color: #174b35; font-family: 'DM Sans', sans-serif; } :global(*) { box-sizing: border-box; }
.host-content { --background: #f7f8f4; }.host-header { align-items: center; background: #fff; border-bottom: 1px solid #e5ebe4; display: flex; height: 78px; justify-content: space-between; padding: 0 clamp(22px, 5vw, 74px); }.brand { align-items: center; color: #174b35; display: flex; font-size: 26px; font-weight: 700; gap: 8px; letter-spacing: -1.5px; text-decoration: none; }.brand-mark { height: 35px; width: 35px; }.brand-dot { color: #e2743e; }.host-nav { display: flex; gap: 28px; }.host-nav a { color: #849087; font-size: 11px; font-weight: 600; padding: 29px 0 25px; text-decoration: none; }.host-nav a.active { border-bottom: 2px solid #e2743e; color: #174b35; }.nav-count { background: #e2743e; border-radius: 10px; color: #fff; font-size: 8px; margin-left: 3px; padding: 2px 5px; }.host-account { align-items: center; display: flex; gap: 9px; }.avatar, .request-avatar { align-items: center; background: #dcebdd; border-radius: 50%; color: #35744a; display: flex; font-size: 10px; font-weight: 700; height: 32px; justify-content: center; width: 32px; }.host-name { color: #174b35; font-size: 11px; font-weight: 700; }.host-account a { color: #99a59d; font-size: 10px; margin-left: 10px; text-decoration: none; }.host-shell { margin: 0 auto; max-width: 1240px; padding: 52px 38px 75px; }.welcome-row { align-items: end; display: flex; justify-content: space-between; }.eyebrow { color: #e2743e; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; }.welcome-row h1 { color: #174b35; font-family: 'Playfair Display', serif; font-size: clamp(36px, 4vw, 52px); letter-spacing: -2px; margin: 13px 0 8px; }.welcome-row p { color: #849087; font-size: 12px; margin: 0; }.add-button { align-items: center; background: #e2743e; border-radius: 7px; color: #fff; display: flex; font-size: 11px; font-weight: 700; gap: 7px; padding: 12px 15px; }.add-button ion-icon { font-size: 16px; }.stats-grid { display: grid; gap: 16px; grid-template-columns: repeat(4, 1fr); margin-top: 37px; }.stat-card { align-items: center; background: #fff; border: 1px solid #e5ebe4; border-radius: 11px; display: flex; gap: 12px; padding: 17px; }.stat-icon { align-items: center; border-radius: 8px; display: flex; font-size: 19px; height: 40px; justify-content: center; width: 40px; }.stat-icon.green { background: #e5f1e4; color: #4b9b61; }.stat-icon.orange { background: #fff0e8; color: #e2743e; }.stat-icon.blue { background: #e8f1f5; color: #5e95ad; }.stat-icon.purple { background: #eeeafa; color: #8b78bb; }.stat-card div { display: flex; flex-direction: column; gap: 3px; }.stat-card span:not(.stat-icon) { color: #8a968e; font-size: 9px; }.stat-card strong { color: #174b35; font-size: 20px; }.stat-card small { color: #abb4ae; font-size: 8px; }.dashboard-grid { display: grid; gap: 20px; grid-template-columns: 1.25fr .75fr; margin-top: 25px; }.dashboard-card { background: #fff; border: 1px solid #e5ebe4; border-radius: 12px; padding: 22px; }.section-heading { align-items: start; display: flex; justify-content: space-between; }.section-heading h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 23px; margin: 7px 0 0; }.section-heading a { align-items: center; color: #e2743e; display: flex; font-size: 10px; font-weight: 700; gap: 4px; margin-top: 8px; text-decoration: none; }.request-row { align-items: center; border-top: 1px solid #edf1ec; display: flex; gap: 11px; margin-top: 18px; padding-top: 15px; }.request-avatar { background: #fff0e8; color: #c26439; flex: 0 0 33px; height: 33px; width: 33px; }.request-details { display: flex; flex: 1; flex-direction: column; gap: 3px; }.request-details strong { color: #174b35; font-size: 11px; }.request-details span, .request-details small { color: #8a968e; font-size: 9px; }.request-actions { display: flex; gap: 7px; }.request-actions button { border-radius: 5px; font-size: 9px; font-weight: 700; padding: 7px 9px; }.approve { background: #e5f1e4; color: #35744a; }.decline { background: transparent; color: #a0aaa3; }.notice { background: #fff4ed; border-radius: 5px; color: #c26439; font-size: 9px; margin: 13px 0 0; padding: 9px; }.occupancy-rate { color: #4b9b61; font-size: 23px; font-weight: 700; }.occupancy-bar { background: #edf1ec; border-radius: 10px; height: 12px; margin-top: 28px; overflow: hidden; }.occupancy-bar span { background: linear-gradient(90deg, #76ae80, #4b9b61); border-radius: inherit; display: block; height: 100%; width: 78%; }.occupancy-copy { display: flex; flex-direction: column; gap: 5px; margin-top: 18px; }.occupancy-copy strong { color: #174b35; font-size: 12px; }.occupancy-copy span { color: #8a968e; font-size: 9px; }.legend { display: flex; gap: 16px; margin-top: 26px; }.legend span { align-items: center; color: #89968d; display: flex; font-size: 9px; gap: 5px; }.legend i, .live-badge i { background: #4b9b61; border-radius: 50%; display: inline-block; height: 7px; width: 7px; }.legend .available-dot { background: #d9e3da; }.spaces-section { margin-top: 35px; }.space-grid { display: grid; gap: 20px; grid-template-columns: repeat(2, 1fr); margin-top: 17px; }.space-card { background: #fff; border: 1px solid #e5ebe4; border-radius: 11px; overflow: hidden; }.space-photo { background-position: center; background-size: cover; height: 190px; padding: 13px; position: relative; }.live-badge { align-items: center; background: #fff; border-radius: 4px; color: #35744a; display: inline-flex; font-size: 9px; font-weight: 700; gap: 5px; padding: 6px 8px; }.more-button { background: rgba(255,255,255,.92); border-radius: 50%; color: #174b35; font-size: 14px; height: 28px; position: absolute; right: 12px; top: 12px; width: 28px; }.space-card-body { padding: 17px; }.space-title { align-items: start; display: flex; justify-content: space-between; }.space-title h3 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 20px; margin: 0 0 5px; }.space-title span { color: #89968d; display: flex; font-size: 9px; gap: 4px; }.space-title ion-icon { color: #e2743e; font-size: 13px; }.space-title strong { color: #4b9b61; font-size: 10px; }.space-footer { align-items: center; border-top: 1px solid #edf1ec; display: flex; justify-content: space-between; margin-top: 15px; padding-top: 13px; }.space-footer > span { color: #174b35; font-size: 14px; font-weight: 700; }.space-footer small { color: #89968d; font-size: 9px; font-weight: 400; }.space-footer button { color: #e2743e; font-size: 10px; font-weight: 700; }
@media (max-width: 900px) { .stats-grid { grid-template-columns: repeat(2, 1fr); }.dashboard-grid { grid-template-columns: 1fr; }.host-nav { gap: 16px; } }
@media (max-width: 620px) { .host-header { height: 70px; padding: 0 18px; }.host-nav { display: none; }.host-name, .host-account a { display: none; }.host-shell { padding: 38px 18px 55px; }.welcome-row { align-items: start; flex-direction: column; gap: 22px; }.welcome-row h1 { font-size: 39px; }.add-button { align-self: stretch; justify-content: center; }.stats-grid, .space-grid { grid-template-columns: 1fr; }.stat-card { padding: 14px; }.dashboard-card { padding: 18px 15px; }.request-row { align-items: start; flex-wrap: wrap; }.request-actions { margin-left: 44px; width: calc(100% - 44px); }.request-actions button { flex: 1; }.space-photo { height: 210px; } }
</style>
