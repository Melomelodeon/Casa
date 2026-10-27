<template>
  <ion-page>
    <ion-content :fullscreen="true" class="home-content">
      <main class="home-shell">
        <nav class="nav-bar" aria-label="Main navigation">
          <a class="brand" href="/" aria-label="Casa home">
            <img :src="'/casa-logo.png'" alt="" class="brand-mark" />
            <span>casa<span class="brand-dot">.</span></span>
          </a>

          <div class="nav-links">
            <a href="/browse">Explore stays</a>
            <a href="#how-it-works">How it works</a>
            <a href="/signup?role=landlord">Become a host</a>
          </div>

          <div class="nav-actions">
            <a class="login-button" href="/login?role=tenant">Log in</a>
            <a class="signup-button" href="/signup?role=tenant">Sign up</a>
            <button class="menu-button" type="button" aria-label="Open menu">
              <ion-icon :icon="menuOutline" />
            </button>
          </div>
        </nav>

        <section class="hero-section" aria-labelledby="hero-title">
          <div class="hero-copy">
            <div class="eyebrow"><span class="eyebrow-line" /> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1 id="hero-title">Find a place<br />to <em>feel at home.</em></h1>
            <p class="hero-description">
              Discover thoughtfully chosen bedspaces and boarding houses made for the way you live.
            </p>

            <form class="search-card" action="/browse">
              <label class="search-field">
                <ion-icon :icon="locationOutline" />
                <span>
                  <small>Where</small>
                  <input type="text" placeholder="City, school, or area" />
                </span>
              </label>
              <label class="search-field">
                <ion-icon :icon="calendarOutline" />
                <span>
                  <small>Move-in</small>
                  <input type="text" placeholder="Add a date" />
                </span>
              </label>
              <label class="search-field budget-field">
                <ion-icon :icon="walletOutline" />
                <span>
                  <small>Budget</small>
                  <input type="text" placeholder="Monthly budget" />
                </span>
              </label>
              <button class="search-button" type="submit" aria-label="Search bedspaces">
                <ion-icon :icon="searchOutline" />
                <span>Search</span>
              </button>
            </form>

            <div class="hero-proof">
              <div class="avatar-stack" aria-hidden="true">
                <span class="avatar avatar-one">JM</span>
                <span class="avatar avatar-two">AL</span>
                <span class="avatar avatar-three">KC</span>
              </div>
              <p><strong>2,000+</strong> happy renters<br /><span>finding their space every month</span></p>
            </div>
          </div>

          <div class="hero-visual" aria-label="Featured room in Quezon City">
            <div class="sun-shape" />
            <div class="hero-image" />
            <div class="floating-rating">
              <span class="rating-icon"><ion-icon :icon="star" /></span>
              <span><strong>4.9</strong><small>guest rating</small></span>
            </div>
            <div class="floating-location">
              <span class="location-pin"><ion-icon :icon="locationOutline" /></span>
              <span><strong>Quezon City</strong><small>Metro Manila, PH</small></span>
            </div>
            <span class="scribble">made for living</span>
          </div>
        </section>

        <section id="explore" class="discover-section" aria-labelledby="discover-title">
          <div class="section-heading">
            <div>
              <div class="eyebrow"><span class="eyebrow-line" /> HANDPICKED FOR YOU</div>
              <h2 id="discover-title">Spaces worth<br /><em>coming home to.</em></h2>
            </div>
            <a class="view-all" href="/browse">View all stays <ion-icon :icon="arrowForwardOutline" /></a>
          </div>

          <div class="stay-grid">
            <article v-for="stay in stays" :key="stay.name" class="stay-card">
              <div class="stay-image" :style="{ backgroundImage: `url(${stay.image})` }">
                <span class="stay-badge" v-if="stay.badge">{{ stay.badge }}</span>
                <button class="heart-button" type="button" :aria-label="`Save ${stay.name}`">
                  <ion-icon :icon="heartOutline" />
                </button>
              </div>
              <div class="stay-details">
                <div class="stay-title-row">
                  <h3>{{ stay.name }}</h3>
                  <span class="stay-rating"><ion-icon :icon="star" /> {{ stay.rating }}</span>
                </div>
                <p>{{ stay.location }}</p>
                <div class="stay-footer"><strong>₱{{ stay.price.toLocaleString() }}<small> / month</small></strong><span>{{ stay.type }}</span></div>
              </div>
            </article>
          </div>
        </section>

        <section id="how-it-works" class="trust-strip">
          <div class="trust-intro"><span class="mini-sparkle">✦</span><strong>Casa makes<br />moving easy.</strong></div>
          <div class="trust-item"><span class="trust-icon"><ion-icon :icon="shieldCheckmarkOutline" /></span><span><strong>Verified spaces</strong><small>See it, love it, trust it.</small></span></div>
          <div class="trust-item"><span class="trust-icon"><ion-icon :icon="sparklesOutline" /></span><span><strong>Made for you</strong><small>Filters that get your vibe.</small></span></div>
          <div class="trust-item"><span class="trust-icon"><ion-icon :icon="chatbubbleEllipsesOutline" /></span><span><strong>Real support</strong><small>We’re here when you need us.</small></span></div>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonIcon,
  IonPage,
} from '@ionic/vue';
import {
  arrowForwardOutline,
  calendarOutline,
  chatbubbleEllipsesOutline,
  heartOutline,
  locationOutline,
  menuOutline,
  searchOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  star,
  walletOutline,
} from 'ionicons/icons';

const stays = [
  {
    name: 'The Greenhouse',
    location: 'Katipunan, Quezon City',
    price: 8500,
    rating: '4.9',
    type: 'Private room',
    badge: 'Casa favorite',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Sage House',
    location: 'Poblacion, Makati',
    price: 7200,
    rating: '4.8',
    type: 'Bedspace',
    badge: 'New on Casa',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Casa Amara',
    location: 'Cebu IT Park, Cebu',
    price: 9800,
    rating: '5.0',
    type: 'Private room',
    badge: '',
    image: 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85',
  },
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');

:global(body) { background: #fbfaf7; color: #1d3a2b; font-family: 'DM Sans', sans-serif; }
:global(*) { box-sizing: border-box; }
.home-content { --background: #fbfaf7; }
.home-shell { max-width: 1240px; margin: 0 auto; padding: 0 42px 60px; overflow: hidden; }
.nav-bar { height: 94px; display: flex; align-items: center; justify-content: space-between; gap: 30px; }
.brand { display: flex; align-items: center; gap: 9px; color: #174b35; font-size: 27px; font-weight: 700; letter-spacing: -1.5px; text-decoration: none; }
.brand-mark { width: 38px; height: 38px; object-fit: contain; }
.brand-dot { color: #e2743e; }
.nav-links { display: flex; gap: 34px; margin-left: auto; margin-right: 26px; }
.nav-links a, .login-button { color: #587065; font-size: 13px; font-weight: 600; text-decoration: none; }
.nav-links a:hover, .login-button:hover { color: #e2743e; }
.nav-actions { display: flex; align-items: center; gap: 18px; }
button { border: 0; cursor: pointer; font: inherit; }
.login-button { background: transparent; }
.signup-button { background: #174b35; border-radius: 24px; color: white; font-size: 13px; font-weight: 700; padding: 12px 22px; transition: transform .25s, background .25s; }
.signup-button:hover { background: #e2743e; transform: translateY(-2px); }
.menu-button { display: none; background: transparent; color: #174b35; font-size: 24px; }
.hero-section { display: grid; grid-template-columns: 53% 47%; min-height: 510px; padding: 62px 0 70px; position: relative; }
.hero-copy { position: relative; z-index: 1; }
.eyebrow { align-items: center; color: #e2743e; display: flex; font-size: 10px; font-weight: 700; gap: 9px; letter-spacing: 1.7px; }
.eyebrow-line { background: #e2743e; display: inline-block; height: 1px; width: 25px; }
h1, h2 { color: #174b35; font-family: 'Playfair Display', Georgia, serif; letter-spacing: -2.8px; margin: 18px 0; }
h1 { font-size: clamp(54px, 6vw, 78px); line-height: .99; }
h1 em, h2 em { color: #e2743e; font-weight: 600; }
.hero-description { color: #718078; font-size: 15px; line-height: 1.65; margin: 0 0 30px; max-width: 350px; }
.search-card { align-items: center; background: white; border: 1px solid #e8e9e3; border-radius: 14px; box-shadow: 0 15px 38px rgba(36, 75, 57, .09); display: flex; gap: 0; max-width: 640px; padding: 9px; position: relative; z-index: 2; }
.search-field { align-items: center; border-right: 1px solid #e8e9e3; display: flex; gap: 10px; min-width: 145px; padding: 7px 14px; }
.search-field ion-icon { color: #e2743e; font-size: 19px; }
.search-field span { display: flex; flex-direction: column; min-width: 0; }
.search-field small { color: #174b35; font-size: 10px; font-weight: 700; margin-bottom: 3px; }
.search-field input { appearance: none; background: #fff; border: 0; color: #718078; color-scheme: light; font: inherit; font-size: 11px; outline: 0; padding: 0; width: 100px; }
.search-field input::placeholder { color: #a8b0aa; }
.search-button { align-items: center; background: #e2743e; border-radius: 10px; color: white; display: flex; font-size: 12px; font-weight: 700; gap: 7px; margin-left: 7px; padding: 15px 18px; transition: background .25s, transform .25s; }
.search-button:hover { background: #c95f2d; transform: scale(1.03); }
.hero-proof { align-items: center; display: flex; gap: 12px; margin-top: 30px; }
.avatar-stack { display: flex; padding-left: 8px; }
.avatar { align-items: center; border: 2px solid #fbfaf7; border-radius: 50%; color: white; display: flex; font-size: 9px; font-weight: 700; height: 31px; justify-content: center; margin-left: -8px; width: 31px; }
.avatar-one { background: #e39762; }.avatar-two { background: #6b8e67; }.avatar-three { background: #b67b55; }
.hero-proof p { color: #174b35; font-size: 11px; line-height: 1.35; margin: 0; }.hero-proof strong { font-size: 12px; }.hero-proof p span { color: #819087; }
.hero-visual { align-items: center; display: flex; justify-content: center; position: relative; }
.sun-shape { background: #f9ddb0; border-radius: 50%; height: 350px; position: absolute; right: 2%; top: -35px; width: 350px; }
.hero-image { background: linear-gradient(180deg, rgba(23,75,53,0) 50%, rgba(23,75,53,.35)), url('https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85') center/cover; border-radius: 180px 180px 12px 12px; box-shadow: 18px 22px 0 #d9e4d4; height: 390px; position: relative; transform: rotate(3deg); width: 300px; z-index: 1; }
.floating-rating, .floating-location { align-items: center; background: white; border-radius: 10px; box-shadow: 0 12px 25px rgba(36,75,57,.12); display: flex; gap: 9px; padding: 11px 14px; position: absolute; z-index: 3; }
.floating-rating { left: 0; top: 77px; animation: float 4s ease-in-out infinite; }.floating-location { bottom: 47px; right: 0; animation: float 4s ease-in-out 1s infinite; }
.rating-icon, .location-pin { align-items: center; background: #fff2d9; border-radius: 8px; color: #e2743e; display: flex; font-size: 17px; height: 32px; justify-content: center; width: 32px; }
.floating-location .location-pin { background: #e4f0df; color: #3f8058; }
.floating-rating span:last-child, .floating-location span:last-child { display: flex; flex-direction: column; }.floating-rating strong, .floating-location strong { color: #174b35; font-size: 11px; }.floating-rating small, .floating-location small { color: #8a978e; font-size: 9px; margin-top: 2px; }
.scribble { bottom: 9px; color: #e2743e; font-family: 'Playfair Display', serif; font-size: 14px; font-style: italic; position: absolute; right: 32px; transform: rotate(-8deg); z-index: 2; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
.discover-section { padding: 25px 0 62px; }
.section-heading { align-items: end; display: flex; justify-content: space-between; margin-bottom: 28px; }.section-heading h2 { font-size: 43px; line-height: 1.05; margin: 14px 0 0; }
.view-all { align-items: center; color: #174b35; display: flex; font-size: 12px; font-weight: 700; gap: 8px; text-decoration: none; }.view-all ion-icon { color: #e2743e; font-size: 17px; transition: transform .2s; }.view-all:hover ion-icon { transform: translateX(4px); }
.stay-grid { display: grid; gap: 22px; grid-template-columns: repeat(3, 1fr); }
.stay-card { background: white; border-radius: 13px; box-shadow: 0 7px 20px rgba(36,75,57,.06); overflow: hidden; transition: box-shadow .3s, transform .3s; }.stay-card:hover { box-shadow: 0 16px 32px rgba(36,75,57,.13); transform: translateY(-7px); }
.stay-image { background-position: center; background-size: cover; height: 205px; position: relative; }.stay-badge { background: #fbfaf7; border-radius: 5px; color: #174b35; font-size: 10px; font-weight: 700; left: 12px; padding: 7px 9px; position: absolute; top: 12px; }.heart-button { align-items: center; background: rgba(255,255,255,.88); border-radius: 50%; color: #174b35; display: flex; font-size: 18px; height: 33px; justify-content: center; position: absolute; right: 12px; top: 12px; width: 33px; }.heart-button:hover { color: #e2743e; }
.stay-details { padding: 15px 17px 17px; }.stay-title-row { align-items: center; display: flex; justify-content: space-between; }.stay-title-row h3 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 18px; margin: 0; }.stay-rating { align-items: center; color: #174b35; display: flex; font-size: 11px; font-weight: 700; gap: 3px; }.stay-rating ion-icon { color: #e2743e; font-size: 14px; }.stay-details p { color: #87928a; font-size: 11px; margin: 6px 0 18px; }.stay-footer { align-items: end; border-top: 1px solid #eff0ec; display: flex; justify-content: space-between; padding-top: 13px; }.stay-footer strong { color: #e2743e; font-size: 16px; }.stay-footer small { color: #89938c; font-size: 10px; font-weight: 400; }.stay-footer span { color: #829088; font-size: 10px; }
.trust-strip { align-items: center; background: #174b35; border-radius: 15px; color: white; display: grid; gap: 20px; grid-template-columns: 1.1fr repeat(3, 1fr); padding: 24px 30px; }.trust-intro { align-items: center; display: flex; gap: 14px; }.trust-intro strong { font-family: 'Playfair Display', serif; font-size: 20px; line-height: 1.1; }.mini-sparkle { color: #f4b568; font-size: 28px; }.trust-item { align-items: center; border-left: 1px solid rgba(255,255,255,.2); display: flex; gap: 11px; padding-left: 22px; }.trust-icon { align-items: center; background: rgba(255,255,255,.12); border-radius: 50%; color: #f5b66f; display: flex; font-size: 19px; height: 38px; justify-content: center; width: 38px; }.trust-item span:last-child { display: flex; flex-direction: column; }.trust-item strong { font-size: 11px; }.trust-item small { color: #b8c9bf; font-size: 9px; margin-top: 4px; }
@media (max-width: 900px) { .home-shell { padding: 0 24px 40px; }.nav-links { gap: 15px; margin-right: 0; }.hero-section { grid-template-columns: 55% 45%; }.search-card { flex-wrap: wrap; }.search-field { flex: 1; }.search-button { margin-top: 7px; width: calc(100% - 7px); justify-content: center; }.hero-image { height: 330px; width: 240px; }.sun-shape { height: 280px; width: 280px; }.trust-strip { grid-template-columns: repeat(2, 1fr); }.trust-intro { grid-column: span 2; }.trust-item:nth-child(3) { border-left: 0; } }
@media (max-width: 620px) { .home-shell { padding: 0 18px 35px; }.nav-bar { height: 75px; }.nav-links, .login-button { display: none; }.menu-button { display: flex; }.hero-section { display: flex; flex-direction: column; padding: 39px 0 55px; }.hero-copy { display: flex; flex-direction: column; }.hero-section h1 { font-size: 56px; }.hero-description { font-size: 14px; }.search-card { display: grid; grid-template-columns: 1fr 1fr; padding: 8px; }.search-field { border-bottom: 1px solid #e8e9e3; border-right: 0; min-width: 0; padding: 11px 7px; }.search-field:nth-child(odd) { border-right: 1px solid #e8e9e3; }.search-field input { width: 100%; }.search-button { grid-column: span 2; margin: 7px 0 0; width: auto; }.hero-visual { min-height: 365px; margin-top: 30px; }.hero-image { height: 330px; width: 250px; }.floating-rating { left: 2px; top: 37px; }.floating-location { bottom: 27px; right: 0; }.section-heading { align-items: start; flex-direction: column; gap: 20px; }.section-heading h2 { font-size: 37px; }.stay-grid { grid-template-columns: 1fr; }.stay-image { height: 230px; }.trust-strip { display: flex; flex-direction: column; align-items: stretch; padding: 25px; }.trust-intro { margin-bottom: 7px; }.trust-item { border-left: 0; border-top: 1px solid rgba(255,255,255,.2); padding: 15px 0 0; }.trust-item:nth-child(3) { border-top: 1px solid rgba(255,255,255,.2); } }
</style>
