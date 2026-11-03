<template>
  <section class="booking-panel">
    <div class="visual-heading">
      <button v-if="step !== 'floors'" class="back-button" type="button" @click="goBack">Back</button>
      <strong>{{ stepTitle }}</strong>
      <span>{{ stepSummary }}</span>
    </div>

    <Transition name="visual-step" mode="out-in">
      <div v-if="step === 'floors'" key="floors" class="visual-stage">
        <div class="visual-grid floor-grid">
          <button v-for="floor in floors" :key="floor.id" class="visual-card" type="button" @click="selectFloor(floor)">
            <img :src="floor.image || defaultFloorImage" :alt="floor.name" @error="useFallback($event, defaultFloorImage)" />
            <strong>{{ floor.name }}</strong>
            <small>{{ floor.rooms.length }} {{ floor.rooms.length === 1 ? 'room' : 'rooms' }}</small>
          </button>
        </div>
      </div>

      <div v-else-if="step === 'rooms'" key="rooms" class="visual-stage">
        <div class="visual-grid room-grid">
          <button v-for="room in selectedFloor?.rooms" :key="room.id" class="visual-card" type="button" @click="selectRoom(room)">
            <img :src="room.image || defaultRoomImage" :alt="room.name" @error="useFallback($event, defaultRoomImage)" />
            <strong>{{ room.name }}</strong>
            <small>{{ room.beds.length }} beds</small>
          </button>
        </div>
      </div>

      <div v-else key="beds" class="visual-stage beds-stage">
        <div class="bed-grid" :style="{ '--bed-rows': selectedRoom?.grid.rows, '--bed-columns': selectedRoom?.grid.columns }">
          <span v-for="cell in gridCells" :key="cell" class="grid-cell" />
          <button
            v-for="bed in selectedRoom?.beds"
            :key="bed.id"
            class="bed-marker"
            :class="{ occupied: bed.status === 'occupied' }"
            :style="{ gridRow: bed.row, gridColumn: bed.column }"
            type="button"
            :aria-label="`${bed.name}, ${bed.status}`"
            @click="selectBed(bed)"
          >
            <span class="bed-icon">⌁</span>
            <small>{{ bed.name }}</small>
          </button>
        </div>
        <div class="availability-legend"><span><i class="available-dot" /> Available</span><span><i class="occupied-dot" /> Occupied</span></div>
      </div>
    </Transition>

    <div v-if="selectedBed" class="selected-booking">
      <img :src="selectedBed.image || selectedRoom?.image || defaultRoomImage" :alt="selectedBed.name" @error="useFallback($event, defaultRoomImage)" />
      <div><span class="ready-label">{{ selectedBed.status === 'available' ? 'READY TO BOOK' : 'OCCUPIED' }}</span><strong>{{ selectedBed.name }}</strong><small>{{ selectedRoom?.name }} · ₱{{ listing.price.toLocaleString() }} / month</small></div>
      <button v-if="selectedBed.status === 'available'" type="button" @click="emit('book', selectedBed)">Continue booking <ion-icon :icon="arrowForwardOutline" /></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { IonIcon } from '@ionic/vue';
import { arrowForwardOutline } from 'ionicons/icons';
import { defaultFloorImage, defaultRoomImage, type BookingBed, type BookingFloor, type BookingRoom } from '../data/listings';

type BookingListing = { name: string; type: string; price: number; image?: string };
const props = defineProps<{ listing: BookingListing; floors: BookingFloor[] }>();
const emit = defineEmits<{ book: [bed: BookingBed] }>();
const step = ref<'floors' | 'rooms' | 'beds'>('floors');
const selectedFloor = ref<BookingFloor | null>(null);
const selectedRoom = ref<BookingRoom | null>(null);
const selectedBed = ref<BookingBed | null>(null);

const floors = computed(() => props.floors);
const stepTitle = computed(() => step.value === 'floors' ? 'Choose a floor' : step.value === 'rooms' ? `${selectedFloor.value?.name} rooms` : `${selectedRoom.value?.name} layout`);
const stepSummary = computed(() => step.value === 'floors' ? `${floors.value.length} ${floors.value.length === 1 ? 'floor' : 'floors'}` : step.value === 'rooms' ? `${selectedFloor.value?.rooms.length ?? 0} rooms` : `${selectedRoom.value?.beds.length ?? 0} beds`);
const gridCells = computed(() => Array.from({ length: (selectedRoom.value?.grid.rows ?? 0) * (selectedRoom.value?.grid.columns ?? 0) }, (_, index) => index));

watch(() => props.listing.name, reset);
watch(() => props.floors, reset);

function reset() {
  step.value = 'floors';
  selectedFloor.value = null;
  selectedRoom.value = null;
  selectedBed.value = null;
}
function selectFloor(floor: BookingFloor) {
  selectedFloor.value = floor;
  selectedRoom.value = null;
  selectedBed.value = null;
  step.value = 'rooms';
}
function selectRoom(room: BookingRoom) {
  selectedRoom.value = room;
  selectedBed.value = null;
  step.value = 'beds';
}
function selectBed(bed: BookingBed) {
  selectedBed.value = bed;
}
function goBack() {
  if (step.value === 'beds') {
    step.value = 'rooms';
    selectedRoom.value = null;
    selectedBed.value = null;
  } else {
    step.value = 'floors';
    selectedFloor.value = null;
  }
}
function useFallback(event: Event, fallback: string) {
  const image = event.target as HTMLImageElement;
  if (image.src !== fallback) image.src = fallback;
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
.booking-panel { color: #174b35; font-family: 'DM Sans', sans-serif; }
.visual-heading { align-items: center; border-bottom: 1px solid #e4eae3; display: flex; justify-content: space-between; min-height: 31px; padding-bottom: 10px; }
.visual-heading strong { font-family: 'Playfair Display', serif; font-size: 16px; }
.visual-heading span { color: #87958b; font-size: 10px; }
.back-button { background: transparent; color: #e2743e; font-size: 10px; font-weight: 700; padding: 0; }
.visual-stage { min-height: 150px; padding-top: 10px; }
.visual-grid { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(120px, 145px)); justify-content: center; }
.visual-card { background: #fff; border: 2px solid #76ae80; border-radius: 8px; box-shadow: 0 4px 7px rgba(23,75,53,.18); color: inherit; cursor: pointer; display: flex; flex-direction: column; font: inherit; overflow: hidden; padding: 6px; text-align: left; transition: border-color .2s, box-shadow .2s, transform .2s; }
.visual-card:hover, .visual-card:focus-visible { border-color: #e2743e; box-shadow: 0 6px 12px rgba(23,75,53,.22); outline: 0; transform: translateY(-3px); }
.visual-card img { border-radius: 4px; display: block; height: 72px; object-fit: cover; width: 100%; }
.visual-card strong { font-size: 9px; margin-top: 5px; }.visual-card small { color: #4b9b61; font-size: 8px; margin-top: 2px; }
.bed-grid { background: #f3f6f1; border: 1px solid #dce7da; border-radius: 9px; display: grid; gap: 8px; grid-template-columns: repeat(var(--bed-columns), 1fr); grid-template-rows: repeat(var(--bed-rows), 1fr); min-height: 150px; padding: 14px; }
.grid-cell { background: rgba(255,255,255,.62); border: 1px dashed #d2dfd2; border-radius: 6px; min-height: 48px; }
.bed-marker { align-items: center; background: #fff; border: 2px solid #76ae80; border-radius: 8px; color: #174b35; cursor: pointer; display: flex; flex-direction: column; font: inherit; grid-row: var(--bed-row); justify-content: center; min-width: 0; padding: 3px; transition: border-color .2s, transform .2s; }
.bed-marker:hover, .bed-marker:focus-visible { border-color: #e2743e; outline: 0; transform: translateY(-2px); }.bed-marker.occupied { border-color: #b7c1b8; cursor: not-allowed; }.bed-icon { font-size: 23px; line-height: 1; transform: rotate(90deg); }.bed-marker small { font-size: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
.availability-legend { display: flex; gap: 16px; margin-top: 10px; }.availability-legend span { align-items: center; color: #718177; display: flex; font-size: 9px; gap: 6px; }.availability-legend i { border-radius: 50%; height: 8px; width: 8px; }.available-dot { background: #4b9b61; }.occupied-dot { background: #b7c1b8; }
.selected-booking { align-items: center; background: #fff; border: 1px solid #e5ebe4; border-radius: 10px; box-shadow: 0 8px 18px rgba(23,75,53,.08); display: flex; gap: 12px; margin-top: 16px; padding: 9px; }.selected-booking img { border-radius: 7px; height: 58px; object-fit: cover; width: 66px; }.selected-booking div { display: flex; flex: 1; flex-direction: column; gap: 3px; min-width: 0; }.ready-label { color: #e2743e; font-size: 8px; font-weight: 700; letter-spacing: 1px; }.selected-booking strong { font-size: 12px; }.selected-booking small { color: #87958b; font-size: 9px; }.selected-booking button { align-items: center; background: #e2743e; border-radius: 6px; color: #fff; display: flex; font-size: 9px; font-weight: 700; gap: 5px; padding: 10px 11px; white-space: nowrap; }.selected-booking ion-icon { font-size: 13px; }
.visual-step-enter-active, .visual-step-leave-active { transition: opacity .22s ease, transform .22s ease; }.visual-step-enter-from { opacity: 0; transform: translateX(14px); }.visual-step-leave-to { opacity: 0; transform: translateX(-14px); }
@media (prefers-reduced-motion: reduce) { .visual-step-enter-active, .visual-step-leave-active { transition: none; } } @media (max-width: 580px) { .selected-booking { align-items: stretch; flex-wrap: wrap; }.selected-booking button { justify-content: center; width: 100%; } }
</style>
