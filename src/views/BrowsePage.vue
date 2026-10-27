<template>
  <ion-page>
    <ion-content :fullscreen="true" class="browse-content">
      <header class="browse-header">
        <a class="brand" href="/home" aria-label="Casa home">
          <img :src="'/casa-logo.png'" alt="" class="brand-mark" />
          <span>casa<span class="brand-dot">.</span></span>
        </a>
        <div class="search-bar">
          <ion-icon :icon="searchOutline" />
          <input v-model="searchTerm" type="search" placeholder="Search city, school, or area"
            aria-label="Search listings" />
          <span class="search-divider" />
          <ion-icon :icon="calendarOutline" />
          <span class="search-date">Any move-in date</span>
          <button type="button" aria-label="Search"><ion-icon :icon="arrowForwardOutline" /></button>
        </div>
        <nav class="header-actions" aria-label="Account navigation">
          <a href="/listings">Browse all listings</a>
          <a href="/signup?role=landlord">List your space</a>
          <a class="profile-button" href="/login?role=tenant"><ion-icon :icon="personOutline" /> Log in</a>
          <button class="mobile-filter-button" type="button" @click="showFilters = !showFilters"><ion-icon
              :icon="optionsOutline" /></button>
        </nav>
      </header>

      <main class="browse-layout">
        <section class="listings-panel" :class="{ 'filters-open': showFilters }">
          <div class="results-top">
            <div>
              <span class="eyebrow">EXPLORE THE MAP</span>
              <h1>Spaces near <em>you.</em></h1>
              <p>{{ filteredListings.length }} available spaces in this area</p>
            </div>
            <label class="sort-control">Sort by
              <select v-model="sortBy" aria-label="Sort listings">
                <option value="recommended" style="border: red">Recommended</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </label>
          </div>

          <div class="filter-row">
            <button v-for="filter in filters" :key="filter.label" class="filter-chip"
              :class="{ selected: activeFilter === filter.value }" type="button" @click="activeFilter = filter.value">
              <ion-icon :icon="filter.icon" /> {{ filter.label }}
            </button>
          </div>

          <div class="listing-list">
            <article v-for="listing in filteredListings" :key="listing.id" class="listing-card"
              :class="{ active: selectedListing?.id === listing.id }" @click="selectedListing = listing">
              <div class="listing-image" :style="{ backgroundImage: `url(${listing.image})` }">
                <span v-if="listing.badge" class="listing-badge">{{ listing.badge }}</span>
                <button class="favorite-button" :class="{ liked: favorites.has(listing.id) }" type="button"
                  :aria-label="`Save ${listing.name}`" @click.stop="toggleFavorite(listing.id)">
                  <ion-icon :icon="favorites.has(listing.id) ? heart : heartOutline" />
                </button>
              </div>
              <div class="listing-info">
                <div class="listing-title-row">
                  <h2>{{ listing.name }}</h2><span class="rating"><ion-icon :icon="star" /> {{ listing.rating }}</span>
                </div>
                <p class="listing-location"><ion-icon :icon="locationOutline" /> {{ listing.location }}</p>
                <p class="listing-description">{{ listing.description }}</p>
                <div class="listing-meta"><span>{{ listing.type }}</span><span>·</span><span>{{ listing.amenities }}
                    amenities</span><strong>₱{{ listing.price.toLocaleString() }}<small> / month</small></strong></div>
              </div>
            </article>
            <div v-if="filteredListings.length === 0" class="empty-state">
              <ion-icon :icon="searchOutline" />
              <h2>No spaces found yet.</h2>
              <p>Try searching a different area or clearing your filters.</p><button type="button"
                @click="clearFilters">Clear filters</button>
            </div>
          </div>
        </section>

        <aside class="map-panel" aria-label="Map of Casa listings">
          <div class="map-placeholder">
            <div class="map-api-placeholder" aria-label="Google 3D Maps placeholder">
              <ion-icon :icon="mapOutline" />
              <span>Google 3D Map placeholder</span>
            </div>
            <div class="map-grid" />
            <div class="map-road road-one" />
            <div class="map-road road-two" />
            <div class="map-road road-three" />
            <div v-for="(pin, index) in mapPins" :key="pin" class="map-pin"
              :class="{ active: selectedListing?.id === pin }" :style="pinPositions[index]"
              @click="selectedListing = listings.find((listing) => listing.id === pin) ?? null">
              <span>₱{{(listings.find((listing) => listing.id === pin)?.price ?? 0) / 1000}}k</span>
            </div>
            <div class="map-label label-katipunan">KATIPUNAN</div>
            <div class="map-label label-tektite">PROJECT 4</div>
            <div class="map-label label-campus">ATENEO CAMPUS</div>
            <div class="map-coming-soon"><span class="map-icon"><ion-icon
                  :icon="mapOutline" /></span><strong>Interactive map coming soon</strong><small>Google 3D Maps will
                appear here</small></div>
            <div class="map-controls"><button type="button" aria-label="Zoom in">+</button><button type="button"
                aria-label="Zoom out">−</button><button type="button" aria-label="Current location"><ion-icon
                  :icon="locateOutline" /></button></div>
          </div>
          <div class="map-footer"><span><ion-icon :icon="shieldCheckmarkOutline" /> Verified Casa listings</span><button
              type="button" @click="showMapNotice = true">About this map <ion-icon
                :icon="informationCircleOutline" /></button></div>
          <div v-if="showMapNotice" class="map-notice" role="status">This area is reserved for the Google 3D Maps
            integration.</div>
        </aside>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  arrowForwardOutline,
  calendarOutline,
  heart,
  heartOutline,
  homeOutline,
  informationCircleOutline,
  locateOutline,
  locationOutline,
  mapOutline,
  optionsOutline,
  personOutline,
  searchOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  star,
  walletOutline,
} from 'ionicons/icons';

type Listing = {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: string;
  type: string;
  amenities: number;
  badge: string;
  description: string;
  image: string;
};

const listings: Listing[] = [
  { id: 1, name: 'The Greenhouse', location: 'Katipunan, Quezon City', price: 8500, rating: '4.9', type: 'Private room', amenities: 8, badge: 'Casa favorite', description: 'A sun-filled room near campus with a warm, creative community.', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=85' },
  { id: 2, name: 'Sage House', location: 'Poblacion, Makati', price: 7200, rating: '4.8', type: 'Bedspace', amenities: 6, badge: 'New on Casa', description: 'Thoughtfully designed shared living in the heart of the city.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=85' },
  { id: 3, name: 'Casa Amara', location: 'Cebu IT Park, Cebu', price: 9800, rating: '5.0', type: 'Private room', amenities: 10, badge: '', description: 'Your calm corner with everything you need close by.', image: 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=800&q=85' },
  { id: 4, name: 'The Olive Room', location: 'Lahug, Cebu City', price: 6500, rating: '4.7', type: 'Bedspace', amenities: 7, badge: 'Great value', description: 'Easy, breezy living with a view and room to make it yours.', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=85' },
];

const filters = [
  { label: 'All spaces', value: 'all', icon: sparklesOutline },
  { label: 'Private room', value: 'Private room', icon: homeOutline },
  { label: 'Bedspace', value: 'Bedspace', icon: personOutline },
  { label: 'Under ₱8k', value: 'under-8k', icon: walletOutline },
];
const mapPins = [1, 2, 3, 4];
const pinPositions = [{ left: '29%', top: '40%' }, { left: '56%', top: '56%' }, { left: '73%', top: '29%' }, { left: '42%', top: '72%' }];
const searchTerm = ref('');
const activeFilter = ref('all');
const sortBy = ref('recommended');
const selectedListing = ref<Listing | null>(listings[0]);
const favorites = ref(new Set<number>());
const showFilters = ref(false);
const showMapNotice = ref(false);

const filteredListings = computed(() => {
  const term = searchTerm.value.toLowerCase();
  const matches = listings.filter((listing) => {
    const matchesTerm = !term || `${listing.name} ${listing.location} ${listing.type}`.toLowerCase().includes(term);
    const matchesFilter = activeFilter.value === 'all' || (activeFilter.value === 'under-8k' ? listing.price < 8000 : listing.type === activeFilter.value);
    return matchesTerm && matchesFilter;
  });
  return [...matches].sort((a, b) => sortBy.value === 'price-low' ? a.price - b.price : sortBy.value === 'price-high' ? b.price - a.price : sortBy.value === 'rating' ? Number(b.rating) - Number(a.rating) : a.id - b.id);
});

function toggleFavorite(id: number) {
  const next = new Set(favorites.value);
  next.has(id) ? next.delete(id) : next.add(id);
  favorites.value = next;
}

function clearFilters() {
  searchTerm.value = '';
  activeFilter.value = 'all';
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');

:global(body) {
  background: #fbfaf7;
  color: #174b35;
  font-family: 'DM Sans', sans-serif;
}

:global(*) {
  box-sizing: border-box;
}

.browse-content {
  --background: #fbfaf7;
}

.browse-header {
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e7ebe5;
  display: flex;
  gap: 25px;
  height: 76px;
  padding: 0 34px;
  position: relative;
  z-index: 3;
}

.brand {
  align-items: center;
  color: #174b35;
  display: flex;
  font-size: 25px;
  font-weight: 700;
  gap: 8px;
  letter-spacing: -1.5px;
  text-decoration: none;
}

.brand-mark {
  height: 34px;
  width: 34px;
}

.brand-dot {
  color: #e2743e;
}

.search-bar {
  align-items: center;
  border: 1px solid #e0e7df;
  border-radius: 28px;
  display: flex;
  gap: 10px;
  height: 44px;
  margin-left: 25px;
  max-width: 520px;
  padding-left: 16px;
  width: 100%;
}

.search-bar>ion-icon {
  color: #e2743e;
  font-size: 18px;
}

.search-bar input {
  appearance: none;
  background: #fff;
  border: 0;
  color: #174b35;
  color-scheme: light;
  flex: 1;
  font: inherit;
  font-size: 11px;
  min-width: 80px;
  outline: 0;
}

.search-bar input::placeholder {
  color: #a0aaa3;
}

.search-divider {
  background: #e1e7e1;
  height: 20px;
  width: 1px;
}

.search-date {
  color: #7d8c82;
  font-size: 10px;
  white-space: nowrap;
}

.search-bar button {
  align-items: center;
  background: #e2743e;
  border-radius: 50%;
  color: white;
  display: flex;
  font-size: 16px;
  height: 32px;
  justify-content: center;
  margin-right: 5px;
  width: 32px;
}

.header-actions {
  align-items: center;
  display: flex;
  gap: 23px;
  margin-left: auto;
  white-space: nowrap;
}

.header-actions a {
  color: #587065;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}

.header-actions a:hover {
  color: #e2743e;
}

.profile-button {
  align-items: center;
  border: 1px solid #dfe6df;
  border-radius: 22px;
  display: flex;
  gap: 6px;
  padding: 10px 14px;
}

.profile-button ion-icon {
  color: #e2743e;
  font-size: 16px;
}

.mobile-filter-button {
  display: none;
}

.browse-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(380px, .8fr);
  height: calc(100vh - 76px);
  min-height: 650px;
}

.listings-panel {
  background: #fbfaf7;
  grid-column: 2;
  overflow-y: auto;
  padding: 40px clamp(25px, 4vw, 60px);
}

.results-top {
  align-items: end;
  display: flex;
  justify-content: space-between;
}

.eyebrow {
  color: #e2743e;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.8px;
}

.results-top h1 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: clamp(34px, 4vw, 48px);
  letter-spacing: -2px;
  line-height: 1;
  margin: 14px 0 7px;
}

.results-top h1 em {
  color: #e2743e;
  font-weight: 600;
}

.results-top p {
  color: #829088;
  font-size: 11px;
  margin: 0;
}

.sort-control {
  color: #89968e;
  font-size: 10px;
}

.sort-control select {
  background: transparent;
  border: 0;
  color: #174b35;
  font: inherit;
  font-weight: 700;
  margin-left: 3px;
  outline: 0;
}

.filter-row {
  display: flex;
  gap: 8px;
  margin: 28px 0 24px;
  overflow-x: auto;
  padding-bottom: 3px;
}

.filter-chip {
  align-items: center;
  background: white;
  border: 1px solid #e5eae4;
  border-radius: 20px;
  color: #75857a;
  display: flex;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 600;
  gap: 6px;
  padding: 10px 13px;
}

.filter-chip ion-icon {
  color: #e2743e;
  font-size: 15px;
}

.filter-chip.selected,
.filter-chip:hover {
  background: #174b35;
  border-color: #174b35;
  color: white;
}

.listing-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.listing-card {
  background: #fff;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 125px 1fr;
  overflow: hidden;
  transition: border .2s, box-shadow .2s, transform .2s;
}

.listing-card:hover,
.listing-card.active {
  border-color: #b6cfb7;
  box-shadow: 0 8px 20px rgba(23, 75, 53, .1);
  transform: translateY(-2px);
}

.listing-image {
  background-position: center;
  background-size: cover;
  min-height: 155px;
  position: relative;
}

.listing-badge {
  background: #fbfaf7;
  border-radius: 4px;
  color: #174b35;
  font-size: 9px;
  font-weight: 700;
  left: 9px;
  padding: 6px 8px;
  position: absolute;
  top: 9px;
}

.favorite-button {
  align-items: center;
  background: rgba(255, 255, 255, .9);
  border-radius: 50%;
  color: #174b35;
  display: flex;
  font-size: 17px;
  height: 29px;
  justify-content: center;
  position: absolute;
  right: 9px;
  top: 9px;
  width: 29px;
}

.favorite-button.liked {
  color: #e2743e;
}

.listing-info {
  padding: 17px 17px 13px;
}

.listing-title-row {
  align-items: start;
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.listing-title-row h2 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  line-height: 1.1;
  margin: 0;
}

.rating {
  align-items: center;
  color: #174b35;
  display: flex;
  font-size: 10px;
  font-weight: 700;
  gap: 3px;
}

.rating ion-icon {
  color: #e2743e;
  font-size: 14px;
}

.listing-location {
  align-items: center;
  color: #7f8d84;
  display: flex;
  font-size: 10px;
  gap: 4px;
  margin: 7px 0 10px;
}

.listing-location ion-icon {
  color: #e2743e;
  font-size: 13px;
}

.listing-description {
  color: #8a958e;
  font-size: 10px;
  line-height: 1.45;
  margin: 0;
}

.listing-meta {
  align-items: center;
  border-top: 1px solid #edf0ec;
  color: #849088;
  display: flex;
  font-size: 9px;
  gap: 6px;
  margin-top: 13px;
  padding-top: 11px;
}

.listing-meta strong {
  color: #e2743e;
  font-size: 15px;
  margin-left: auto;
}

.listing-meta small {
  color: #89948d;
  font-size: 9px;
  font-weight: 400;
}

.empty-state {
  padding: 50px 20px;
  text-align: center;
}

.empty-state ion-icon {
  color: #e2743e;
  font-size: 30px;
}

.empty-state h2 {
  font-family: 'Playfair Display', serif;
  margin: 12px 0 5px;
}

.empty-state p {
  color: #829088;
  font-size: 11px;
}

.empty-state button {
  background: #174b35;
  border-radius: 20px;
  color: white;
  font-size: 11px;
  padding: 10px 16px;
}

.map-panel {
  background: #e7eee5;
  display: flex;
  flex-direction: column;
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
  position: relative;
}

.map-placeholder {
  background: #deeadc;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.map-api-placeholder {
  align-items: center;
  background: rgba(23, 75, 53, .82);
  border-radius: 6px;
  color: white;
  display: flex;
  font-size: 10px;
  gap: 7px;
  left: 20px;
  padding: 8px 11px;
  position: absolute;
  top: 20px;
  z-index: 3;
}

.map-api-placeholder ion-icon {
  color: #f6b264;
  font-size: 15px;
}

.map-grid {
  background-image: linear-gradient(rgba(116, 153, 119, .13) 1px, transparent 1px), linear-gradient(90deg, rgba(116, 153, 119, .13) 1px, transparent 1px);
  background-size: 70px 70px;
  inset: 0;
  opacity: .7;
  position: absolute;
  transform: rotate(-8deg) scale(1.2);
}

.map-road {
  background: rgba(255, 255, 255, .75);
  height: 28px;
  position: absolute;
  transform: rotate(-32deg);
  width: 120%;
}

.road-one {
  left: -5%;
  top: 31%;
}

.road-two {
  left: -15%;
  top: 63%;
  transform: rotate(16deg);
}

.road-three {
  left: 21%;
  top: 8%;
  transform: rotate(67deg);
}

.map-pin {
  align-items: center;
  background: #e2743e;
  border: 3px solid white;
  border-radius: 50% 50% 50% 0;
  box-shadow: 0 3px 8px rgba(23, 75, 53, .25);
  color: white;
  cursor: pointer;
  display: flex;
  height: 37px;
  justify-content: center;
  position: absolute;
  transform: rotate(-45deg);
  transition: transform .2s, background .2s;
  width: 37px;
  z-index: 1;
}

.map-pin span {
  font-size: 9px;
  font-weight: 700;
  transform: rotate(45deg);
}

.map-pin:hover,
.map-pin.active {
  background: #174b35;
  transform: rotate(-45deg) scale(1.18);
  z-index: 2;
}

.map-label {
  color: #83a083;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
  position: absolute;
}

.label-katipunan {
  left: 25%;
  top: 28%;
}

.label-tektite {
  right: 15%;
  top: 47%;
}

.label-campus {
  left: 37%;
  bottom: 19%;
}

.map-coming-soon {
  align-items: center;
  background: rgba(255, 255, 255, .88);
  border: 1px solid rgba(255, 255, 255, .7);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(23, 75, 53, .08);
  display: flex;
  flex-direction: column;
  left: 50%;
  padding: 18px 25px;
  position: absolute;
  text-align: center;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 220px;
}

.map-icon {
  align-items: center;
  background: #e6f1e3;
  border-radius: 50%;
  color: #3f8058;
  display: flex;
  font-size: 24px;
  height: 46px;
  justify-content: center;
  margin-bottom: 9px;
  width: 46px;
}

.map-coming-soon strong {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: 15px;
}

.map-coming-soon small {
  color: #839087;
  font-size: 9px;
  margin-top: 5px;
}

.map-controls {
  background: white;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(23, 75, 53, .12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  right: 22px;
  top: 22px;
}

.map-controls button {
  background: white;
  border-bottom: 1px solid #e8eee7;
  color: #174b35;
  font-size: 20px;
  height: 36px;
  width: 36px;
}

.map-controls button:last-child {
  border: 0;
  font-size: 15px;
}

.map-controls button:hover {
  background: #f2f7f0;
}

.map-footer {
  align-items: center;
  background: white;
  color: #708278;
  display: flex;
  font-size: 10px;
  justify-content: space-between;
  padding: 12px 20px;
}

.map-footer span,
.map-footer button {
  align-items: center;
  display: flex;
  gap: 5px;
}

.map-footer ion-icon {
  color: #4e9660;
  font-size: 14px;
}

.map-footer button {
  background: transparent;
  color: #e2743e;
  font: inherit;
}

.map-notice {
  background: #174b35;
  bottom: 48px;
  color: white;
  font-size: 10px;
  left: 50%;
  padding: 10px 15px;
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
}

@media (max-width: 1000px) {
  .browse-header {
    padding: 0 20px;
  }

  .search-bar {
    margin-left: 8px;
  }

  .header-actions {
    gap: 10px;
  }

  .browse-layout {
    grid-template-columns: minmax(0, 1.15fr) minmax(340px, .85fr);
  }

  .listing-card {
    grid-template-columns: 110px 1fr;
  }

  .listing-description {
    display: none;
  }
}

@media (max-width: 720px) {
  .browse-header {
    flex-wrap: wrap;
    height: auto;
    padding: 16px 18px;
  }

  .search-bar {
    flex: 1 0 100%;
    margin: 14px 0 0;
    max-width: none;
    order: 3;
  }

  .header-actions {
    margin-left: auto;
  }

  .header-actions>a:first-child {
    display: none;
  }

  .mobile-filter-button {
    background: #eaf1e8;
    border-radius: 50%;
    color: #174b35;
    display: flex;
    font-size: 18px;
    padding: 9px;
  }

  .browse-layout {
    display: flex;
    flex-direction: column;
    height: auto;
  }

  .map-panel {
    height: 540px;
    order: -1;
  }

  .listings-panel {
    padding: 30px 18px;
  }

  .results-top {
    align-items: start;
    flex-direction: column;
    gap: 17px;
  }

  .sort-control {
    align-self: end;
  }

  .listing-card {
    grid-template-columns: 125px 1fr;
  }

  .listing-image {
    min-height: 170px;
  }

  .listing-meta span:nth-child(2),
  .listing-meta span:nth-child(3) {
    display: none;
  }

  .map-notice {
    bottom: 52px;
    font-size: 9px;
  }
}

@media (max-width: 400px) {

  .search-date,
  .search-divider,
  .search-bar>ion-icon:nth-of-type(2) {
    display: none;
  }

  .listing-card {
    grid-template-columns: 105px 1fr;
  }

  .listing-info {
    padding: 13px 11px;
  }

  .listing-title-row h2 {
    font-size: 16px;
  }

  .listing-meta strong {
    font-size: 13px;
  }
}
</style>
