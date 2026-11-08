<template>
  <ion-page>
    <ion-content :fullscreen="true" class="host-content">
      <header class="host-header">
        <a class="brand" href="/home" aria-label="Casa home"><img src="/casa-logo.png" alt="" class="brand-mark" /><span>casa<span class="brand-dot">.</span></span></a>
        <nav class="host-nav" aria-label="Host navigation"><a href="/host">Dashboard</a><a class="active" href="/host/spaces">My spaces</a><a href="/host/requests">Requests</a></nav>
        <div class="host-account"><span class="avatar">{{ initials }}</span><span class="host-name">{{ displayName }}</span><button type="button" aria-label="Log out" @click="logout">Log out</button></div>
      </header>
      <main class="host-shell">
        <div class="page-heading"><div><a class="back-link" href="/host">← Dashboard</a><span class="eyebrow">YOUR CASA SPACES</span><h1>My spaces.</h1><p>Keep your listings fresh, accurate, and ready for their next resident.</p></div><a class="primary-button" href="/host/spaces/new"><ion-icon :icon="addOutline" /> Add a space</a></div>
        <div class="toolbar"><div class="search-box"><ion-icon :icon="searchOutline" /><input v-model="search" type="search" placeholder="Search your spaces" aria-label="Search spaces" /></div><select v-model="filter" aria-label="Filter spaces"><option value="all">All spaces</option><option value="published">Published</option><option value="draft">Drafts</option></select></div>
        <p v-if="errorMessage" class="notice error-notice" role="alert">{{ errorMessage }}</p>
        <p v-else-if="notice" class="notice" role="status">{{ notice }}</p>
        <p v-if="availabilityError" class="notice error-notice" role="alert">Availability couldn’t be loaded: {{ availabilityError }}</p>
        <p v-if="isLoading" class="data-message" role="status">Loading your listings…</p>
        <section v-else-if="!errorMessage && filteredSpaces.length" class="space-grid" aria-label="Host spaces">
          <article v-for="space in filteredSpaces" :key="space.id" :id="`space-${space.id}`" class="space-card" :class="{ 'focused-space': focusedSpaceId === space.id }" role="link" tabindex="0" @click="previewSpace(space.id)" @keydown.enter.self="previewSpace(space.id)">
            <div class="space-photo" :style="{ backgroundImage: `url(${space.cover_photo_url || defaultListingImage})` }">
              <span :class="['status-badge', space.status]"><i /> {{ space.status === 'published' ? 'Published' : 'Draft' }}</span>
            </div>
            <div class="space-body">
              <div class="space-title"><div><h2>{{ space.name }}</h2><span><ion-icon :icon="locationOutline" /> {{ space.location }}</span></div><strong>{{ availabilityFor(space) }}</strong></div>
              <div class="space-stats"><span><small>Monthly rent from</small><b>₱{{ Number(space.monthly_rent).toLocaleString() }}</b></span><span><small>Available spots</small><b>{{ availableCapacityFor(space) }}</b></span><span><small>Status</small><b>{{ space.status === 'published' ? 'Published' : 'Draft' }}</b></span></div>
              <div class="space-actions">
                <button type="button" @click.stop="editSpace(space.id)">Edit listing</button>
                <button type="button" class="delete-button" :disabled="deletingSpaceId === space.id" @click.stop="deleteSpace(space)">{{ deletingSpaceId === space.id ? 'Deleting…' : 'Delete' }}</button>
              </div>
            </div>
          </article>
        </section>
        <div v-else-if="!errorMessage" class="empty-state"><ion-icon :icon="searchOutline" /><h2>{{ spaces.length ? 'No spaces found' : 'No listings yet' }}</h2><p>{{ spaces.length ? 'Try a different search or filter.' : 'Add your first space to get started.' }}</p><a v-if="!spaces.length" class="primary-button" href="/host/spaces/new"><ion-icon :icon="addOutline" /> Add a space</a></div>
      </main>
      <Transition name="preview">
      <div v-if="previewLoading || previewError || selectedPreview" class="preview-backdrop" @click.self="closePreview">
        <section v-if="previewLoading" class="preview-dialog preview-message" role="status">Loading listing preview…</section>
        <section v-if="previewError" class="preview-dialog preview-message" role="alert">
          <button class="preview-close" type="button" aria-label="Close preview" @click="closePreview">×</button>
          <p>{{ previewError }}</p>
        </section>
        <section v-if="selectedPreview" class="preview-dialog" role="dialog" aria-modal="true" :aria-label="`Preview ${selectedPreview.name}`">
          <button class="preview-close" type="button" aria-label="Close preview" @click="closePreview">×</button>
          <div class="preview-cover" :style="{ backgroundImage: `url(${selectedPreview.image})` }">
            <span class="preview-status">{{ previewStatus === 'published' ? 'Published listing' : 'Draft preview' }}</span>
          </div>
          <div class="preview-content">
            <p class="preview-note">Host preview · Navigate the floors, rooms, and beds as renters would. Booking is disabled.</p>
            <div class="preview-heading"><div><span class="eyebrow">{{ selectedPreview.type }}</span><h2>{{ selectedPreview.name }}</h2><p><ion-icon :icon="locationOutline" /> {{ selectedPreview.location }}</p></div><strong>₱{{ selectedPreview.price.toLocaleString() }}<small> / month</small></strong></div>
            <p class="preview-description">{{ selectedPreview.description }}</p>
            <BookingPanel :listing="selectedPreview" :floors="previewFloors" :read-only="true" />
          </div>
        </section>
      </div>
      </Transition>
      <Transition name="delete-confirm">
        <div v-if="pendingDeleteSpace" class="delete-backdrop" @click.self="cancelDelete">
          <section class="delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
            <span class="delete-dialog-icon"><ion-icon :icon="trashOutline" /></span>
            <h2 id="delete-dialog-title">Delete this listing?</h2>
            <p id="delete-dialog-description">You’re about to permanently delete <strong>{{ pendingDeleteSpace.name }}</strong>, including its floors, rooms, and beds. This action can’t be undone.</p>
            <p v-if="deleteError" class="delete-error" role="alert">{{ deleteError }}</p>
            <div class="delete-dialog-actions">
              <button type="button" class="cancel-delete-button" :disabled="deletingSpaceId !== null" @click="cancelDelete">Keep listing</button>
              <button type="button" class="confirm-delete-button" :disabled="deletingSpaceId !== null" @click="confirmDelete">
                {{ deletingSpaceId === pendingDeleteSpace.id ? 'Deleting…' : 'Delete listing' }}
              </button>
            </div>
          </section>
        </div>
      </Transition>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref } from 'vue';
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { useRoute, useRouter } from 'vue-router';
import { addOutline, locationOutline, searchOutline, trashOutline } from 'ionicons/icons';
import BookingPanel from '../components/BookingPanel.vue';
import { useLogout } from '../composables/useLogout';
import { useAuthUser } from '../composables/useAuthUser';
import { defaultListingImage, getBookingFloors, mapDatabaseSpaces, type Listing } from '../data/listings';
import { getHostSpaceAvailability, type HostReservation } from '../data/hostAvailability';
import { getSupabaseClient } from '../lib/supabase';

type ListingBed = { id: number };
type ListingRoom = { id: number; bedspaces: ListingBed[] };
type ListingFloor = { rooms: ListingRoom[] };
type HostSpace = {
  id: number;
  name: string;
  location: string;
  type: 'Bedspace' | 'Private room';
  monthly_rent: number;
  cover_photo_url: string | null;
  status: 'published' | 'draft';
  created_at: string;
  floors: ListingFloor[];
};

const search = ref('');
const { logout } = useLogout();
const { user } = useAuthUser();
const route = useRoute();
const router = useRouter();
const displayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'Host');
const initials = computed(() => displayName.value.split(/\s+/).filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase());
const filter = ref<'all' | 'published' | 'draft'>('all');
const spaces = ref<HostSpace[]>([]);
const bookedSpots = ref<HostReservation[]>([]);
const availabilityLoaded = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const availabilityError = ref('');
const notice = ref('');
const deletingSpaceId = ref<number | null>(null);
const pendingDeleteSpace = ref<HostSpace | null>(null);
const deleteError = ref('');
const focusedSpaceId = ref<number | null>(null);
const selectedPreview = ref<Listing | null>(null);
const previewFloors = computed(() => selectedPreview.value ? getBookingFloors(selectedPreview.value) : []);
const previewStatus = ref<'published' | 'draft'>('published');
const previewLoading = ref(false);
const previewError = ref('');
const filteredSpaces = computed(() => {
  const term = search.value.trim().toLowerCase();
  return spaces.value.filter((space) => (filter.value === 'all' || space.status === filter.value)
    && (!term || `${space.name} ${space.location} ${space.type}`.toLowerCase().includes(term)));
});
let focusTimer: number | undefined;

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message;
  return 'An unexpected error occurred.';
}
function availableCapacityFor(space: HostSpace): number | string {
  if (space.status !== 'published' || !availabilityLoaded.value) return '—';
  return getHostSpaceAvailability(space, bookedSpots.value).available;
}
function availabilityFor(space: HostSpace): string {
  if (space.status !== 'published' || !availabilityLoaded.value) return space.status === 'draft' ? 'Draft' : '—';
  const { total, reserved } = getHostSpaceAvailability(space, bookedSpots.value);
  return `${reserved}/${total} reserved`;
}
async function loadSpaces() {
  isLoading.value = true;
  errorMessage.value = '';
  availabilityError.value = '';
  availabilityLoaded.value = false;
  try {
    const client = getSupabaseClient();
    const { data: { user: host }, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!host) throw new Error('Sign in to manage your listings.');
    const [spacesResult, bookingsResult] = await Promise.all([
      client.from('spaces').select(`id, name, location, type, monthly_rent, cover_photo_url, status, created_at,
        floors(rooms(id, bedspaces(id)))`).eq('host_id', host.id).order('created_at', { ascending: false }),
      client.rpc('get_booked_listing_spaces'),
    ]);
    if (spacesResult.error) throw spacesResult.error;
    spaces.value = (spacesResult.data ?? []) as HostSpace[];
    if (bookingsResult.error) {
      availabilityError.value = getErrorMessage(bookingsResult.error);
      bookedSpots.value = [];
    } else {
      bookedSpots.value = (bookingsResult.data ?? []) as HostReservation[];
      availabilityLoaded.value = true;
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
    spaces.value = [];
  } finally {
    isLoading.value = false;
  }
  if (!errorMessage.value) await focusRequestedSpace();
}
async function focusRequestedSpace() {
  const id = Number(route.query.spaceId);
  if (!Number.isSafeInteger(id) || id <= 0) return;
  focusedSpaceId.value = id;
  search.value = '';
  filter.value = 'all';
  await nextTick();
  const target = document.getElementById(`space-${id}`);
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target?.focus({ preventScroll: true });
  window.clearTimeout(focusTimer);
  focusTimer = window.setTimeout(() => { focusedSpaceId.value = null; }, 4000);
}
function editSpace(id: number) {
  void router.push({ name: 'AddSpace', query: { edit: String(id) } });
}
async function previewSpace(id: number) {
  selectedPreview.value = null;
  previewError.value = '';
  previewLoading.value = true;
  try {
    const client = getSupabaseClient();
    const { data: { user: host }, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!host) throw new Error('Sign in to preview your listing.');
    const [{ data, error: listingError }, { data: reservations, error: reservationError }] = await Promise.all([
      client.from('spaces').select(`
        id, name, location, type, description, monthly_rent, cover_photo_url, latitude, longitude, created_at, status,
        floors(id, name, photo_url, rooms(
          id, name, photo_url, monthly_rent, amenities, house_rules, maintenance, grid_rows, grid_columns,
          door_row, door_column, bedspaces(id, name, price, row, column_index, photo_url, amenities, house_rules, maintenance)
        ))
      `).eq('id', id).eq('host_id', host.id).single(),
      client.rpc('get_booked_listing_spaces'),
    ]);
    if (listingError) throw listingError;
    if (reservationError) throw reservationError;
    if (!data) throw new Error('This listing could not be found.');
    const [listing] = mapDatabaseSpaces([data], reservations ?? []);
    if (!listing) throw new Error('This listing does not have any previewable details.');
    previewStatus.value = data.status;
    selectedPreview.value = listing;
  } catch (error) {
    previewError.value = getErrorMessage(error);
  } finally {
    previewLoading.value = false;
  }
}
function closePreview() {
  selectedPreview.value = null;
  previewError.value = '';
}
function deleteSpace(space: HostSpace) {
  deleteError.value = '';
  pendingDeleteSpace.value = space;
}
function cancelDelete() {
  if (deletingSpaceId.value !== null) return;
  pendingDeleteSpace.value = null;
  deleteError.value = '';
}
async function confirmDelete() {
  const space = pendingDeleteSpace.value;
  if (!space || deletingSpaceId.value !== null) return;
  deletingSpaceId.value = space.id;
  deleteError.value = '';
  notice.value = '';
  try {
    const client = getSupabaseClient();
    const roomIds = space.floors.flatMap((floor) => floor.rooms.map((room) => room.id));
    const { data: currentBookings, error: bookingError } = await client.rpc('get_booked_listing_spaces');
    if (bookingError) throw bookingError;
    const bookedRoomIds = new Set((currentBookings ?? []).map((booking: HostReservation) => String(booking.room_id)));
    if (roomIds.some((roomId) => bookedRoomIds.has(String(roomId)))) {
      throw new Error('This listing has active reservations. Resolve them before deleting it.');
    }
    const { error } = await client.from('spaces').delete().eq('id', space.id);
    if (error) throw error;
    spaces.value = spaces.value.filter((listing) => listing.id !== space.id);
    notice.value = `${space.name} was deleted.`;
    pendingDeleteSpace.value = null;
  } catch (error) {
    deleteError.value = getErrorMessage(error);
  } finally {
    deletingSpaceId.value = null;
  }
}

onIonViewWillEnter(() => { void loadSpaces(); });
onUnmounted(() => window.clearTimeout(focusTimer));
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
:global(body) { background: #f7f8f4; color: #174b35; font-family: 'DM Sans', sans-serif; } :global(*) { box-sizing: border-box; }
.host-content { --background: #f7f8f4; }.host-header { align-items: center; background: #fff; border-bottom: 1px solid #e5ebe4; display: flex; height: 78px; justify-content: space-between; padding: 0 clamp(22px, 5vw, 74px); }.brand { align-items: center; color: #174b35; display: flex; font-size: 26px; font-weight: 700; gap: 8px; letter-spacing: -1.5px; text-decoration: none; }.brand-mark { height: 35px; width: 35px; }.brand-dot { color: #e2743e; }.host-nav { display: flex; gap: 28px; }.host-nav a { color: #849087; font-size: 11px; font-weight: 600; padding: 29px 0 25px; text-decoration: none; }.host-nav a.active { border-bottom: 2px solid #e2743e; color: #174b35; }.host-account { align-items: center; display: flex; gap: 9px; }.avatar { align-items: center; background: #dcebdd; border-radius: 50%; color: #35744a; display: flex; font-size: 10px; font-weight: 700; height: 32px; justify-content: center; width: 32px; }.host-name { color: #174b35; font-size: 11px; font-weight: 700; }.host-account button { background: transparent; border: 0; color: #99a59d; cursor: pointer; font: inherit; font-size: 10px; margin-left: 10px; padding: 0; }.host-shell { margin: 0 auto; max-width: 1240px; padding: 49px 38px 75px; }.page-heading { align-items: end; display: flex; justify-content: space-between; }.back-link { color: #e2743e; display: block; font-size: 10px; font-weight: 700; margin-bottom: 22px; text-decoration: none; }.eyebrow { color: #e2743e; display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; }.page-heading h1 { color: #174b35; font-family: 'Playfair Display', serif; font-size: clamp(42px, 5vw, 58px); letter-spacing: -2px; margin: 13px 0 8px; }.page-heading p { color: #849087; font-size: 12px; margin: 0; }.primary-button { align-items: center; background: #e2743e; border: 0; border-radius: 7px; color: #fff; display: flex; font-size: 11px; font-weight: 700; gap: 7px; padding: 12px 15px; text-decoration: none; }.toolbar { align-items: center; display: flex; gap: 12px; margin: 38px 0 24px; }.search-box { align-items: center; background: #fff; border: 1px solid #e5ebe4; border-radius: 7px; display: flex; flex: 1; gap: 8px; padding: 0 12px; }.search-box ion-icon { color: #e2743e; }.search-box input, .toolbar select { appearance: none; background: #fff; border: 0; color: #174b35; font: inherit; font-size: 11px; outline: 0; padding: 12px 0; }.toolbar select { border: 1px solid #e5ebe4; border-radius: 7px; padding: 12px 32px 12px 12px; }.notice { background: #fff4ed; border-radius: 6px; color: #c26439; font-size: 10px; margin: -7px 0 18px; padding: 10px 12px; }.error-notice { background: #fff0e8; color: #a4472a; }.data-message { color: #849087; font-size: 12px; margin: 18px 0; }.space-grid { display: grid; gap: 20px; grid-template-columns: repeat(2, 1fr); }.space-card { background: #fff; border: 1px solid #e5ebe4; border-radius: 11px; cursor: pointer; overflow: visible; position: relative; transition: box-shadow .2s, border-color .2s; }.space-card.focused-space { animation: dashboard-listing-highlight 1.05s ease-in-out 3; border-color: #e2743e; box-shadow: 0 0 0 3px #e2743e54; z-index: 1; }.space-photo { background-position: center; background-size: cover; border-radius: 10px 10px 0 0; height: 210px; overflow: hidden; padding: 13px; position: relative; }.status-badge { align-items: center; background: #fff; border-radius: 4px; color: #35744a; display: inline-flex; font-size: 9px; font-weight: 700; gap: 5px; padding: 6px 8px; }.status-badge i { background: #4b9b61; border-radius: 50%; height: 7px; width: 7px; }.status-badge.draft { color: #8a6a37; }.status-badge.draft i { background: #c6a45e; }.space-body { padding: 18px; }.space-title { align-items: start; display: flex; justify-content: space-between; }.space-title h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 21px; margin: 0 0 5px; }.space-title span { color: #89968d; display: flex; font-size: 9px; gap: 4px; }.space-title ion-icon { color: #e2743e; font-size: 13px; }.space-title strong { color: #4b9b61; font-size: 10px; }.space-stats { border-bottom: 1px solid #edf1ec; border-top: 1px solid #edf1ec; display: grid; grid-template-columns: repeat(3, 1fr); margin: 17px 0 14px; padding: 13px 0; }.space-stats span { display: flex; flex-direction: column; gap: 4px; }.space-stats small { color: #89968d; font-size: 8px; }.space-stats b { color: #174b35; font-size: 11px; }.space-actions { display: flex; gap: 8px; }.space-actions button { background: #e2743e; border: 1px solid transparent; border-radius: 5px; color: #fff; cursor: pointer; flex: 1; font-size: 10px; font-weight: 700; padding: 9px 6px; }.space-actions .outline-button { background: transparent; border-color: #e2743e; color: #e2743e; }.space-actions .delete-button { background: transparent; border-color: #e5ebe4; color: #a4472a; }.space-actions button:disabled { cursor: wait; opacity: .6; }.empty-state { color: #89968d; padding: 55px 20px; text-align: center; }.empty-state ion-icon { color: #e2743e; font-size: 28px; }.empty-state h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 24px; margin: 12px 0 5px; }.empty-state p { font-size: 11px; }.empty-state .primary-button { margin: 18px auto 0; width: fit-content; }.space-card { cursor: pointer; }
@keyframes dashboard-listing-highlight {
  0%, 100% { box-shadow: 0 0 0 3px #e2743e54, 0 12px 24px #174b3530; transform: scale(1); }
  50% { box-shadow: 0 0 0 8px #e2743e30, 0 18px 34px #174b3540; transform: scale(1.015); }
}
.delete-backdrop { align-items: center; background: rgba(15, 38, 27, .58); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 30; }
.delete-dialog { background: #fff; border: 1px solid #f0dfd8; border-radius: 14px; box-shadow: 0 18px 50px rgba(23, 75, 53, .24); max-width: 430px; padding: 28px; text-align: center; width: 100%; }
.delete-dialog-icon { align-items: center; background: #fff0e8; border-radius: 50%; color: #a4472a; display: inline-flex; font-size: 23px; height: 48px; justify-content: center; margin-bottom: 14px; width: 48px; }
.delete-dialog h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 24px; margin: 0 0 9px; }
.delete-dialog > p { color: #78877e; font-size: 11px; line-height: 1.6; margin: 0; }
.delete-dialog > p strong { color: #174b35; }
.delete-dialog-actions { display: flex; gap: 10px; justify-content: center; margin-top: 23px; }
.delete-dialog-actions button { border: 1px solid transparent; border-radius: 6px; cursor: pointer; flex: 1; font: inherit; font-size: 10px; font-weight: 700; padding: 11px 12px; }
.cancel-delete-button { background: #f3f6f1; color: #587065; }
.confirm-delete-button { background: #a4472a; color: #fff; }
.delete-dialog-actions button:disabled { cursor: wait; opacity: .65; }
.delete-error { background: #fff0e8; border-radius: 6px; color: #a4472a !important; margin-top: 13px !important; padding: 10px; }
.delete-confirm-enter-active, .delete-confirm-leave-active { transition: background-color .18s ease; }
.delete-confirm-enter-active .delete-dialog, .delete-confirm-leave-active .delete-dialog { transition: opacity .18s ease, transform .18s ease; }
.delete-confirm-enter-from, .delete-confirm-leave-to { background-color: rgba(15, 38, 27, 0); }
.delete-confirm-enter-from .delete-dialog, .delete-confirm-leave-to .delete-dialog { opacity: 0; transform: translateY(10px) scale(.98); }
.preview-backdrop { align-items: center; background: rgba(15, 38, 27, .64); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 20; }
.preview-dialog { background: #fff; border: 1px solid #dce8dc; border-radius: 12px; box-shadow: 0 18px 50px rgba(23, 75, 53, .24); max-height: calc(100vh - 40px); max-width: 760px; overflow-x: hidden; overflow-y: auto; position: relative; scrollbar-width: none; -ms-overflow-style: none; width: 100%; }
.preview-dialog::-webkit-scrollbar { display: none; }
.preview-enter-active, .preview-leave-active { transition: background-color .22s ease; }
.preview-enter-active .preview-dialog, .preview-leave-active .preview-dialog { transition: opacity .22s ease, transform .22s cubic-bezier(.2,.8,.2,1); }
.preview-enter-from, .preview-leave-to { background-color: rgba(15, 38, 27, 0); }
.preview-enter-from .preview-dialog, .preview-leave-to .preview-dialog { opacity: 0; transform: translateY(14px) scale(.98); }
.preview-message { color: #587065; font-size: 12px; padding: 30px; text-align: center; }
.preview-message p { margin: 0; }
.preview-close { align-items: center; background: rgba(255,255,255,.94); border: 0; border-radius: 50%; color: #174b35; cursor: pointer; display: flex; font-size: 23px; height: 34px; justify-content: center; position: absolute; right: 14px; top: 14px; width: 34px; z-index: 2; }
.preview-cover { background-position: center; background-size: cover; height: 190px; position: relative; }
.preview-status { background: #fff; border-radius: 5px; color: #35744a; font-size: 9px; font-weight: 700; left: 14px; padding: 7px 9px; position: absolute; top: 14px; }
.preview-content { padding: 18px 20px 24px; }
.preview-note { background: #eef6ee; border-radius: 6px; color: #35744a; font-size: 10px; font-weight: 600; margin: 0 0 15px; padding: 10px 12px; }
.preview-heading { align-items: start; display: flex; justify-content: space-between; }
.preview-heading h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 25px; margin: 6px 0; }
.preview-heading p { color: #829088; font-size: 10px; margin: 0; }
.preview-heading p ion-icon { color: #e2743e; vertical-align: middle; }
.preview-heading > strong { color: #174b35; font-size: 14px; white-space: nowrap; }
.preview-heading > strong small { color: #89968d; font-size: 9px; font-weight: 400; }
.preview-description { color: #829088; font-size: 11px; line-height: 1.5; margin: 14px 0; }
@media (max-width: 900px) { .host-nav { gap: 16px; }.space-grid { grid-template-columns: 1fr; } }
@media (max-width: 620px) { .host-header { height: 70px; padding: 0 18px; }.host-nav { display: none; }.host-name, .host-account a { display: none; }.host-shell { padding: 38px 18px 55px; }.page-heading { align-items: start; flex-direction: column; gap: 22px; }.page-heading .primary-button { align-self: stretch; justify-content: center; }.toolbar { align-items: stretch; flex-direction: column; }.toolbar select { width: 100%; }.space-actions { flex-wrap: wrap; }.space-actions button { min-width: calc(50% - 4px); }.preview-backdrop { align-items: end; padding: 0; }.preview-dialog { border-radius: 14px 14px 0 0; max-height: 94vh; }.preview-cover { height: 150px; }.preview-content { padding: 15px 14px 22px; }.preview-heading { gap: 10px; }.delete-dialog { padding: 23px 18px; }.delete-dialog-actions { flex-direction: column-reverse; } }
@media (prefers-reduced-motion: reduce) { .preview-enter-active, .preview-leave-active, .preview-enter-active .preview-dialog, .preview-leave-active .preview-dialog, .delete-confirm-enter-active, .delete-confirm-leave-active, .delete-confirm-enter-active .delete-dialog, .delete-confirm-leave-active .delete-dialog { transition: none; } }
@media (prefers-reduced-motion: reduce) { .space-card.focused-space { animation: none; box-shadow: 0 0 0 4px #e2743e80, 0 12px 24px #174b3530; } }
</style>
