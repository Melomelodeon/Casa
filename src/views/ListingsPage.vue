<template>
  <ion-page>
    <ion-content :fullscreen="true" class="listings-content">
      <header class="listings-header">
        <a class="brand" href="/home" aria-label="Casa home">
          <img :src="'/casa-logo.png'" alt="" class="brand-mark" />
          <span>casa<span class="brand-dot">.</span></span>
        </a>
        <nav class="header-nav">
          <a href="/browse"><ion-icon :icon="mapOutline" /> Explore map</a>
          <a href="/signup?role=landlord">List your space</a>
          <a class="account-link" href="/login?role=tenant"><ion-icon :icon="personOutline" /> Log in</a>
        </nav>
      </header>

      <main class="listings-shell">
        <div class="page-intro">
          <div>
            <span class="eyebrow">FIND YOUR NEXT CASA</span>
            <h1>Spaces made for<br /><em>your everyday.</em></h1>
            <p>Browse verified bedspaces and boarding houses that fit your lifestyle and budget.</p>
          </div>
          <a class="map-link" href="/browse"><ion-icon :icon="mapOutline" /> View on map <ion-icon :icon="arrowForwardOutline" /></a>
        </div>

        <section class="search-panel" aria-label="Listing filters">
          <label class="search-input"><ion-icon :icon="searchOutline" /><input v-model="searchTerm" type="search" placeholder="Search by city, school, or area" aria-label="Search listings" /></label>
          <label class="select-filter"><span>Type</span><select v-model="typeFilter" aria-label="Filter by room type"><option value="all">All spaces</option><option value="Private room">Private room</option><option value="Bedspace">Bedspace</option></select></label>
          <label class="select-filter"><span>Monthly budget</span><select v-model="budgetFilter" aria-label="Filter by budget"><option value="all">Any budget</option><option value="under-8k">Under ₱8,000</option><option value="8k-10k">₱8,000 – ₱10,000</option></select></label>
          <label class="sort-filter"><span>Sort by</span><select v-model="sortBy" aria-label="Sort listings"><option value="recommended">Recommended</option><option value="price-low">Lowest price</option><option value="price-high">Highest price</option><option value="rating">Top rated</option></select></label>
        </section>

        <div class="results-toolbar">
          <p><strong>{{ filteredListings.length }}</strong> spaces to explore</p>
          <button class="filter-button" type="button" @click="clearFilters"><ion-icon :icon="optionsOutline" /> Clear filters</button>
        </div>

        <section class="listing-grid" aria-label="Available Casa listings">
          <article v-for="listing in filteredListings" :key="listing.id" class="listing-card" role="button" tabindex="0" @click="openListing(listing)" @keydown.enter="openListing(listing)">
            <div class="listing-image" :style="{ backgroundImage: `url(${listing.image})` }">
              <span v-if="listing.badge" class="badge">{{ listing.badge }}</span>
              <button class="favorite" :class="{ liked: favorites.has(listing.id) }" type="button" :aria-label="`Save ${listing.name}`" @click="toggleFavorite(listing.id)">
                <ion-icon :icon="favorites.has(listing.id) ? heart : heartOutline" />
              </button>
            </div>
            <div class="listing-details">
              <div class="title-line"><h2>{{ listing.name }}</h2><span class="rating"><ion-icon :icon="star" /> {{ listing.rating }}</span></div>
              <p class="location"><ion-icon :icon="locationOutline" /> {{ listing.location }}</p>
              <p class="description">{{ listing.description }}</p>
              <div class="card-footer"><strong>₱{{ listing.price.toLocaleString() }}<small> / month</small></strong><span>{{ listing.type }}</span></div>
            </div>
          </article>
          <div v-if="filteredListings.length === 0" class="empty-state"><ion-icon :icon="searchOutline" /><h2>Nothing found just yet.</h2><p>Try another area or remove one of your filters.</p><button type="button" @click="clearFilters">Show all spaces</button></div>
        </section>

        <section class="host-banner">
          <div class="banner-sparkle">✦</div>
          <div><span>HAVE A SPACE TO SHARE?</span><h2>Make room for someone’s next chapter.</h2></div>
          <a href="/signup?role=landlord">Become a Casa host <ion-icon :icon="arrowForwardOutline" /></a>
        </section>
      </main>
      <div v-if="selectedListing" class="detail-backdrop" @click.self="selectedListing = null">
        <section class="detail-panel" role="dialog" aria-modal="true" :aria-labelledby="`detail-${selectedListing.id}`">
          <button class="detail-close" type="button" aria-label="Close listing details" @click="selectedListing = null">×</button>
          <img class="detail-image" :src="selectedListing.image || defaultListingImage" :alt="selectedListing.name" @error="useDefaultImage" />
          <div class="detail-body">
            <span class="eyebrow">{{ selectedListing.type === 'Private room' ? 'PRIVATE ROOM' : 'BEDSPACE' }}</span>
            <div class="detail-title"><div><h2 :id="`detail-${selectedListing.id}`">{{ selectedListing.name }}</h2><p class="location"><ion-icon :icon="locationOutline" /> {{ selectedListing.location }}</p></div><span class="rating"><ion-icon :icon="star" /> {{ selectedListing.rating }}</span></div>
            <p class="detail-description">{{ selectedListing.description }}</p>
            <div class="visual-heading"><strong>{{ selectedListing.type === 'Private room' ? 'Room visualization' : 'Bedspace visualization' }}</strong><span>{{ selectedListing.type === 'Private room' ? 'Beds inside: 1' : 'Shared sleeping spaces' }}</span></div>
            <div class="room-preview">
              <button v-for="space in selectedSpaces" :key="space.name" class="visual-bed" :class="{ occupied: space.status === 'occupied', selected: selectedSpace?.name === space.name, 'rejected-click': rejectedSpace === space.name }" type="button" :aria-disabled="space.status === 'occupied' ? 'true' : undefined" :aria-label="`${space.name}, ${space.status === 'occupied' ? 'occupied' : 'available'}`" :aria-pressed="selectedSpace?.name === space.name" @click="selectSpace(space)">
                <img :src="space.image || defaultListingImage" :alt="space.name" @error="useDefaultImage" />
                <b>{{ space.name }}</b><small>{{ space.status === 'occupied' ? 'Occupied' : 'Available' }}</small>
              </button>
            </div>
            <div class="detail-status"><span><i class="free-dot" /> Available</span><span><i class="busy-dot" /> Occupied</span></div>
            <div v-if="selectedSpace" class="booking-panel">
              <img :src="selectedSpace.image || defaultListingImage" :alt="selectedSpace.name" @error="useDefaultImage" />
              <div class="booking-info"><span class="eyebrow">READY TO BOOK</span><strong>{{ selectedSpace.name }}</strong><small>{{ selectedListing.name }} · ₱{{ selectedListing.price.toLocaleString() }} / month</small></div>
              <button type="button" class="booking-button" @click="startBooking">Continue booking <ion-icon :icon="arrowForwardOutline" /></button>
            </div>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowForwardOutline, heart, heartOutline, locationOutline, mapOutline, optionsOutline, personOutline, searchOutline, star } from 'ionicons/icons';

type Listing = { id: number; name: string; location: string; price: number; rating: string; type: string; badge: string; description: string; image?: string };
type VisualSpace = { name: string; status: 'available' | 'occupied'; image?: string };
const defaultListingImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85';
const listings: Listing[] = [
  { id: 1, name: 'The Greenhouse', location: 'Katipunan, Quezon City', price: 8500, rating: '4.9', type: 'Private room', badge: 'Casa favorite', description: 'A sun-filled room near campus with a warm, creative community.', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85' },
  { id: 2, name: 'Sage House', location: 'Poblacion, Makati', price: 7200, rating: '4.8', type: 'Bedspace', badge: 'New on Casa', description: 'Thoughtfully designed shared living in the heart of the city.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85' },
  { id: 3, name: 'Casa Amara', location: 'Cebu IT Park, Cebu', price: 9800, rating: '5.0', type: 'Private room', badge: '', description: 'Your calm corner with everything you need close by.', image: 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85' },
  { id: 4, name: 'The Olive Room', location: 'Lahug, Cebu City', price: 6500, rating: '4.7', type: 'Bedspace', badge: 'Great value', description: 'Easy, breezy living with a view and room to make it yours.', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85' },
  { id: 5, name: 'Moss & Morning', location: 'Diliman, Quezon City', price: 7900, rating: '4.9', type: 'Private room', badge: '', description: 'A quiet, plant-filled home base for busy city days.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85' },
  { id: 6, name: 'The Nook', location: 'Taft, Manila', price: 5800, rating: '4.6', type: 'Bedspace', badge: 'Budget pick', description: 'Simple, bright, and close to everything you need.', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=85' },
];
const searchTerm = ref('');
const typeFilter = ref('all');
const budgetFilter = ref('all');
const sortBy = ref('recommended');
const favorites = ref(new Set<number>());
const selectedListing = ref<Listing | null>(null);
const selectedSpace = ref<VisualSpace | null>(null);
const rejectedSpace = ref<string | null>(null);
let rejectedSpaceTimer: number | undefined;
const router = useRouter();
const filteredListings = computed(() => {
  const term = searchTerm.value.toLowerCase();
  const result = listings.filter((listing) => {
    const searchMatch = !term || `${listing.name} ${listing.location} ${listing.type}`.toLowerCase().includes(term);
    const typeMatch = typeFilter.value === 'all' || listing.type === typeFilter.value;
    const budgetMatch = budgetFilter.value === 'all' || (budgetFilter.value === 'under-8k' ? listing.price < 8000 : listing.price >= 8000 && listing.price <= 10000);
    return searchMatch && typeMatch && budgetMatch;
  });
  return [...result].sort((a, b) => sortBy.value === 'price-low' ? a.price - b.price : sortBy.value === 'price-high' ? b.price - a.price : sortBy.value === 'rating' ? Number(b.rating) - Number(a.rating) : a.id - b.id);
});
function toggleFavorite(id: number) {
  const next = new Set(favorites.value);
  next.has(id) ? next.delete(id) : next.add(id);
  favorites.value = next;
}
function openListing(listing: Listing) {
  selectedListing.value = listing;
  selectedSpace.value = null;
}
function selectSpace(space: VisualSpace) {
  if (space.status === 'occupied') {
    rejectedSpace.value = null;
    window.requestAnimationFrame(() => {
      rejectedSpace.value = space.name;
    });
    window.clearTimeout(rejectedSpaceTimer);
    rejectedSpaceTimer = window.setTimeout(() => {
      rejectedSpace.value = null;
    }, 420);
    return;
  }
  selectedSpace.value = selectedSpace.value?.name === space.name ? null : space;
}
function startBooking() {
  if (!selectedSpace.value || !selectedListing.value) return;
  void router.push({
    name: 'Checkout',
    query: {
      listing: selectedListing.value.name,
      location: selectedListing.value.location,
      price: String(selectedListing.value.price),
      type: selectedListing.value.type,
      space: selectedSpace.value.name,
      image: selectedSpace.value.image || selectedListing.value.image || defaultListingImage,
    },
  });
}
const selectedSpaces = computed<VisualSpace[]>(() => {
  if (!selectedListing.value) return [];
  return selectedListing.value.type === 'Private room'
    ? [{ name: 'Private bed', status: 'available' as const, image: selectedListing.value.image }]
    : [
        { name: 'Bed 01', status: 'available' as const },
        { name: 'Bed 02', status: 'occupied' as const },
        { name: 'Bed 03', status: 'available' as const },
      ];
});
function useDefaultImage(event: Event) {
  const image = event.target as HTMLImageElement;
  image.src = defaultListingImage;
}
function clearFilters() {
  searchTerm.value = '';
  typeFilter.value = 'all';
  budgetFilter.value = 'all';
  sortBy.value = 'recommended';
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
:global(body) { background: #fbfaf7; color: #174b35; font-family: 'DM Sans', sans-serif; } :global(*) { box-sizing: border-box; }
.listings-content { --background: #fbfaf7; }.listings-header { align-items: center; background: white; border-bottom: 1px solid #e7ebe5; display: flex; height: 78px; justify-content: space-between; padding: 0 clamp(22px, 5vw, 74px); }.brand { align-items: center; color: #174b35; display: flex; font-size: 26px; font-weight: 700; gap: 8px; letter-spacing: -1.5px; text-decoration: none; }.brand-mark { height: 35px; width: 35px; }.brand-dot { color: #e2743e; }.header-nav { align-items: center; display: flex; gap: 27px; }.header-nav a { align-items: center; color: #61746a; display: flex; font-size: 11px; font-weight: 600; gap: 5px; text-decoration: none; }.header-nav a:hover { color: #e2743e; }.header-nav ion-icon { color: #e2743e; font-size: 16px; }.account-link { border: 1px solid #e0e8df; border-radius: 20px; padding: 10px 14px; }
.listings-shell { margin: 0 auto; max-width: 1240px; padding: 58px 38px 70px; }.page-intro { align-items: end; display: flex; justify-content: space-between; }.eyebrow { color: #e2743e; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; }.page-intro h1 { color: #174b35; font-family: 'Playfair Display', serif; font-size: clamp(42px, 5vw, 63px); letter-spacing: -2.7px; line-height: .98; margin: 17px 0 12px; }.page-intro h1 em { color: #e2743e; font-weight: 600; }.page-intro p { color: #819087; font-size: 13px; margin: 0; }.map-link { align-items: center; border-bottom: 1px solid #e2743e; color: #174b35; display: flex; font-size: 12px; font-weight: 700; gap: 7px; padding-bottom: 5px; text-decoration: none; }.map-link ion-icon:first-child { color: #e2743e; font-size: 17px; }.map-link ion-icon:last-child { color: #e2743e; font-size: 15px; }.search-panel { align-items: center; background: white; border: 1px solid #e5ebe4; border-radius: 12px; box-shadow: 0 10px 25px rgba(23,75,53,.06); display: flex; gap: 0; margin: 44px 0 27px; padding: 8px; }.search-input { align-items: center; display: flex; flex: 1.5; gap: 9px; padding: 0 14px; }.search-input ion-icon { color: #e2743e; font-size: 19px; }.search-input input { appearance: none; background: #fff; border: 0; color: #174b35; color-scheme: light; flex: 1; font: inherit; font-size: 11px; outline: 0; padding: 12px 0; }.search-input input::placeholder { color: #a6b0a8; }.select-filter, .sort-filter { border-left: 1px solid #e8ece7; color: #89958d; font-size: 9px; padding: 2px 17px; }.select-filter { display: flex; flex: 1; flex-direction: column; gap: 4px; }.select-filter span { color: #174b35; font-size: 10px; font-weight: 700; }.select-filter select, .sort-filter { background: white; border: 0; color: #7d8a81; font: inherit; outline: 0; }.sort-filter { min-height: 40px; }.results-toolbar { align-items: center; display: flex; justify-content: space-between; }.results-toolbar p { color: #87938b; font-size: 11px; }.results-toolbar strong { color: #174b35; }.filter-button { background: transparent; color: #e2743e; display: flex; font-size: 10px; font-weight: 700; gap: 6px; }.listing-grid { display: grid; gap: 23px; grid-template-columns: repeat(3, 1fr); margin-top: 9px; }.listing-card { background: white; border-radius: 12px; box-shadow: 0 5px 17px rgba(23,75,53,.06); overflow: hidden; transition: box-shadow .25s, transform .25s; }.listing-card:hover { box-shadow: 0 14px 28px rgba(23,75,53,.13); transform: translateY(-5px); }.listing-image { background-position: center; background-size: cover; height: 220px; position: relative; }.badge { background: #fbfaf7; border-radius: 5px; color: #174b35; font-size: 10px; font-weight: 700; left: 13px; padding: 7px 9px; position: absolute; top: 13px; }.favorite { align-items: center; background: rgba(255,255,255,.9); border-radius: 50%; color: #174b35; display: flex; font-size: 19px; height: 35px; justify-content: center; position: absolute; right: 13px; top: 13px; width: 35px; }.favorite.liked { color: #e2743e; }.listing-details { padding: 17px 18px 18px; }.title-line { align-items: center; display: flex; gap: 10px; justify-content: space-between; }.title-line h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 20px; margin: 0; }.rating { align-items: center; color: #174b35; display: flex; font-size: 11px; font-weight: 700; gap: 3px; }.rating ion-icon { color: #e2743e; font-size: 14px; }.location { align-items: center; color: #7f8d84; display: flex; font-size: 11px; gap: 5px; margin: 7px 0 12px; }.location ion-icon { color: #e2743e; font-size: 14px; }.description { color: #89958d; font-size: 11px; line-height: 1.5; margin: 0 0 18px; }.card-footer { align-items: center; border-top: 1px solid #edf0ec; display: flex; justify-content: space-between; padding-top: 13px; }.card-footer strong { color: #e2743e; font-size: 17px; }.card-footer small { color: #8b978f; font-size: 10px; font-weight: 400; }.card-footer span { color: #819087; font-size: 10px; }.empty-state { grid-column: 1 / -1; padding: 70px 20px; text-align: center; }.empty-state ion-icon { color: #e2743e; font-size: 32px; }.empty-state h2 { font-family: 'Playfair Display', serif; margin: 12px 0 5px; }.empty-state p { color: #87938b; font-size: 11px; }.empty-state button, .host-banner a { background: #174b35; border-radius: 20px; color: white; font-size: 11px; font-weight: 700; padding: 11px 17px; text-decoration: none; }.host-banner { align-items: center; background: #174b35; border-radius: 14px; color: white; display: flex; gap: 18px; justify-content: space-between; margin-top: 62px; padding: 24px 30px; }.banner-sparkle { color: #f6b264; font-size: 31px; }.host-banner span { color: #f6b264; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; }.host-banner h2 { font-family: 'Playfair Display', serif; font-size: 23px; margin: 7px 0 0; }.host-banner a { align-items: center; background: #e2743e; display: flex; gap: 7px; white-space: nowrap; }.host-banner a ion-icon { font-size: 15px; }
@media (max-width: 850px) { .listings-shell { padding: 42px 22px 55px; }.listing-grid { grid-template-columns: repeat(2, 1fr); }.listing-image { height: 200px; }.search-panel { flex-wrap: wrap; }.search-input { flex-basis: 100%; }.select-filter, .sort-filter { margin-top: 4px; padding: 8px 12px; }.host-banner { align-items: start; flex-direction: column; }.host-banner a { margin-left: 49px; } }
@media (max-width: 580px) { .listings-header { height: 70px; padding: 0 18px; }.header-nav { gap: 10px; }.header-nav a:not(.account-link) { display: none; }.account-link { font-size: 10px !important; }.listings-shell { padding: 37px 18px 45px; }.page-intro { align-items: start; flex-direction: column; gap: 25px; }.page-intro h1 { font-size: 47px; }.map-link { align-self: end; }.search-panel { align-items: stretch; flex-direction: column; gap: 0; margin-top: 30px; padding: 7px; }.search-input { border-bottom: 1px solid #e8ece7; padding: 3px 10px; }.select-filter, .sort-filter { border-bottom: 1px solid #e8ece7; border-left: 0; margin: 0; padding: 12px 10px; }.sort-filter { border: 0; }.listing-grid { grid-template-columns: 1fr; gap: 18px; }.listing-image { height: 235px; }.host-banner { margin-top: 45px; padding: 22px; }.host-banner h2 { font-size: 20px; }.host-banner a { margin-left: 0; } }

.listing-card { cursor: pointer; }.listing-card:focus-visible { outline: 3px solid rgba(226,116,62,.45); outline-offset: 3px; }
.detail-backdrop { align-items: center; background: rgba(15,38,27,.64); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 20; }.detail-panel { background: #fbfaf7; border-radius: 16px; box-shadow: 0 25px 60px rgba(0,0,0,.25); max-height: 92vh; max-width: 660px; overflow-y: auto; position: relative; width: 100%; }.detail-close { align-items: center; background: rgba(255,255,255,.92); border-radius: 50%; color: #174b35; display: flex; font-size: 25px; height: 34px; justify-content: center; position: absolute; right: 15px; top: 15px; width: 34px; z-index: 2; }.detail-image { display: block; height: 230px; object-fit: cover; width: 100%; }.detail-body { padding: 24px 28px 28px; }.detail-title { align-items: start; display: flex; justify-content: space-between; }.detail-title h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 30px; letter-spacing: -1px; margin: 8px 0 4px; }.detail-title .location { margin: 0; }.detail-description { color: #829088; font-size: 11px; line-height: 1.5; margin: 16px 0 18px; }.visual-heading { align-items: center; border-bottom: 1px solid #e4eae3; display: flex; justify-content: space-between; padding-bottom: 10px; }.visual-heading strong { color: #174b35; font-family: 'Playfair Display', serif; font-size: 16px; }.visual-heading span { color: #87958b; font-size: 10px; }.room-preview { align-items: stretch; background: #f3f6f1; border: 1px solid #dce7da; border-radius: 9px; display: flex; gap: 10px; justify-content: center; min-height: 150px; overflow: hidden; padding: 16px; }.visual-bed { background: #fff; border: 2px solid #76ae80; border-radius: 8px 8px 4px 4px; box-shadow: 0 4px 7px rgba(23,75,53,.18); color: inherit; cursor: pointer; display: flex; flex: 1; flex-direction: column; font: inherit; min-height: 86px; max-width: 145px; overflow: hidden; padding: 6px; position: relative; text-align: left; transition: border-color .2s, box-shadow .2s, transform .2s; }.visual-bed:hover, .visual-bed:focus-visible { border-color: #e2743e; box-shadow: 0 6px 12px rgba(23,75,53,.22); outline: 0; transform: translateY(-3px); }.visual-bed.selected { border-color: #e2743e; box-shadow: 0 0 0 3px rgba(226,116,62,.2), 0 6px 12px rgba(23,75,53,.22); }.visual-bed.occupied { border-color: #b7c1b8; cursor: not-allowed; }.visual-bed.rejected-click { animation: rejected-bed .42s ease; border-color: #d4775c; }.visual-bed img { border-radius: 4px; display: block; height: 72px; margin: 0 -2px 5px; object-fit: cover; width: calc(100% + 4px); }.visual-bed b, .visual-bed small { position: relative; z-index: 1; }.visual-bed b { color: #174b35; font-size: 9px; margin-top: 5px; }.visual-bed small { color: #4a9058; font-size: 8px; margin-top: 2px; }.visual-bed.occupied small { color: #89968d; }.detail-status { display: flex; gap: 16px; margin-top: 12px; }.detail-status span { align-items: center; color: #718177; display: flex; font-size: 9px; gap: 6px; }.free-dot, .busy-dot { background: #4b9b61; border-radius: 50%; height: 8px; width: 8px; }.busy-dot { background: #b7c1b8; }.booking-panel { align-items: center; background: #fff; border: 1px solid #e5ebe4; border-radius: 10px; box-shadow: 0 8px 18px rgba(23,75,53,.08); display: flex; gap: 12px; margin-top: 16px; padding: 9px; }.booking-panel img { border-radius: 7px; height: 58px; object-fit: cover; width: 66px; }.booking-info { display: flex; flex: 1; flex-direction: column; gap: 3px; min-width: 0; }.booking-info .eyebrow { font-size: 8px; }.booking-info strong { color: #174b35; font-size: 12px; }.booking-info small { color: #87958b; font-size: 9px; }.booking-button { align-items: center; background: #e2743e; border-radius: 6px; color: #fff; display: flex; font-size: 9px; font-weight: 700; gap: 5px; padding: 10px 11px; white-space: nowrap; }.booking-button ion-icon { font-size: 13px; }
@keyframes rejected-bed { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-3px); } }
@media (max-width: 580px) { .detail-backdrop { align-items: end; padding: 0; }.detail-panel { border-radius: 16px 16px 0 0; max-height: 92vh; }.detail-image { height: 175px; }.detail-body { padding: 22px 18px 25px; }.detail-title h2 { font-size: 26px; }.room-preview { padding: 10px; } }
@media (max-width: 580px) { .listings-header { height: 70px; padding: 0 18px; }.header-nav { gap: 10px; }.header-nav a:not(.account-link) { display: none; }.account-link { font-size: 10px !important; }.listings-shell { padding: 37px 18px 45px; }.page-intro { align-items: start; flex-direction: column; gap: 25px; }.page-intro h1 { font-size: 47px; }.map-link { align-self: end; }.search-panel { align-items: stretch; flex-direction: column; gap: 0; margin-top: 30px; padding: 7px; }.search-input { border-bottom: 1px solid #e8ece7; padding: 3px 10px; }.select-filter, .sort-filter { border-bottom: 1px solid #e8ece7; border-left: 0; margin: 0; padding: 12px 10px; }.sort-filter { border: 0; }.listing-grid { grid-template-columns: 1fr; gap: 18px; }.listing-image { height: 235px; }.host-banner { margin-top: 45px; padding: 22px; }.host-banner h2 { font-size: 20px; }.host-banner a { margin-left: 0; } }

.select-filter, .sort-filter { background: #fff; border-left: 1px solid #e8ece7; color: #174b35; display: flex; flex-direction: column; gap: 5px; justify-content: center; min-height: 48px; padding: 4px 17px; }
.select-filter span, .sort-filter span { color: #87958b; font-size: 9px; font-weight: 600; }
.select-filter select, .sort-filter select { appearance: none; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='m1 1 4 4 4-4' fill='none' stroke='%23e2743e' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5'/%3E%3C/svg%3E") no-repeat right center; border: 0; color: #174b35; color-scheme: light; cursor: pointer; font: inherit; font-size: 11px; font-weight: 600; min-width: 125px; outline: 0; padding: 0 17px 0 0; }
.select-filter select:focus, .sort-filter select:focus { color: #e2743e; }
.sort-filter { flex: 0 0 155px; }
@media (max-width: 850px) { .select-filter, .sort-filter { padding: 8px 12px; } }
@media (max-width: 580px) { .select-filter, .sort-filter { border-bottom: 1px solid #e8ece7; border-left: 0; min-height: 0; padding: 12px 10px; }.sort-filter { border-bottom: 0; flex-basis: auto; } }
</style>
