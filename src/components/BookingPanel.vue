<template>
  <section class="booking-panel">
    <div class="visual-heading">
      <strong>{{ listing.type === 'Private room' ? 'Room visualization' : 'Bedspace visualization' }}</strong>
      <span>{{ listing.type === 'Private room' ? '1 bed inside' : `${spaces.length} sleeping spaces` }}</span>
    </div>
    <div class="room-preview">
      <button v-for="space in spaces" :key="space.name" class="visual-space" :class="{ occupied: space.status === 'occupied', selected: selectedSpace?.name === space.name, 'rejected-click': rejectedSpace === space.name }" type="button" :aria-disabled="space.status === 'occupied' ? 'true' : undefined" :aria-label="`${space.name}, ${space.status === 'occupied' ? 'occupied' : 'available'}`" :aria-pressed="selectedSpace?.name === space.name" @click="selectSpace(space)">
        <img :src="space.image || listing.image || defaultImage" :alt="space.name" @error="useDefaultImage" />
        <strong>{{ space.name }}</strong>
        <small>{{ space.status === 'occupied' ? 'Occupied' : 'Available' }}</small>
      </button>
    </div>
    <div class="availability-legend"><span><i class="available-dot" /> Available</span><span><i class="occupied-dot" /> Occupied</span></div>
    <div v-if="selectedSpace" class="selected-booking">
      <img :src="selectedSpace.image || listing.image || defaultImage" :alt="selectedSpace.name" @error="useDefaultImage" />
      <div><span class="ready-label">READY TO BOOK</span><strong>{{ selectedSpace.name }}</strong><small>{{ listing.name }} · ₱{{ listing.price.toLocaleString() }} / month</small></div>
      <button type="button" @click="emit('book', selectedSpace)">Continue booking <ion-icon :icon="arrowForwardOutline" /></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IonIcon } from '@ionic/vue';
import { arrowForwardOutline } from 'ionicons/icons';

export type BookingSpace = { name: string; status: 'available' | 'occupied'; image?: string };
type BookingListing = { name: string; type: string; price: number; image?: string };

const props = defineProps<{ listing: BookingListing; spaces: BookingSpace[] }>();
const emit = defineEmits<{ book: [space: BookingSpace] }>();
const defaultImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85';
const selectedSpace = ref<BookingSpace | null>(null);
const rejectedSpace = ref<string | null>(null);
let rejectedSpaceTimer: number | undefined;

watch(() => props.listing.name, () => {
  selectedSpace.value = null;
  rejectedSpace.value = null;
});

function selectSpace(space: BookingSpace) {
  if (space.status === 'occupied') {
    rejectedSpace.value = null;
    window.requestAnimationFrame(() => { rejectedSpace.value = space.name; });
    window.clearTimeout(rejectedSpaceTimer);
    rejectedSpaceTimer = window.setTimeout(() => { rejectedSpace.value = null; }, 420);
    return;
  }
  selectedSpace.value = selectedSpace.value?.name === space.name ? null : space;
}
function useDefaultImage(event: Event) {
  (event.target as HTMLImageElement).src = defaultImage;
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
.booking-panel { color: #174b35; font-family: 'DM Sans', sans-serif; }.visual-heading { align-items: center; border-bottom: 1px solid #e4eae3; display: flex; justify-content: space-between; padding-bottom: 10px; }.visual-heading strong { font-family: 'Playfair Display', serif; font-size: 16px; }.visual-heading span { color: #87958b; font-size: 10px; }.room-preview { align-items: stretch; background: #f3f6f1; border: 1px solid #dce7da; border-radius: 9px; display: flex; gap: 10px; justify-content: center; margin-top: 10px; min-height: 150px; overflow: hidden; padding: 16px; }.visual-space { background: #fff; border: 2px solid #76ae80; border-radius: 8px; box-shadow: 0 4px 7px rgba(23,75,53,.18); color: inherit; cursor: pointer; display: flex; flex: 1; flex-direction: column; font: inherit; min-height: 86px; max-width: 145px; overflow: hidden; padding: 6px; position: relative; text-align: left; transition: border-color .2s, box-shadow .2s, transform .2s; }.visual-space:hover, .visual-space:focus-visible { border-color: #e2743e; box-shadow: 0 6px 12px rgba(23,75,53,.22); outline: 0; transform: translateY(-3px); }.visual-space.selected { border-color: #e2743e; box-shadow: 0 0 0 3px rgba(226,116,62,.2), 0 6px 12px rgba(23,75,53,.22); }.visual-space.occupied { border-color: #b7c1b8; cursor: not-allowed; }.visual-space.rejected-click { animation: rejected-bed .42s ease; border-color: #d4775c; }.visual-space img { border-radius: 4px; display: block; height: 72px; margin: 0 -2px 5px; object-fit: cover; width: calc(100% + 4px); }.visual-space strong { font-size: 9px; margin-top: 5px; }.visual-space small { color: #4b9b61; font-size: 8px; margin-top: 2px; }.visual-space.occupied small { color: #89968d; }.availability-legend { display: flex; gap: 16px; margin-top: 10px; }.availability-legend span { align-items: center; color: #718177; display: flex; font-size: 9px; gap: 6px; }.availability-legend i { border-radius: 50%; height: 8px; width: 8px; }.available-dot { background: #4b9b61; }.occupied-dot { background: #b7c1b8; }.selected-booking { align-items: center; background: #fff; border: 1px solid #e5ebe4; border-radius: 10px; box-shadow: 0 8px 18px rgba(23,75,53,.08); display: flex; gap: 12px; margin-top: 16px; padding: 9px; }.selected-booking img { border-radius: 7px; height: 58px; object-fit: cover; width: 66px; }.selected-booking div { display: flex; flex: 1; flex-direction: column; gap: 3px; min-width: 0; }.ready-label { color: #e2743e; font-size: 8px; font-weight: 700; letter-spacing: 1px; }.selected-booking strong { font-size: 12px; }.selected-booking small { color: #87958b; font-size: 9px; }.selected-booking button { align-items: center; background: #e2743e; border-radius: 6px; color: #fff; display: flex; font-size: 9px; font-weight: 700; gap: 5px; padding: 10px 11px; white-space: nowrap; }.selected-booking ion-icon { font-size: 13px; } @keyframes rejected-bed { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-3px); } } @media (prefers-reduced-motion: reduce) { .visual-space.rejected-click { animation: none; } } @media (max-width: 580px) { .room-preview { padding: 10px; }.selected-booking { align-items: stretch; flex-wrap: wrap; }.selected-booking button { justify-content: center; width: 100%; } }
</style>