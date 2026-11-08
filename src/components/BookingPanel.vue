<template>
  <section class="booking-panel">
    <div class="visual-heading">
      <button v-if="step !== 'floors'" class="back-button" type="button" @click="goBack"><ion-icon :icon="arrowBackOutline" /> Back</button>
      <div class="heading-title"><span class="heading-icon"><ion-icon :icon="stepIcon" /></span><strong>{{ stepTitle }}</strong></div>
      <span class="step-summary">{{ stepSummary }}</span>
    </div>

    <Transition name="visual-step" mode="out-in">
      <div v-if="step === 'floors'" key="floors" class="visual-stage">
        <div class="visual-grid floor-grid">
          <button v-for="floor in floors" :key="floor.id" class="visual-card" type="button" @click="selectFloor(floor)">
            <img :src="floor.image || defaultFloorImage" :alt="floor.name" @error="useFallback($event, defaultFloorImage)" />
            <div class="card-title"><span class="card-icon"><ion-icon :icon="businessOutline" /></span><strong>{{ floor.name }}</strong></div>
            <small><ion-icon :icon="homeOutline" /> {{ floor.rooms.length }} {{ floor.rooms.length === 1 ? 'room' : 'rooms' }}</small>
          </button>
          <div v-if="floors.length === 1" class="visual-card unavailable-card" aria-label="No other floors listed">
            <span class="unavailable-icon"><ion-icon :icon="addOutline" /></span>
            <strong>No other floors listed</strong>
            <small>This is the only floor available for this listing.</small>
          </div>
        </div>
      </div>

      <div v-else-if="step === 'rooms'" key="rooms" class="visual-stage">
        <div class="visual-grid room-grid">
          <button v-for="room in selectedFloor?.rooms" :key="room.id" class="visual-card" type="button" @click="selectRoom(room)">
            <img :src="room.image || defaultRoomImage" :alt="room.name" @error="useFallback($event, defaultRoomImage)" />
            <div class="card-title"><span class="card-icon"><ion-icon :icon="homeOutline" /></span><strong>{{ room.name }}</strong></div>
            <small><ion-icon :icon="bedOutline" /> {{ room.beds.length }} beds</small>
          </button>
          <div v-if="selectedFloor?.rooms.length === 1" class="visual-card unavailable-card" aria-label="No other rooms listed">
            <span class="unavailable-icon"><ion-icon :icon="addOutline" /></span>
            <strong>No other rooms listed</strong>
            <small>This is the only room available on this floor.</small>
          </div>
        </div>
      </div>

      <div v-else key="beds" class="visual-stage beds-stage">
        <div class="bed-grid" :style="{ '--bed-rows': selectedRoom?.grid.rows, '--bed-columns': selectedRoom?.grid.columns }">
          <div v-for="cell in gridCells" :key="cell.id" class="grid-cell" :style="{ gridRow: cell.row, gridColumn: cell.column }">
            <div v-if="selectedRoom?.grid.door?.row === cell.row && selectedRoom.grid.door.column === cell.column" class="door-marker" aria-label="Room entrance">
              <ion-icon :icon="enterOutline" />
              <small>Door</small>
            </div>
            <div class="bed-stack">
              <button
                v-for="bed in cell.beds"
                :key="bed.id"
                class="bed-marker"
                :class="{ occupied: bed.status === 'occupied' }"
                type="button"
                :aria-label="`${bed.name}, ${bed.status}`"
                @click="selectBed(bed)"
              >
                <ion-icon class="bed-icon" :icon="bedOutline" />
                <span class="bed-status" :class="{ booked: bed.status === 'occupied' }">
                  {{ bed.status === 'occupied' ? 'BOOKED' : 'AVAILABLE' }}
                </span>
              </button>
            </div>
          </div>
        </div>
        <div class="availability-legend"><span><i class="available-dot" /> Available</span><span><i class="occupied-dot" /> Occupied</span><span><ion-icon :icon="gridOutline" /> Host layout</span></div>
      </div>
    </Transition>

    <div v-if="selectedBookingDetails" class="selected-booking">
      <img :src="selectedBookingDetails.image" :alt="selectedBookingDetails.name" @error="useFallback($event, selectedBookingDetails.fallback)" />
      <div><span class="ready-label"><ion-icon :icon="selectedBookingDetails.icon" /> {{ selectedBookingDetails.label }}</span><strong>{{ selectedBookingDetails.name }}</strong><small><ion-icon :icon="homeOutline" /> {{ selectedBookingDetails.subtitle }} · ₱{{ selectedBookingDetails.price.toLocaleString() }} / month</small></div>
      <div v-if="selectedBed?.maintenance?.length" class="selected-booking-history">
        <strong>Maintenance history</strong>
        <ul>
          <li v-for="entry in selectedBed.maintenance" :key="entry">{{ entry }}</li>
        </ul>
      </div>
      <div v-if="listing.includedAmenities.length" class="selected-booking-history">
        <strong>Amenities included</strong>
        <ul>
          <li v-for="amenity in listing.includedAmenities" :key="amenity">{{ amenity }}</li>
        </ul>
      </div>
      <div v-if="listing.houseRules.length" class="selected-booking-history">
        <strong>House rules</strong>
        <ul>
          <li v-for="rule in listing.houseRules" :key="rule">{{ rule }}</li>
        </ul>
      </div>
      <button v-if="selectedBookingDetails.canBook" type="button" @click="emit('book', selectedBookingDetails.selection)">Continue booking <ion-icon :icon="arrowForwardOutline" /></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { IonIcon } from '@ionic/vue';
import { addOutline, arrowBackOutline, arrowForwardOutline, bedOutline, businessOutline, checkmarkCircleOutline, enterOutline, gridOutline, homeOutline, lockClosedOutline } from 'ionicons/icons';
import { defaultFloorImage, defaultRoomImage, type BookingBed, type BookingFloor, type BookingRoom, type BookingSelection } from '../data/listings';

type BookingListing = { name: string; type: string; price: number; image?: string; includedAmenities: string[]; houseRules: string[] };
const props = defineProps<{ listing: BookingListing; floors: BookingFloor[] }>();
const emit = defineEmits<{ book: [selection: BookingSelection] }>();
const step = ref<'floors' | 'rooms' | 'beds'>('floors');
const selectedFloor = ref<BookingFloor | null>(null);
const selectedRoom = ref<BookingRoom | null>(null);
const selectedBed = ref<BookingBed | null>(null);
const selectedBooking = ref<BookingSelection | null>(null);

const floors = computed(() => props.floors);
const stepTitle = computed(() => step.value === 'floors' ? 'Choose a floor' : step.value === 'rooms' ? `${selectedFloor.value?.name} rooms` : `${selectedRoom.value?.name} layout`);
const stepSummary = computed(() => step.value === 'floors' ? `${floors.value.length} ${floors.value.length === 1 ? 'floor' : 'floors'}` : step.value === 'rooms' ? `${selectedFloor.value?.rooms.length ?? 0} rooms` : `${selectedRoom.value?.beds.length ?? 0} beds`);
const stepIcon = computed(() => step.value === 'floors' ? businessOutline : step.value === 'rooms' ? homeOutline : gridOutline);
const selectedBookingDetails = computed(() => {
  const selection = selectedBooking.value;
  if (!selection) return null;
  if (selection.kind === 'bed') {
    return {
      selection,
      image: selection.value.image || selectedRoom.value?.image || defaultRoomImage,
      fallback: defaultRoomImage,
      icon: selection.value.status === 'available' ? checkmarkCircleOutline : lockClosedOutline,
      label: selection.value.status === 'available' ? 'READY TO BOOK' : 'OCCUPIED',
      name: selection.value.name,
      subtitle: selectedRoom.value?.name || 'Selected bed',
      price: selection.value.price ?? props.listing.price,
      canBook: selection.value.status === 'available',
    };
  }
  return {
    selection,
    image: selection.value.image || defaultRoomImage,
    fallback: defaultRoomImage,
    icon: checkmarkCircleOutline,
    label: 'ROOM READY TO BOOK',
    name: selection.value.name,
    subtitle: selectedFloor.value?.name || 'Selected room',
    price: selection.value.price ?? props.listing.price,
    canBook: true,
  };
});
const gridCells = computed(() => {
  const room = selectedRoom.value;
  if (!room) return [];
  return Array.from({ length: room.grid.rows * room.grid.columns }, (_, index) => {
    const row = Math.floor(index / room.grid.columns) + 1;
    const column = (index % room.grid.columns) + 1;
    return {
      id: `${row}-${column}`,
      row,
      column,
      beds: room.beds.filter((bed) => bed.row === row && bed.column === column),
    };
  });
});

watch(() => props.listing.name, reset);
watch(() => props.floors, reset);

function reset() {
  step.value = 'floors';
  selectedFloor.value = null;
  selectedRoom.value = null;
  selectedBed.value = null;
  selectedBooking.value = null;
}
function selectFloor(floor: BookingFloor) {
  selectedFloor.value = floor;
  selectedRoom.value = null;
  selectedBed.value = null;
  selectedBooking.value = null;
  step.value = 'rooms';
}
function selectRoom(room: BookingRoom) {
  selectedRoom.value = room;
  selectedBed.value = null;
  if (props.listing.type !== 'Bedspace') {
    selectedBooking.value = { kind: 'room', value: room };
    step.value = 'rooms';
  } else {
    selectedBooking.value = null;
    step.value = 'beds';
  }
}
function selectBed(bed: BookingBed) {
  selectedBed.value = bed;
  selectedBooking.value = { kind: 'bed', value: bed };
}
function goBack() {
  if (step.value === 'beds') {
    step.value = 'rooms';
    selectedRoom.value = null;
    selectedBed.value = null;
    selectedBooking.value = null;
  } else {
    step.value = 'floors';
    selectedFloor.value = null;
    selectedBooking.value = null;
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
.visual-heading { align-items: center; border-bottom: 1px solid #e4eae3; display: flex; gap: 10px; justify-content: space-between; min-height: 42px; padding-bottom: 12px; }
.heading-title { align-items: center; display: flex; gap: 9px; min-width: 0; }
.heading-icon { align-items: center; background: #edf5ed; border-radius: 8px; color: #4b9b61; display: inline-flex; height: 28px; justify-content: center; width: 28px; }
.heading-icon ion-icon { font-size: 15px; }
.visual-heading strong { font-family: 'Playfair Display', serif; font-size: 17px; }
.step-summary { color: #87958b; font-size: 10px; white-space: nowrap; }
.back-button { align-items: center; background: #f3f6f1; border-radius: 7px; color: #587065; display: flex; font-size: 10px; font-weight: 700; gap: 4px; padding: 7px 9px; }
.back-button ion-icon { color: #e2743e; font-size: 13px; }
.visual-stage { min-height: 184px; padding: 18px 0 5px; }
.visual-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); justify-content: center; }
.visual-card { background: #fff; border: 1px solid #dce7da; border-radius: 12px; box-shadow: 0 5px 13px rgba(23,75,53,.09); color: inherit; cursor: pointer; display: flex; flex-direction: column; font: inherit; overflow: hidden; padding: 8px; text-align: left; transition: border-color .2s, box-shadow .2s, transform .2s; }
.visual-card:hover, .visual-card:focus-visible { border-color: #e2743e; box-shadow: 0 6px 12px rgba(23,75,53,.22); outline: 0; transform: translateY(-3px); }
.unavailable-card { align-items: flex-start; background: #f7f9f6; border-style: dashed; box-shadow: none; color: #87958b; cursor: default; justify-content: center; min-height: 145px; }
.unavailable-card:hover, .unavailable-card:focus-visible { border-color: #dce7da; box-shadow: none; transform: none; }
.unavailable-card strong { color: #718177; font-size: 10px; margin-top: 10px; }
.unavailable-card small { color: #9aa79e; line-height: 1.4; margin-top: 6px; }
.unavailable-icon { align-items: center; background: #e9eee8; border-radius: 50%; color: #9aa79e; display: inline-flex; height: 28px; justify-content: center; width: 28px; }
.unavailable-icon ion-icon { font-size: 16px; }
.visual-card img { border-radius: 7px; display: block; height: 88px; object-fit: cover; width: 100%; }
.card-title { align-items: center; display: flex; gap: 7px; margin-top: 9px; }.card-title strong { font-size: 10px; }.card-icon { align-items: center; background: #fff3e9; border-radius: 5px; color: #e2743e; display: inline-flex; height: 21px; justify-content: center; width: 21px; }.card-icon ion-icon { font-size: 12px; }
.visual-card small { align-items: center; color: #718177; display: flex; font-size: 9px; gap: 4px; margin-top: 6px; }.visual-card small ion-icon { color: #4b9b61; font-size: 12px; }
.bed-grid { background: #f3f6f1; border: 1px solid #dce7da; border-radius: 12px; display: grid; gap: 8px; grid-template-columns: repeat(var(--bed-columns), minmax(0, 1fr)); grid-template-rows: repeat(var(--bed-rows), minmax(88px, auto)); padding: 14px; }
.grid-cell { align-items: center; background: rgba(255,255,255,.62); border: 1px dashed #d2dfd2; border-radius: 8px; display: flex; justify-content: center; min-height: 88px; min-width: 0; padding: 5px; position: relative; }
.bed-stack { align-items: center; display: flex; flex-direction: column; gap: 5px; height: 100%; justify-content: center; width: 100%; }
.door-marker { align-items: center; color: #e2743e; display: flex; flex-direction: column; font-size: 8px; gap: 2px; position: absolute; right: 5px; top: 5px; }
.door-marker ion-icon { background: #fff3e9; border: 1px solid #f1c7a8; border-radius: 5px; font-size: 19px; padding: 3px; }
.door-marker small { color: #b86a3f; font-size: 7px; font-weight: 700; }
.bed-marker { align-items: center; aspect-ratio: 1; background: #fff; border: 2px solid #76ae80; border-radius: 8px; color: #174b35; cursor: pointer; display: flex; flex: 0 1 auto; flex-direction: column; font: inherit; gap: 2px; justify-content: center; max-height: 68px; max-width: 68px; min-height: 0; min-width: 0; padding: 3px; transition: border-color .2s, transform .2s; width: 72%; }
.bed-stack .bed-marker:only-child { flex: 0 0 auto; }
.bed-stack .bed-marker:not(:only-child) { max-height: 52px; max-width: 52px; width: 58%; }
.bed-marker:hover, .bed-marker:focus-visible { border-color: #e2743e; outline: 0; transform: translateY(-2px); }.bed-marker.occupied { background: #f5f7f5; border-color: #aab8ad; cursor: not-allowed; }.bed-icon { color: #4b9b61; font-size: clamp(15px, 3vw, 23px); }.bed-marker.occupied .bed-icon { color: #87958b; }.bed-marker small { font-size: clamp(6px, 1.5vw, 8px); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }.bed-status { background: #e8f4e9; border-radius: 999px; color: #39834e; font-size: 6px; font-weight: 700; letter-spacing: .3px; line-height: 1; padding: 3px 4px; white-space: nowrap; }.bed-status.booked { background: #e6ebe7; color: #69786e; }
.availability-legend { align-items: center; display: flex; flex-wrap: wrap; gap: 13px; margin-top: 14px; }.availability-legend span { align-items: center; color: #718177; display: flex; font-size: 9px; gap: 6px; }.availability-legend i { border-radius: 50%; height: 8px; width: 8px; }.availability-legend ion-icon { color: #87958b; font-size: 12px; }.available-dot { background: #4b9b61; }.occupied-dot { background: #b7c1b8; }
.selected-booking { align-items: center; background: #fff; border: 1px solid #e5ebe4; border-radius: 14px; box-shadow: 0 10px 22px rgba(23,75,53,.1); display: flex; flex-wrap: wrap; gap: 18px; margin-top: 20px; padding: 15px; }.selected-booking img { border-radius: 10px; height: 96px; object-fit: cover; width: 112px; }.selected-booking > div:not(.selected-booking-history) { display: flex; flex: 1; flex-direction: column; gap: 6px; min-width: 0; }.ready-label { align-items: center; color: #e2743e; display: flex; font-size: 9px; font-weight: 700; gap: 5px; letter-spacing: 1px; }.ready-label ion-icon { font-size: 14px; }.selected-booking strong { font-family: 'Playfair Display', serif; font-size: 17px; line-height: 1.15; }.selected-booking small { align-items: center; color: #87958b; display: flex; font-size: 11px; gap: 4px; line-height: 1.35; }.selected-booking small ion-icon { color: #e2743e; font-size: 13px; }.selected-booking-history { border-top: 1px solid #edf1ec; flex-basis: 100%; padding-top: 12px; }.selected-booking-history strong { color: #174b35; display: block; font-family: 'DM Sans', sans-serif; font-size: 11px; }.selected-booking-history ul { color: #718177; font-size: 10px; line-height: 1.5; margin: 7px 0 0; padding-left: 17px; }.selected-booking-history li::marker { color: #e2743e; }.selected-booking button { align-items: center; background: #e2743e; border-radius: 8px; color: #fff; display: flex; font-size: 11px; font-weight: 700; gap: 6px; padding: 13px 15px; white-space: nowrap; }.selected-booking button:hover, .selected-booking button:focus-visible { background: #cf6332; outline: 0; }.selected-booking ion-icon { font-size: 15px; }
.visual-step-enter-active, .visual-step-leave-active { transition: opacity .22s ease, transform .22s ease; }.visual-step-enter-from { opacity: 0; transform: translateX(14px); }.visual-step-leave-to { opacity: 0; transform: translateX(-14px); }
@media (prefers-reduced-motion: reduce) { .visual-step-enter-active, .visual-step-leave-active { transition: none; } } @media (max-width: 580px) { .selected-booking { align-items: stretch; flex-wrap: wrap; gap: 12px; padding: 12px; }.selected-booking img { height: 82px; width: 94px; }.selected-booking strong { font-size: 15px; }.selected-booking small { font-size: 10px; }.selected-booking button { justify-content: center; width: 100%; } }
</style>
