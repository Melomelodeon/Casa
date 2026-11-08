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
          <button type="button" aria-label="Search"><ion-icon :icon="arrowForwardOutline" /></button>
        </div>
        <nav class="header-actions" aria-label="Account navigation">
          <a href="/listings">Browse all listings</a>
          <a href="/signup?role=landlord">List your space</a>
          <template v-if="user">
            <a class="profile-button" :href="accountPath"><ion-icon :icon="personOutline" /> {{ displayName }}</a>
            <button class="logout-button" type="button" @click="logout">Log out</button>
          </template>
          <a v-else class="profile-button" href="/login?role=tenant"><ion-icon :icon="personOutline" /> Log in</a>
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
                <option value="recommended">Recommended</option>
                <option value="price-low">Lowest price</option>
                <option value="price-high">Highest price</option>
              </select>
            </label>
          </div>

          <div class="filter-strip">
            <button class="filter-arrow" type="button" aria-label="Scroll filters left" @click="scrollFilters(-1)">
              <ion-icon :icon="chevronBackOutline" />
            </button>
            <div ref="filterScroller" class="filter-row">
              <button v-for="filter in filters" :key="filter.value" class="filter-chip"
                :class="{ selected: activeFilter === filter.value }" type="button" @click="activeFilter = filter.value">
                <ion-icon :icon="filter.icon" /> {{ filter.label }}
              </button>
            </div>
            <button class="filter-arrow" type="button" aria-label="Scroll filters right" @click="scrollFilters(1)">
              <ion-icon :icon="chevronForwardOutline" />
            </button>
          </div>

          <div class="listing-list">
            <article v-for="listing in filteredListings" :key="listing.id" class="listing-card"
              :class="{ active: selectedListing?.id === listing.id }" @click="selectedListing = listing">
              <div class="listing-image" :style="{ backgroundImage: `url(${listing.image})` }">
                <span class="listing-badge" :class="getListingTag(listing).variant">{{ getListingTag(listing).label }}</span>
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
          <div class="map-container">
            <div ref="mapElement" class="leaflet-map" role="application"
              aria-label="Map of listings. Click or drag a pin to filter listings within five kilometers." />
            <div class="map-radius-control">
              <span>{{ nearbyPin ? 'Showing listings within 5 km' : 'Click the map to find nearby listings' }}</span>
              <button v-if="nearbyPin" type="button" @click="clearNearbyPin">Clear area</button>
            </div>
          </div>
          <div class="map-footer"><span><ion-icon :icon="shieldCheckmarkOutline" /> Verified Casa listings</span><button
              type="button" @click="showMapNotice = !showMapNotice">Map attribution <ion-icon
                :icon="informationCircleOutline" /></button></div>
          <div v-if="showMapNotice" class="map-notice" role="status">Map data © OpenStreetMap contributors. Click the map or drag the orange pin to filter within 5 km.</div>
        </aside>
      </main>
      <div v-if="selectedListing" class="listing-backdrop" @click.self="selectedListing = null">
        <section ref="selectedListingElement" class="selected-listing" role="dialog" aria-modal="true" aria-labelledby="selected-listing-title" @scroll="dismissScrollIndicator">
          <button class="selected-close" type="button" aria-label="Close listing details" @click="selectedListing = null">×</button>
          <div v-if="hasScrollableContent" class="scroll-indicator" :class="{ 'is-hidden': scrollIndicatorDismissed }" aria-hidden="true">
            <span class="scroll-chevron" />
          </div>
          <div class="selected-listing-image" :style="{ backgroundImage: `url(${selectedListing.image})` }">
            <span class="selected-label" :class="selectedListingTag.variant">{{ selectedListingTag.label }}</span>
          </div>
          <div class="selected-listing-body">
            <div class="selected-listing-heading">
              <div>
                <span class="eyebrow">{{ selectedListing.type }}</span>
                <h2 id="selected-listing-title">{{ selectedListing.name }}</h2>
                <p><ion-icon :icon="locationOutline" /> {{ selectedListing.location }}</p>
              </div>
              <span class="selected-rating"><ion-icon :icon="star" /> {{ selectedListing.rating }}</span>
            </div>
            <p class="selected-description">{{ selectedListing.description }}</p>
            <BookingPanel :listing="selectedListing" :floors="selectedFloors" @book="startBooking" />
            <div class="selected-listing-footer">
              <strong>₱{{ selectedListing.price.toLocaleString() }}<small> / month</small></strong>
              <a href="/listings">Back to listings <ion-icon :icon="arrowForwardOutline" /></a>
            </div>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import L, { type Circle, type Map as LeafletMap, type Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import BookingPanel from '../components/BookingPanel.vue';
import { useAuthUser } from '../composables/useAuthUser';
import { useLogout } from '../composables/useLogout';
import { getBookingFloors, listings, type BookingSelection, type Listing } from '../data/listings';
import {
  arrowForwardOutline,
  chevronBackOutline,
  chevronForwardOutline,
  heart,
  heartOutline,
  homeOutline,
  informationCircleOutline,
  locationOutline,
  optionsOutline,
  personOutline,
  searchOutline,
  shieldCheckmarkOutline,
  sparklesOutline,
  star,
  walletOutline,
} from 'ionicons/icons';

const filters = [
  { label: 'All spaces', value: 'all', icon: sparklesOutline },
  { label: 'Private room', value: 'Private room', icon: homeOutline },
  { label: 'Bedspaces', value: 'Bedspace', icon: personOutline },
  { label: 'Highly rated', value: 'highly-rated', icon: star },
  { label: 'Budget friendly', value: 'budget-friendly', icon: walletOutline },
  { label: 'Newly added', value: 'newly-added', icon: sparklesOutline },
];
const NEARBY_RADIUS_METERS = 5000;
const searchTerm = ref('');
const activeFilter = ref('all');
const sortBy = ref('recommended');
const mapElement = ref<HTMLDivElement | null>(null);
const nearbyPin = ref<L.LatLng | null>(null);
const filterScroller = ref<HTMLElement | null>(null);
const selectedListing = ref<Listing | null>(null);
const selectedListingElement = ref<HTMLElement | null>(null);
const hasScrollableContent = ref(false);
const scrollIndicatorDismissed = ref(false);
let selectedListingResizeObserver: ResizeObserver | null = null;
const favorites = ref(new Set<number>());
const showFilters = ref(false);
const showMapNotice = ref(false);
let leafletMap: LeafletMap | null = null;
let listingMarkerLayer: L.MarkerClusterGroup | null = null;
let nearbyPinMarker: Marker | null = null;
let nearbyRadiusCircle: Circle | null = null;
let mapResizeObserver: ResizeObserver | null = null;
const router = useRouter();
const { user } = useAuthUser();
const { logout } = useLogout();
const displayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'Account');
const accountPath = computed(() => user.value?.user_metadata?.role === 'landlord' ? '/host' : '/browse');
const selectedFloors = computed(() => selectedListing.value ? getBookingFloors(selectedListing.value) : []);
function getListingTag(listing: Listing) {
  if (isNewlyAdded(listing)) return { label: 'New', variant: 'new-tag' };
  const rating = Number(listing.rating);
  if (Number.isFinite(rating) && rating >= 4.8) {
    return { label: 'Highly rated', variant: 'high-rating-tag' };
  }
  if (listing.price <= 8000) {
    return { label: 'Budget friendly', variant: 'budget-tag' };
  }
  return { label: `${listing.rating} rating`, variant: 'rating-tag' };
}
const selectedListingTag = computed(() => selectedListing.value
  ? getListingTag(selectedListing.value)
  : { label: '', variant: '' });
function isNewlyAdded(listing: Listing) {
  if (!listing.dateAdded) return false;
  const addedAt = new Date(listing.dateAdded).getTime();
  const ageInDays = (Date.now() - addedAt) / (1000 * 60 * 60 * 24);
  return Number.isFinite(addedAt) && ageInDays >= 0 && ageInDays <= 30;
}
function scrollFilters(direction: -1 | 1) {
  filterScroller.value?.scrollBy({ left: direction * 180, behavior: 'smooth' });
}
function initializeMap() {
  if (!mapElement.value || leafletMap) return;
  leafletMap = L.map(mapElement.value, { zoomControl: true }).setView([12.5, 121.5], 6);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(leafletMap);
  listingMarkerLayer = L.markerClusterGroup({
    maxClusterRadius: 55,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyDistanceMultiplier: 1.4,
    iconCreateFunction: (cluster) => L.divIcon({
      className: 'listing-cluster-marker',
      html: `<span><strong>${cluster.getChildCount()}</strong><small>spaces</small></span>`,
      iconSize: [58, 58],
      iconAnchor: [29, 29],
    }),
  }).addTo(leafletMap);
  const listingBounds = L.latLngBounds(listings.map((listing) =>
    L.latLng(listing.coordinates.latitude, listing.coordinates.longitude),
  ));
  leafletMap.fitBounds(listingBounds, { padding: [30, 30], maxZoom: 7 });
  leafletMap.on('click', (event: L.LeafletMouseEvent) => setNearbyPin(event.latlng));
  refreshListingMarkers();
  mapResizeObserver = new ResizeObserver(() => leafletMap?.invalidateSize({ pan: false }));
  mapResizeObserver.observe(mapElement.value);
  void nextTick(() => leafletMap?.invalidateSize({ pan: false }));
}
function refreshListingMarkers() {
  if (!listingMarkerLayer) return;
  const markerLayer = listingMarkerLayer;
  markerLayer.clearLayers();
  filteredListings.value.forEach((listing) => {
    const priceLabel = `${(listing.price / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
    const icon = L.divIcon({
      className: 'listing-price-marker',
      html: `<span>₱${priceLabel}</span>`,
      iconSize: [54, 34],
      iconAnchor: [27, 17],
    });
    L.marker([listing.coordinates.latitude, listing.coordinates.longitude], { icon })
      .bindTooltip(`${listing.name} · ₱${listing.price.toLocaleString()} / month`)
      .on('click', () => { selectedListing.value = listing; })
      .addTo(markerLayer);
  });
}
function setNearbyPin(position: L.LatLng) {
  if (!leafletMap) return;
  nearbyPin.value = position;
  const pinIcon = L.divIcon({
    className: 'nearby-pin-icon',
    html: '<svg viewBox="0 0 32 40" aria-hidden="true"><path d="M16 1.5C8.1 1.5 2 7.6 2 15.5c0 10.1 14 22.8 14 22.8s14-12.7 14-22.8C30 7.6 23.9 1.5 16 1.5Z" fill="#e2743e" stroke="#fff" stroke-width="2.5"/><circle cx="16" cy="15.5" r="5.2" fill="#fff"/><circle cx="16" cy="15.5" r="2.3" fill="#174b35"/></svg>',
    iconSize: [32, 40],
    iconAnchor: [16, 39],
  });
  if (nearbyPinMarker) {
    nearbyPinMarker.setLatLng(position);
  } else {
    nearbyPinMarker = L.marker(position, { icon: pinIcon, draggable: true, zIndexOffset: 1000 }).addTo(leafletMap);
    nearbyPinMarker.bindTooltip('Search center');
    nearbyPinMarker.on('dragend', () => {
      if (!nearbyPinMarker) return;
      const draggedPosition = nearbyPinMarker.getLatLng();
      nearbyPin.value = draggedPosition;
      nearbyRadiusCircle?.setLatLng(draggedPosition);
    });
  }
  if (nearbyRadiusCircle) {
    nearbyRadiusCircle.setLatLng(position);
  } else {
    nearbyRadiusCircle = L.circle(position, {
      radius: NEARBY_RADIUS_METERS,
      color: '#e2743e',
      fillColor: '#e2743e',
      fillOpacity: 0.1,
      weight: 2,
    }).addTo(leafletMap);
  }
  leafletMap.panTo(position);
}
function clearNearbyPin() {
  nearbyPin.value = null;
  if (nearbyPinMarker && leafletMap) leafletMap.removeLayer(nearbyPinMarker);
  if (nearbyRadiusCircle && leafletMap) leafletMap.removeLayer(nearbyRadiusCircle);
  nearbyPinMarker = null;
  nearbyRadiusCircle = null;
}
function distanceInMeters(first: L.LatLng, second: L.LatLng) {
  const toRadians = (degrees: number) => degrees * Math.PI / 180;
  const latitudeDelta = toRadians(second.lat - first.lat);
  const longitudeDelta = toRadians(second.lng - first.lng);
  const latitudeOne = toRadians(first.lat);
  const latitudeTwo = toRadians(second.lat);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitudeOne) * Math.cos(latitudeTwo) * Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}
onMounted(() => {
  void nextTick(initializeMap);
});
function updateScrollIndicator() {
  const element = selectedListingElement.value;
  hasScrollableContent.value = Boolean(element && element.scrollHeight > element.clientHeight + 1);
}
function dismissScrollIndicator() {
  if (selectedListingElement.value && selectedListingElement.value.scrollTop > 1) {
    scrollIndicatorDismissed.value = true;
  }
}
watch(selectedListing, (listing) => {
  selectedListingResizeObserver?.disconnect();
  selectedListingResizeObserver = null;
  hasScrollableContent.value = false;
  scrollIndicatorDismissed.value = false;
  if (!listing) return;
  void nextTick(() => {
    updateScrollIndicator();
    if (selectedListingElement.value) {
      selectedListingResizeObserver = new ResizeObserver(updateScrollIndicator);
      selectedListingResizeObserver.observe(selectedListingElement.value);
    }
  });
});
onBeforeUnmount(() => {
  selectedListingResizeObserver?.disconnect();
  mapResizeObserver?.disconnect();
  leafletMap?.remove();
  leafletMap = null;
});
function startBooking(selection: BookingSelection) {
  if (!selectedListing.value) return;
  void router.push({
    name: 'Checkout',
    query: {
      listingId: String(selectedListing.value.id),
      listing: selectedListing.value.name,
      location: selectedListing.value.location,
      price: String(selectedListing.value.price),
      type: selectedListing.value.type,
      space: selection.value.name,
      image: selection.value.image || selectedListing.value.image,
    },
  });
}

const filteredListings = computed(() => {
  const term = searchTerm.value.toLowerCase();
  const matches = listings.filter((listing) => {
    const matchesTerm = !term || `${listing.name} ${listing.location} ${listing.type}`.toLowerCase().includes(term);
    const listingPosition = L.latLng(listing.coordinates.latitude, listing.coordinates.longitude);
    const matchesNearby = !nearbyPin.value || distanceInMeters(nearbyPin.value, listingPosition) <= NEARBY_RADIUS_METERS;
    const matchesFilter = activeFilter.value === 'all'
      || (activeFilter.value === 'highly-rated' && Number(listing.rating) >= 4.8)
      || (activeFilter.value === 'budget-friendly' && listing.price <= 8000)
      || (activeFilter.value === 'newly-added' && isNewlyAdded(listing))
      || listing.type === activeFilter.value;
    return matchesTerm && matchesFilter && matchesNearby;
  });
  return [...matches].sort((a, b) => sortBy.value === 'price-low' ? a.price - b.price : sortBy.value === 'price-high' ? b.price - a.price : a.id - b.id);
});
watch(filteredListings, refreshListingMarkers);

function toggleFavorite(id: number) {
  const next = new Set(favorites.value);
  next.has(id) ? next.delete(id) : next.add(id);
  favorites.value = next;
}

function clearFilters() {
  searchTerm.value = '';
  activeFilter.value = 'all';
  sortBy.value = 'recommended';
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
.logout-button { background: transparent; border: 0; color: #849087; cursor: pointer; font: inherit; font-size: 10px; padding: 0; }
.logout-button:hover { color: #e2743e; }

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
  grid-template-rows: minmax(0, 1fr);
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
  background: #fff;
  border: 1px solid #e5eae4;
  border-radius: 9px;
  color: #174b35;
  font: inherit;
  font-weight: 700;
  margin-left: 7px;
  outline: 0;
  padding: 9px 30px 9px 12px;
}

.sort-control select:focus-visible {
  border-color: #e2743e;
  box-shadow: 0 0 0 3px rgba(226, 116, 62, .12);
}

.filter-strip {
  align-items: center;
  display: flex;
  gap: 7px;
  margin: 28px 0 24px;
  min-width: 0;
}

.filter-row {
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  touch-action: pan-x;
  -ms-overflow-style: none;
}

.filter-row::-webkit-scrollbar {
  display: none;
}

.filter-arrow {
  align-items: center;
  background: #fff;
  border: 1px solid #e5eae4;
  border-radius: 50%;
  color: #174b35;
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 30px;
  height: 30px;
  justify-content: center;
  padding: 0;
  width: 30px;
}

.filter-arrow:hover,
.filter-arrow:focus-visible {
  background: #174b35;
  border-color: #174b35;
  color: #fff;
  outline: 0;
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

.listing-backdrop {
  align-items: center;
  background: rgba(15, 38, 27, .64);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 20;
}

.selected-listing {
  background: #fff;
  border: 1px solid #dce8dc;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(23, 75, 53, .09);
  max-height: calc(100vh - 40px);
  max-width: 700px;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  scrollbar-width: none;
  width: 100%;
}

.selected-listing::-webkit-scrollbar {
  display: none;
}

.scroll-indicator {
  align-items: center;
  animation: scroll-hint 1.4s ease-in-out infinite;
  background: #fff;
  border: 1px solid #dce8dc;
  border-bottom: 0;
  border-radius: 96px 96px 0 0;
  bottom: 0;
  display: flex;
  height: 43px;
  left: 50%;
  pointer-events: none;
  position: absolute;
  transition: opacity .25s ease, transform .25s ease, visibility .25s ease;
  transform: translateX(-50%);
  width: 104px;
  z-index: 2;
}

.scroll-indicator.is-hidden {
  animation: none;
  opacity: 0;
  transform: translate(-50%, 100%);
  visibility: hidden;
}

.scroll-chevron {
  border-bottom: 4px solid #e2743e;
  border-right: 4px solid #e2743e;
  height: 15px;
  position: relative;
  transform: rotate(45deg) translate(-3px, -3px);
  width: 15px;
}

.selected-close {
  align-items: center;
  background: rgba(255, 255, 255, .92);
  border-radius: 50%;
  color: #174b35;
  display: flex;
  font-size: 21px;
  height: 32px;
  justify-content: center;
  position: absolute;
  right: 14px;
  top: 14px;
  width: 32px;
  z-index: 1;
}

.selected-listing-image {
  background-position: center;
  background-size: cover;
  height: 170px;
  position: relative;
}

.selected-label {
  background: #fbfaf7;
  border-radius: 4px;
  color: #174b35;
  display: inline-flex;
  font-size: 9px;
  font-weight: 700;
  left: 13px;
  letter-spacing: 1px;
  padding: 7px 9px;
  position: absolute;
  top: 13px;
}

.selected-listing-image button {
  align-items: center;
  background: rgba(255, 255, 255, .92);
  border-radius: 50%;
  color: #174b35;
  display: flex;
  font-size: 20px;
  height: 30px;
  justify-content: center;
  position: absolute;
  right: 13px;
  top: 13px;
  width: 30px;
}

.selected-listing-body {
  padding: 17px 17px 38px;
}

.selected-listing-heading {
  align-items: start;
  display: flex;
  justify-content: space-between;
}

.selected-listing-heading h2 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  margin: 6px 0 4px;
}

.selected-listing-heading p,
.selected-description {
  color: #829088;
  font-size: 10px;
  margin: 0;
}

.selected-listing-heading p ion-icon {
  color: #e2743e;
  vertical-align: middle;
}

.selected-rating {
  color: #174b35;
  font-size: 11px;
  font-weight: 700;
}

.selected-rating ion-icon {
  color: #e2743e;
  vertical-align: middle;
}

.selected-description {
  line-height: 1.5;
  margin-top: 13px;
}

.selected-listing-footer {
  align-items: center;
  border-top: 1px solid #edf1ec;
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 13px;
}

.selected-listing-footer strong {
  color: #174b35;
  font-size: 16px;
}

.selected-listing-footer small {
  color: #89968d;
  font-size: 9px;
  font-weight: 400;
}

.selected-listing-footer a {
  align-items: center;
  color: #e2743e;
  display: flex;
  font-size: 10px;
  font-weight: 700;
  gap: 5px;
  text-decoration: none;
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

.listing-badge.new-tag,
.selected-label.new-tag {
  background: #fbfaf7;
  color: #174b35;
}

.listing-badge.high-rating-tag,
.selected-label.high-rating-tag,
.listing-badge.budget-tag,
.selected-label.budget-tag,
.listing-badge.rating-tag,
.selected-label.rating-tag {
  background: #fbfaf7;
  color: #174b35;
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
  height: 100%;
  min-height: 0;
  min-width: 0;
  position: relative;
}

.map-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

.leaflet-map {
  height: 100%;
  min-height: 300px;
  width: 100%;
  z-index: 0;
}

.map-radius-control {
  align-items: center;
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e5ebe4;
  border-radius: 8px;
  box-shadow: 0 3px 10px rgba(23, 75, 53, .12);
  color: #174b35;
  display: flex;
  font-size: 10px;
  gap: 10px;
  right: 12px;
  padding: 9px 11px;
  position: absolute;
  top: 12px;
  z-index: 500;
}

.map-radius-control button {
  background: #e2743e;
  border: 0;
  border-radius: 16px;
  box-shadow: 0 2px 5px rgba(23, 75, 53, .16);
  color: #fff;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  padding: 8px 12px;
  transition: background .2s ease, box-shadow .2s ease, transform .2s ease;
  white-space: nowrap;
}

.map-radius-control button:hover {
  background: #c95d2c;
  box-shadow: 0 3px 8px rgba(23, 75, 53, .22);
  transform: translateY(-1px);
}

.map-radius-control button:focus-visible {
  outline: 2px solid #174b35;
  outline-offset: 2px;
}

:global(.listing-price-marker) {
  background: transparent;
  border: 0;
}

:global(.listing-price-marker span) {
  align-items: center;
  background: #e2743e;
  border: 2px solid #fff;
  border-radius: 18px;
  box-shadow: 0 2px 6px rgba(23, 75, 53, .3);
  color: #fff;
  display: flex;
  font: 700 10px 'DM Sans', sans-serif;
  height: 30px;
  justify-content: center;
  white-space: nowrap;
  width: 52px;
}

:global(.listing-price-marker:hover span) {
  background: #174b35;
  transform: scale(1.08);
}

:global(.listing-cluster-marker) {
  background: transparent;
  border: 0;
}

:global(.listing-cluster-marker span) {
  align-items: center;
  background: rgba(23, 75, 53, .94);
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 3px 10px rgba(23, 75, 53, .3);
  color: #fff;
  display: flex;
  flex-direction: column;
  height: 58px;
  justify-content: center;
  line-height: 1;
  width: 58px;
}

:global(.listing-cluster-marker strong) {
  font: 700 16px 'DM Sans', sans-serif;
}

:global(.listing-cluster-marker small) {
  font: 600 8px 'DM Sans', sans-serif;
  margin-top: 3px;
}

:global(.marker-cluster-spider-leg) {
  stroke: #174b35;
  stroke-width: 1.5;
}

:global(.nearby-pin-icon) {
  background: transparent;
  border: 0;
  filter: drop-shadow(0 2px 3px rgba(23, 75, 53, .38));
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
  bottom: 50px;
  color: white;
  font-size: 10px;
  left: 12px;
  max-width: min(360px, calc(100% - 24px));
  padding: 10px 15px;
  position: absolute;
  z-index: 500;
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
  .filter-arrow {
    display: none;
  }

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

  .listing-backdrop {
    align-items: end;
    padding: 0;
  }

  .selected-listing {
    border-radius: 14px 14px 0 0;
    max-height: 92vh;
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

@keyframes scroll-hint {
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, 5px); }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-indicator {
    animation: none;
  }
}
</style>
