<template>
  <ion-page>
    <ion-content :fullscreen="true" class="host-content">
      <header class="host-header">
        <a class="brand" href="/home" aria-label="Casa home"><img src="/casa-logo.png" alt="" class="brand-mark" /><span>casa<span class="brand-dot">.</span></span></a>
        <nav class="host-nav" aria-label="Host navigation"><a href="/host">Dashboard</a><a href="/host/spaces">My spaces</a><a class="active" href="/host/requests">Requests <span v-if="pendingCount" class="nav-count">{{ pendingCount }}</span></a></nav>
        <div class="host-account"><span class="avatar">{{ initials }}</span><span class="host-name">{{ displayName }}</span><button type="button" aria-label="Log out" @click="logout">Log out</button></div>
      </header>
      <main class="host-shell">
        <div class="page-heading"><div><a class="back-link" href="/host">← Dashboard</a><span class="eyebrow">BOOKING INBOX</span><h1>Requests.</h1><p>Review potential residents and find the right fit for your spaces.</p></div><span class="pending-summary"><strong>{{ pendingCount }}</strong> pending review</span></div>
        <div class="request-toolbar"><div class="tabs" role="tablist"><button v-for="tab in tabs" :key="tab.value" :class="{ active: selectedTab === tab.value }" type="button" role="tab" :aria-selected="selectedTab === tab.value" @click="selectedTab = tab.value">{{ tab.label }} <span v-if="tab.count">{{ tab.count }}</span></button></div><select v-model="spaceFilter" aria-label="Filter requests by space"><option value="all">All spaces</option><option v-for="space in requestSpaces" :key="space" :value="space">{{ space }}</option></select></div>
        <p v-if="notice" class="notice" role="status">{{ notice }}</p>
        <p v-if="errorMessage" class="request-error" role="alert">{{ errorMessage }}</p>
        <p v-if="isLoading" class="request-loading" role="status">Loading booking requests…</p>
        <section class="request-list" aria-label="Booking requests">
          <article v-for="request in filteredRequests" :key="request.id" class="request-card">
            <div class="request-top"><span class="request-avatar">{{ request.initials }}</span><div class="request-person"><h2>{{ request.name }}</h2><span>Requested {{ request.requested }}</span></div><span :class="['request-status', request.status]">{{ request.status === 'pending' ? 'Pending review' : request.status === 'approved' ? 'Approved' : request.status === 'completed' ? 'Completed' : 'Declined' }}</span></div>
            <div class="request-info"><div><small>Interested in</small><strong>{{ request.space }} · {{ request.listing }}</strong></div><div><small>Move-in date</small><strong>{{ request.moveIn }}</strong></div><div><small>Monthly rent</small><strong>₱{{ request.price.toLocaleString() }}</strong></div><div><small>Contact</small><a :href="`mailto:${request.email}`">{{ request.email }}</a></div></div>
            <p v-if="request.message" class="message">“{{ request.message }}”</p>
            <div v-if="request.status === 'pending'" class="request-actions"><button class="approve" type="button" :disabled="updatingRequestId === request.id" @click="updateRequest(request, 'approved')"><ion-icon :icon="checkmarkOutline" /> {{ updatingRequestId === request.id ? 'Saving…' : 'Approve request' }}</button><button class="decline" type="button" :disabled="updatingRequestId === request.id" @click="updateRequest(request, 'declined')">{{ updatingRequestId === request.id ? 'Saving…' : 'Decline' }}</button></div><div v-else-if="request.status === 'approved'" class="request-actions"><button class="decline" type="button" :disabled="updatingRequestId === request.id" @click="endTenancy(request)">{{ updatingRequestId === request.id ? 'Saving…' : 'End tenancy' }}</button></div><div v-else class="resolved-note"><ion-icon :icon="checkmarkOutline" /> {{ request.status === 'completed' ? 'This tenancy has ended.' : 'This request was declined.' }}</div>
          </article>
        </section>
        <div v-if="!isLoading && !errorMessage && filteredRequests.length === 0" class="empty-state"><ion-icon :icon="checkmarkOutline" /><h2>No requests here</h2><p>Try another filter to see more booking activity.</p></div>
      </main>
      <div v-if="pendingEndTenancy" class="end-tenancy-backdrop" @click.self="cancelEndTenancy">
        <section class="end-tenancy-dialog" role="alertdialog" aria-modal="true" aria-labelledby="end-tenancy-title" aria-describedby="end-tenancy-description">
          <span class="end-tenancy-icon" aria-hidden="true">!</span>
          <h2 id="end-tenancy-title">End this tenancy?</h2>
          <p id="end-tenancy-description">
            This will end <strong>{{ pendingEndTenancy.name }}</strong>'s tenancy at
            <strong>{{ pendingEndTenancy.listing }}</strong> and release {{ pendingEndTenancy.space }} for booking.
            The booking record will remain in resolved history until the listing is deleted.
          </p>
          <p v-if="errorMessage" class="request-error" role="alert">{{ errorMessage }}</p>
          <div class="end-tenancy-actions">
            <button type="button" class="cancel-end-tenancy" :disabled="updatingRequestId !== null" @click="cancelEndTenancy">Keep tenancy</button>
            <button type="button" class="confirm-end-tenancy" :disabled="updatingRequestId === pendingEndTenancy.id" @click="confirmEndTenancy">
              {{ updatingRequestId === pendingEndTenancy.id ? 'Ending…' : 'End tenancy' }}
            </button>
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { checkmarkOutline } from 'ionicons/icons';
import { useLogout } from '../composables/useLogout';
import { useAuthUser } from '../composables/useAuthUser';
import { getSupabaseClient } from '../lib/supabase';

type RequestStatus = 'pending' | 'approved' | 'declined' | 'completed';
type RequestTab = 'all' | 'pending' | 'resolved';
type BookingRequest = {
  id: number;
  listingId: number;
  roomId: number;
  bedspaceId: number | null;
  name: string;
  initials: string;
  email: string;
  requested: string;
  listing: string;
  space: string;
  moveIn: string;
  price: number;
  message: string;
  status: RequestStatus;
};
type RequestBookingRow = {
  id: number;
  listing_id: number;
  room_id: number | null;
  bedspace_id: number | null;
  tenant_name: string | null;
  tenant_email: string | null;
  move_in_date: string | null;
  message: string | null;
  amount: number | null;
  request_status: string;
  created_at: string;
};
type RequestListingRow = {
  id: number;
  name: string;
  type: string;
  floors: Array<{ rooms: Array<{ id: number; name: string; monthly_rent: number | null; bedspaces: Array<{ id: number; name: string; price: number }> }> }>;
};
const selectedTab = ref<RequestTab>('all');
const { logout } = useLogout();
const { user } = useAuthUser();
const displayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'Host');
const initials = computed(() => displayName.value.split(/\s+/).filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase());
const spaceFilter = ref('all');
const notice = ref('');
const requests = ref<BookingRequest[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');
const updatingRequestId = ref<number | null>(null);
const pendingEndTenancy = ref<BookingRequest | null>(null);
const tabs = computed(() => [{ label: 'All requests', value: 'all' as const, count: requests.value.length }, { label: 'Pending', value: 'pending' as const, count: pendingCount.value }, { label: 'Resolved', value: 'resolved' as const, count: requests.value.filter((request) => request.status !== 'pending').length }]);
const pendingCount = computed(() => requests.value.filter((request) => request.status === 'pending').length);
const requestSpaces = computed(() => [...new Set(requests.value.map((request) => request.listing))].sort());
const filteredRequests = computed(() => requests.value.filter((request) =>
  (selectedTab.value === 'all' || (selectedTab.value === 'resolved' ? request.status !== 'pending' : request.status === selectedTab.value))
  && (spaceFilter.value === 'all' || request.listing === spaceFilter.value)));

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message;
  return 'An unexpected error occurred while loading booking requests.';
}
function formatDate(value: string | null): string {
  if (!value) return 'Not provided';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatRequestedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'date unavailable' : date.toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });
}
function initialsFor(name: string): string {
  return name.split(/\\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'R';
}
function mapRequest(booking: RequestBookingRow, listing: RequestListingRow | undefined): BookingRequest {
  if (!listing) throw new Error(`The listing for booking request ${booking.id} could not be loaded.`);
  const room = listing.floors.flatMap((floor) => floor.rooms).find((candidate) => candidate.id === booking.room_id);
  if (!room) throw new Error(`The room for booking request ${booking.id} could not be loaded.`);
  const bed = room.bedspaces.find((candidate) => candidate.id === booking.bedspace_id);
  const name = booking.tenant_name?.trim() || booking.tenant_email || 'Resident';
  const price = Number(booking.amount ?? (bed?.price ?? room.monthly_rent ?? 0));
  if (!Number.isFinite(price)) throw new Error(`The rent for booking request ${booking.id} is invalid.`);
  const status = booking.request_status;
  if (status !== 'pending' && status !== 'approved' && status !== 'declined' && status !== 'completed') {
    throw new Error(`Booking request ${booking.id} has an unsupported status.`);
  }
  return {
    id: booking.id,
    listingId: booking.listing_id,
    roomId: booking.room_id ?? 0,
    bedspaceId: booking.bedspace_id,
    name,
    initials: initialsFor(name),
    email: booking.tenant_email || 'No email provided',
    requested: formatRequestedAt(booking.created_at),
    listing: listing.name,
    space: bed ? `${bed.name} · ${room.name}` : room.name,
    moveIn: formatDate(booking.move_in_date),
    price,
    message: booking.message?.trim() ?? '',
    status,
  };
}
async function loadRequests() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const client = getSupabaseClient();
    const { data: { user: host }, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!host) throw new Error('Sign in to view booking requests.');
    const { data: listingData, error: listingError } = await client.from('spaces').select(`
      id, name, type, floors(rooms(id, name, monthly_rent, bedspaces(id, name, price)))
    `).eq('host_id', host.id);
    if (listingError) throw listingError;
    const listings = (listingData ?? []) as RequestListingRow[];
    const listingIds = listings.map((listing) => listing.id);
    if (!listingIds.length) {
      requests.value = [];
      return;
    }
    const { data: bookingData, error: bookingError } = await client.from('bookings')
      .select('id, listing_id, room_id, bedspace_id, tenant_name, tenant_email, move_in_date, message, amount, request_status, created_at')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false });
    if (bookingError) throw bookingError;
    const bookings = (bookingData ?? []) as RequestBookingRow[];
    const listingsById = new Map(listings.map((listing) => [listing.id, listing]));
    requests.value = bookings.map((booking) => mapRequest(booking, listingsById.get(booking.listing_id)));
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
    requests.value = [];
  } finally {
    isLoading.value = false;
  }
}
async function updateRequest(request: BookingRequest, status: Extract<RequestStatus, 'approved' | 'declined'>) {
  if (updatingRequestId.value !== null) return;
  updatingRequestId.value = request.id;
  errorMessage.value = '';
  notice.value = '';
  try {
    const client = getSupabaseClient();
    const { error } = await client.rpc('update_host_booking_request', {
      p_booking_id: request.id,
      p_request_status: status,
    });
    if (error) throw error;
    request.status = status;
    notice.value = `${request.name}'s request has been ${status}.`;
    window.dispatchEvent(new Event('casa:booking-completed'));
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    updatingRequestId.value = null;
  }
}
function endTenancy(request: BookingRequest) {
  errorMessage.value = '';
  pendingEndTenancy.value = request;
}
function cancelEndTenancy() {
  if (updatingRequestId.value !== null) return;
  pendingEndTenancy.value = null;
  errorMessage.value = '';
}
async function confirmEndTenancy() {
  const request = pendingEndTenancy.value;
  if (!request || updatingRequestId.value !== null) return;
  updatingRequestId.value = request.id;
  errorMessage.value = '';
  notice.value = '';
  try {
    const client = getSupabaseClient();
    const { error } = await client.rpc('end_host_tenancy', { p_booking_id: request.id });
    if (error) throw error;

    const { data: updatedBooking, error: verificationError } = await client.from('bookings')
      .select('request_status')
      .eq('id', request.id)
      .single();
    if (verificationError) throw verificationError;
    if (updatedBooking.request_status !== 'completed') {
      throw new Error(`The booking is still marked ${updatedBooking.request_status}. Its status was not updated.`);
    }

    request.status = 'completed';
    pendingEndTenancy.value = null;
    notice.value = `${request.name}'s tenancy has ended. The space is available again.`;
    window.dispatchEvent(new Event('casa:booking-completed'));
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    updatingRequestId.value = null;
  }
}
onMounted(() => { void loadRequests(); });
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
:global(body) { background: #f7f8f4; color: #174b35; font-family: 'DM Sans', sans-serif; } :global(*) { box-sizing: border-box; }.host-content { --background: #f7f8f4; }.host-header { align-items: center; background: #fff; border-bottom: 1px solid #e5ebe4; display: flex; height: 78px; justify-content: space-between; padding: 0 clamp(22px, 5vw, 74px); }.brand { align-items: center; color: #174b35; display: flex; font-size: 26px; font-weight: 700; gap: 8px; letter-spacing: -1.5px; text-decoration: none; }.brand-mark { height: 35px; width: 35px; }.brand-dot { color: #e2743e; }.host-nav { display: flex; gap: 28px; }.host-nav a { color: #849087; font-size: 11px; font-weight: 600; padding: 29px 0 25px; text-decoration: none; }.host-nav a.active { border-bottom: 2px solid #e2743e; color: #174b35; }.nav-count { background: #e2743e; border-radius: 10px; color: #fff; font-size: 8px; margin-left: 3px; padding: 2px 5px; }.host-account { align-items: center; display: flex; gap: 9px; }.avatar { align-items: center; background: #dcebdd; border-radius: 50%; color: #35744a; display: flex; font-size: 10px; font-weight: 700; height: 32px; justify-content: center; width: 32px; }.host-name { color: #174b35; font-size: 11px; font-weight: 700; }.host-account button { background: transparent; border: 0; color: #99a59d; cursor: pointer; font: inherit; font-size: 10px; margin-left: 10px; padding: 0; }.host-shell { margin: 0 auto; max-width: 1030px; padding: 49px 32px 75px; }.page-heading { align-items: end; display: flex; justify-content: space-between; }.back-link { color: #e2743e; display: block; font-size: 10px; font-weight: 700; margin-bottom: 22px; text-decoration: none; }.eyebrow { color: #e2743e; display: block; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; }.page-heading h1 { color: #174b35; font-family: 'Playfair Display', serif; font-size: clamp(42px, 5vw, 58px); letter-spacing: -2px; margin: 13px 0 8px; }.page-heading p { color: #849087; font-size: 12px; margin: 0; }.pending-summary { color: #89968d; font-size: 11px; }.pending-summary strong { color: #e2743e; font-size: 24px; margin-right: 5px; }.request-toolbar { align-items: center; border-bottom: 1px solid #dfe8de; display: flex; justify-content: space-between; margin: 38px 0 22px; }.tabs { display: flex; gap: 22px; }.tabs button { background: transparent; color: #89968d; font-size: 10px; font-weight: 700; padding: 0 0 13px; }.tabs button.active { border-bottom: 2px solid #e2743e; color: #174b35; }.tabs span { background: #e5f1e4; border-radius: 10px; color: #35744a; font-size: 8px; margin-left: 3px; padding: 2px 5px; }.request-toolbar select { background: #fff; border: 1px solid #e5ebe4; border-radius: 6px; color: #174b35; font: inherit; font-size: 10px; margin-bottom: 8px; padding: 9px; }.notice { background: #fff4ed; border-radius: 6px; color: #c26439; font-size: 10px; margin: -7px 0 18px; padding: 10px 12px; }.request-list { display: flex; flex-direction: column; gap: 14px; }.request-card { background: #fff; border: 1px solid #e5ebe4; border-radius: 11px; padding: 20px 22px; }.request-top { align-items: center; display: flex; gap: 12px; }.request-avatar { align-items: center; background: #fff0e8; border-radius: 50%; color: #c26439; display: flex; flex: 0 0 42px; font-size: 11px; font-weight: 700; height: 42px; justify-content: center; width: 42px; }.request-person { display: flex; flex: 1; flex-direction: column; gap: 4px; }.request-person h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 19px; margin: 0; }.request-person span { color: #89968d; font-size: 9px; }.request-status { border-radius: 12px; font-size: 9px; font-weight: 700; padding: 6px 9px; }.request-status.pending { background: #fff0e8; color: #c26439; }.request-status.approved, .request-status.completed { background: #e5f1e4; color: #35744a; }.request-status.declined { background: #eef1ed; color: #89968d; }.request-info { border-bottom: 1px solid #edf1ec; border-top: 1px solid #edf1ec; display: grid; grid-template-columns: repeat(3, 1fr); margin: 18px 0 14px; padding: 13px 0; }.request-info div { display: flex; flex-direction: column; gap: 4px; }.request-info small { color: #89968d; font-size: 8px; }.request-info strong { color: #174b35; font-size: 11px; }.message { color: #718177; font-size: 11px; line-height: 1.5; margin: 0; }.request-actions { align-items: center; display: flex; gap: 9px; margin-top: 18px; }.request-actions button { border-radius: 5px; font-size: 10px; font-weight: 700; padding: 9px 13px; }.approve { background: #4b9b61; color: #fff; }.decline { background: #fff0e8; color: #c26439; }.view-profile { background: transparent; color: #e2743e; margin-left: auto; }.resolved-note { align-items: center; color: #4b9b61; display: flex; font-size: 10px; gap: 5px; margin-top: 16px; }.empty-state { color: #89968d; padding: 55px 20px; text-align: center; }.empty-state ion-icon { color: #4b9b61; font-size: 28px; }.empty-state h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 24px; margin: 12px 0 5px; }.empty-state p { font-size: 11px; }
.end-tenancy-backdrop { align-items: center; background: rgba(15, 38, 27, .58); display: flex; inset: 0; justify-content: center; padding: 20px; position: fixed; z-index: 40; }
.end-tenancy-dialog { background: #fff; border: 1px solid #f0dfd8; border-radius: 14px; box-shadow: 0 18px 50px rgba(23, 75, 53, .24); max-width: 430px; padding: 28px; text-align: center; width: 100%; }
.end-tenancy-icon { align-items: center; background: #fff0e8; border-radius: 50%; color: #a4472a; display: inline-flex; font-size: 22px; font-weight: 700; height: 48px; justify-content: center; margin-bottom: 14px; width: 48px; }
.end-tenancy-dialog h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 24px; margin: 0 0 9px; }
.end-tenancy-dialog p { color: #718177; font-size: 12px; line-height: 1.6; margin: 0 0 18px; }
.end-tenancy-dialog p strong { color: #174b35; }
.end-tenancy-actions { display: flex; gap: 9px; justify-content: center; }
.end-tenancy-actions button { border-radius: 6px; cursor: pointer; font: inherit; font-size: 11px; font-weight: 700; padding: 11px 15px; }
.cancel-end-tenancy { background: #fff; border: 1px solid #e5ebe4; color: #718177; }
.confirm-end-tenancy { background: #a4472a; border: 1px solid #a4472a; color: #fff; }
.end-tenancy-actions button:disabled { cursor: wait; opacity: .6; }
@media (max-width: 700px) { .host-header { height: 70px; padding: 0 18px; }.host-nav { display: none; }.host-name, .host-account a { display: none; }.host-shell { padding: 38px 18px 55px; }.page-heading { align-items: start; flex-direction: column; gap: 22px; }.request-toolbar { align-items: stretch; flex-direction: column; gap: 12px; }.tabs { gap: 14px; overflow-x: auto; }.request-toolbar select { margin: 0; }.request-card { padding: 17px 15px; }.request-status { margin-left: auto; }.request-info { gap: 10px; }.request-info strong { font-size: 10px; }.request-actions { align-items: stretch; flex-wrap: wrap; }.request-actions button { flex: 1; }.view-profile { flex: 0 0 100% !important; margin-left: 0; } }
</style>
