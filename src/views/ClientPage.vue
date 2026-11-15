<template>
  <ion-page>
    <ion-content :fullscreen="true" class="client-content">
      <header class="client-header" :class="{ 'page-enter': shouldAnimate }">
        <a class="brand" href="/home" aria-label="Casa home"><img src="/casa-logo.png" alt="" class="brand-mark" /><span>casa<span class="brand-dot">.</span></span></a>
        <nav class="client-nav" aria-label="Client navigation">
          <a href="/listings">Browse spaces</a>
          <a class="active" href="/client">My bookings</a>
        </nav>
        <div class="client-account"><span class="avatar">{{ initials }}</span><span class="client-name">{{ displayName }}</span><button type="button" aria-label="Log out" @click="logout">Log out</button></div>
      </header>

      <main class="client-shell" :class="{ 'page-enter': shouldAnimate }">
        <section class="welcome-row">
          <div><span class="eyebrow">YOUR CASA ACCOUNT</span><h1>My bookings<span class="heading-dot">.</span></h1><p>Keep track of your requests and upcoming stays.</p></div>
          <div class="client-cta-group">
            <a class="browse-button" href="/listings"><ion-icon :icon="searchOutline" /> Find a space</a>
            <button ref="listSpaceButton" class="list-space-button" type="button" @click="openListSpaceNotice">List your space</button>
          </div>
        </section>

        <section class="summary-grid" aria-label="Booking summary">
          <article><span class="summary-icon">⌂</span><div><span>Total bookings</span><strong>{{ isLoading || errorMessage ? '—' : bookings.length }}</strong></div></article>
          <article><span class="summary-icon pending-icon">◷</span><div><span>Awaiting host</span><strong>{{ isLoading || errorMessage ? '—' : pendingCount }}</strong></div></article>
          <article><span class="summary-icon approved-icon">✓</span><div><span>Approved stays</span><strong>{{ isLoading || errorMessage ? '—' : approvedCount }}</strong></div></article>
        </section>

        <section class="bookings-section" aria-labelledby="bookings-title">
          <div class="section-heading">
            <div><span class="eyebrow">BOOKING ACTIVITY</span><h2 id="bookings-title">Your stays</h2></div>
            <div class="tabs" role="tablist" aria-label="Filter bookings">
              <button v-for="tab in tabs" :key="tab.value" type="button" role="tab" :aria-selected="selectedTab === tab.value" :class="{ active: selectedTab === tab.value }" @click="selectedTab = tab.value">
                {{ tab.label }} <span>{{ tab.count }}</span>
              </button>
            </div>
          </div>

          <p v-if="errorMessage" class="data-message error-message" role="alert">
            {{ errorMessage }}
            <button type="button" @click="loadBookings">Try again</button>
          </p>
          <p v-if="notice" class="data-message success-message" role="status">{{ notice }}</p>
          <p v-if="isLoading" class="data-message" role="status">Loading your bookings…</p>
          <div v-else-if="!errorMessage && filteredBookings.length" class="booking-list">
            <article v-for="(booking, index) in filteredBookings" :key="booking.id" class="booking-card" :class="{ 'booking-card-highlight': highlightedBookingId === booking.id }" :style="{ animationDelay: `${0.56 + index * 0.1}s` }">
              <div class="booking-card-top">
                <div>
                  <span class="booking-reference">BOOKING #{{ booking.id }} · {{ booking.requestedAt }}</span>
                  <h3>{{ booking.listingName }}</h3>
                  <p class="listing-location">{{ booking.location }}</p>
                </div>
                <span class="request-status" :class="[booking.status, booking.refundStatus]">{{ booking.status === 'cancelled' && booking.refundStatus === 'pending' ? 'Refund pending' : booking.status === 'cancelled' && booking.refundStatus === 'refunded' ? 'Refunded' : booking.status === 'cancelled' && booking.refundStatus === 'rejected' ? 'Refund denied' : statusLabel(booking.status) }}</span>
              </div>
              <div class="booking-details">
                <div><small>Space</small><strong>{{ booking.spaceName }}</strong></div>
                <div><small>Move-in date</small><strong>{{ booking.moveInDate }}</strong></div>
                <div><small>Monthly rent</small><strong>{{ formatAmount(booking.amount) }}</strong></div>
                <div><small>Payment</small><strong class="payment-status" :class="booking.paymentStatus">{{ paymentLabel(booking.paymentStatus) }}</strong></div>
              </div>
              <p v-if="booking.status === 'pending'" class="booking-note">Your request is waiting for the host to review it.</p>
              <p v-else-if="booking.status === 'approved'" class="booking-note approved-note">Your stay is approved. Contact the host if you need to coordinate your move-in.</p>
              <p v-else-if="booking.status === 'cancelled' && booking.refundStatus === 'pending'" class="booking-note refund-note">Your refund request for {{ formatRefundAmount(booking.amount) }} is pending host approval.</p>
              <p v-else-if="booking.status === 'cancelled' && booking.refundStatus === 'refunded'" class="booking-note refund-note">Your refund of {{ formatRefundAmount(booking.amount) }} has been issued.</p>
              <p v-else-if="booking.status === 'cancelled' && booking.refundStatus === 'rejected'" class="booking-note refund-rejected-note">Your refund request was denied by the host. The payment remains unchanged.</p>
              <p v-else-if="booking.status === 'cancelled'" class="booking-note">You cancelled this request.</p>
              <p v-else-if="booking.status === 'declined'" class="booking-note">This request was declined by the host. You can browse other available spaces.</p>
              <p v-else class="booking-note">This stay has ended.</p>
              <section
                v-if="booking.status === 'approved' || booking.status === 'completed'"
                class="rating-panel"
                :aria-label="`${booking.rating === null ? 'Rate' : 'Edit your rating for'} ${booking.listingName}`"
              >
                <p class="rating-prompt">
                  {{ booking.rating === null ? 'How’s your stay going? Rate this listing.' : `Your rating: ${booking.rating} out of 5. Select stars to edit.` }}
                </p>
                <div class="rating-stars" role="radiogroup" :aria-label="`Choose a rating for ${booking.listingName}`">
                  <button
                    v-for="rating in ratingOptions"
                    :key="rating"
                    type="button"
                    role="radio"
                    :aria-label="`${rating} ${rating === 1 ? 'star' : 'stars'}`"
                    :aria-checked="(booking.ratingDraft ?? booking.rating) === rating"
                    :disabled="ratingSavingBookingId === booking.id"
                    @click="booking.ratingDraft = rating"
                  >
                    <ion-icon :icon="star" :class="{ 'star-filled': rating <= (booking.ratingDraft ?? booking.rating ?? 0) }" />
                  </button>
                </div>
                <button
                  type="button"
                  class="save-rating-button"
                  :disabled="booking.ratingDraft === null || booking.ratingDraft === booking.rating || ratingSavingBookingId === booking.id"
                  @click="saveRating(booking)"
                >
                  {{ ratingSavingBookingId === booking.id ? 'Saving…' : booking.rating === null ? 'Save rating' : 'Update rating' }}
                </button>
                <p v-if="ratingErrorBookingId === booking.id" class="rating-error" role="alert">{{ ratingErrorMessage }}</p>
              </section>
              <div v-if="booking.status === 'pending' || booking.status === 'approved'" class="booking-actions">
                <button type="button" class="end-booking-button" :disabled="updatingBookingId === booking.id" @click="confirmEndBooking(booking)">
                  {{ updatingBookingId === booking.id ? 'Updating…' : booking.status === 'pending' ? 'Cancel request' : 'End stay' }}
                </button>
              </div>
              <div v-else-if="booking.status === 'cancelled' && booking.paymentStatus === 'paid' && booking.amount !== null && booking.amount > 0 && booking.refundStatus === 'none'" class="booking-actions">
                <button type="button" class="request-refund-button" :disabled="updatingBookingId === booking.id" @click="openRefundDialog(booking)">
                  <ion-icon :icon="alertCircleOutline" /> Request refund
                </button>
              </div>
            </article>
          </div>
          <div v-else-if="!isLoading && !errorMessage" class="empty-state">
            <span class="empty-icon">⌂</span>
            <h2>{{ selectedTab === 'all' ? 'No bookings yet' : selectedTab === 'current' ? 'No active bookings' : 'No past bookings' }}</h2>
            <p>{{ selectedTab === 'all' ? 'When you request a space, you’ll find its status and details here.' : 'Your booking activity in this category will appear here.' }}</p>
            <a href="/listings" class="browse-button"><ion-icon :icon="searchOutline" /> Explore spaces</a>
          </div>
        </section>
      </main>
      <div v-if="bookingToEnd" class="confirmation-backdrop" @click.self="closeEndBooking">
        <section class="confirmation-dialog" role="alertdialog" aria-modal="true" aria-labelledby="end-booking-title" aria-describedby="end-booking-description">
          <span class="confirmation-icon" aria-hidden="true">!</span>
          <h2 id="end-booking-title">{{ bookingToEnd.status === 'pending' ? 'Cancel this request?' : 'End this stay early?' }}</h2>
          <p id="end-booking-description">
            <template v-if="bookingToEnd.status === 'pending'">
              This will cancel your request for <strong>{{ bookingToEnd.listingName }}</strong> and release the space.
            </template>
            <template v-else>
              This will end your approved stay at <strong>{{ bookingToEnd.listingName }}</strong> and release the space.
              If you have already paid, contact the host to arrange any refund.
            </template>
          </p>
          <div v-if="bookingToEnd.status === 'approved'" class="end-rating-prompt">
            <p class="rating-prompt">
              {{ bookingToEnd.rating === null ? 'Leave a rating before you end your stay? (optional)' : 'Change your rating before ending your stay? (optional)' }}
            </p>
            <div class="rating-stars" role="radiogroup" :aria-label="`Choose a rating for ${bookingToEnd.listingName}`">
              <button
                v-for="rating in ratingOptions"
                :key="rating"
                type="button"
                role="radio"
                :aria-label="`${rating} ${rating === 1 ? 'star' : 'stars'}`"
                :aria-checked="(bookingToEnd.ratingDraft ?? bookingToEnd.rating) === rating"
                :disabled="updatingBookingId === bookingToEnd.id"
                @click="bookingToEnd.ratingDraft = rating"
              >
                <ion-icon :icon="star" :class="{ 'star-filled': rating <= (bookingToEnd.ratingDraft ?? bookingToEnd.rating ?? 0) }" />
              </button>
            </div>
          </div>
          <p v-if="errorMessage" class="dialog-error" role="alert">{{ errorMessage }}</p>
          <div class="confirmation-actions">
            <button type="button" class="keep-booking-button" :disabled="updatingBookingId !== null" @click="closeEndBooking">Keep booking</button>
            <button type="button" class="confirm-end-button" :disabled="updatingBookingId === bookingToEnd.id" @click="endBooking">
              {{ updatingBookingId === bookingToEnd.id ? 'Updating…' : bookingToEnd.status === 'pending' ? 'Cancel request' : 'End stay' }}
            </button>
          </div>
        </section>
      </div>
      <div v-if="bookingToRefund" class="confirmation-backdrop" @click.self="closeRefundDialog">
        <section class="confirmation-dialog refund-dialog" role="dialog" aria-modal="true" aria-labelledby="refund-title" aria-describedby="refund-description">
          <span class="confirmation-icon refund-icon" aria-hidden="true"><ion-icon :icon="alertCircleOutline" /></span>
          <h2 id="refund-title">Request a refund?</h2>
          <p id="refund-description">Your refund request for <strong>{{ bookingToRefund.listingName }}</strong> will be sent to the host for review. The requested amount is prefilled from your booking.</p>
          <label class="refund-amount-label" for="refund-amount">Refund amount</label>
          <div class="refund-amount-field"><span>₱</span><input id="refund-amount" :value="bookingToRefund.amount ?? ''" type="number" readonly aria-readonly="true" /></div>
          <p v-if="refundError" class="dialog-error" role="alert">{{ refundError }}</p>
          <div class="confirmation-actions">
            <button type="button" class="keep-booking-button" :disabled="updatingBookingId !== null" @click="closeRefundDialog">Not now</button>
            <button type="button" class="confirm-refund-button" :disabled="updatingBookingId === bookingToRefund.id || bookingToRefund.amount === null" @click="requestRefund">
              {{ updatingBookingId === bookingToRefund.id ? 'Sending…' : 'Send refund request' }}
            </button>
          </div>
        </section>
      </div>
      <div v-if="confettiBookingId !== null" class="confetti-burst" aria-hidden="true">
        <span v-for="piece in confettiPieces" :key="piece" class="confetti-piece" :style="{ left: `${(piece * 37) % 101}%`, animationDelay: `${(piece % 6) * 0.06}s` }" />
      </div>
      <dialog v-if="showListSpaceNotice" ref="listSpaceDialog" class="list-space-dialog"
        aria-labelledby="list-space-title" aria-describedby="list-space-description"
        @click="closeListSpaceNoticeOnBackdrop" @close="handleListSpaceNoticeClose">
        <header class="list-space-dialog-header">
          <div>
            <span class="eyebrow">BECOME A HOST</span>
            <h2 id="list-space-title">Use a separate account</h2>
          </div>
          <button class="list-space-close" type="button" aria-label="Close notice" @click="closeListSpaceNotice">×</button>
        </header>
        <div class="list-space-dialog-content">
          <p id="list-space-description">Your client account can’t be used to list a space. To continue, sign up for a separate host account with a different email address.</p>
          <div class="list-space-dialog-actions">
            <button class="list-space-cancel" type="button" @click="closeListSpaceNotice">Not now</button>
            <a class="list-space-continue" href="/signup?role=landlord">Continue to sign up</a>
          </div>
        </div>
      </dialog>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onIonViewWillEnter } from '@ionic/vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { computed, nextTick, onUnmounted, ref } from 'vue';
import { alertCircleOutline, searchOutline, star } from 'ionicons/icons';
import { useAuthUser } from '../composables/useAuthUser';
import { useLogout } from '../composables/useLogout';
import { getSupabaseClient } from '../lib/supabase';

type BookingStatus = 'pending' | 'approved' | 'declined' | 'completed' | 'cancelled';
type BookingTab = 'all' | 'current' | 'past';
type RefundStatus = 'none' | 'pending' | 'refunded' | 'rejected';
type BookingRow = {
  id: number;
  listing_id: number;
  room_id: number | null;
  bedspace_id: number | null;
  payment_status: string;
  refund_status: string;
  request_status: string;
  move_in_date: string | null;
  amount: number | null;
  rating: number | null;
  created_at: string;
};
type BookingSpaceRow = {
  id: number;
  name: string;
  location: string;
  floors: Array<{ rooms: Array<{ id: number; name: string; bedspaces: Array<{ id: number; name: string }> }> }>;
};
type ClientBooking = {
  id: number;
  listingName: string;
  location: string;
  spaceName: string;
  moveInDate: string;
  requestedAt: string;
  amount: number | null;
  paymentStatus: string;
  refundStatus: RefundStatus;
  status: BookingStatus;
  rating: number | null;
  ratingDraft: number | null;
};

const { user } = useAuthUser();
const { logout } = useLogout();
const listSpaceButton = ref<HTMLButtonElement | null>(null);
const listSpaceDialog = ref<HTMLDialogElement | null>(null);
const showListSpaceNotice = ref(false);
const displayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'Client');
const initials = computed(() => displayName.value.split(/\s+/).filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase());
const bookings = ref<ClientBooking[]>([]);
const selectedTab = ref<BookingTab>('all');
const isLoading = ref(false);
const errorMessage = ref('');
const notice = ref('');
const bookingToEnd = ref<ClientBooking | null>(null);
const bookingToRefund = ref<ClientBooking | null>(null);
const refundError = ref('');
const updatingBookingId = ref<number | null>(null);
const ratingSavingBookingId = ref<number | null>(null);
const ratingErrorBookingId = ref<number | null>(null);
const ratingErrorMessage = ref('');
const confettiBookingId = ref<number | null>(null);
const ratingOptions = [1, 2, 3, 4, 5];
const confettiPieces = Array.from({ length: 28 }, (_, index) => index);
const shouldAnimate = ref(false);
const highlightedBookingId = ref<number | null>(null);
let highlightTimeout: ReturnType<typeof setTimeout> | undefined;
let confettiTimeout: ReturnType<typeof setTimeout> | undefined;
const pendingCount = computed(() => bookings.value.filter((booking) => booking.status === 'pending').length);
const approvedCount = computed(() => bookings.value.filter((booking) => booking.status === 'approved').length);
const tabs = computed(() => [
  { label: 'All', value: 'all' as const, count: bookings.value.length },
  { label: 'Current', value: 'current' as const, count: bookings.value.filter((booking) => booking.status === 'pending' || booking.status === 'approved').length },
  { label: 'Past', value: 'past' as const, count: bookings.value.filter((booking) => booking.status === 'declined' || booking.status === 'completed' || booking.status === 'cancelled').length },
]);
const filteredBookings = computed(() => bookings.value.filter((booking) => {
  if (selectedTab.value === 'current') return booking.status === 'pending' || booking.status === 'approved';
  if (selectedTab.value === 'past') return booking.status === 'declined' || booking.status === 'completed' || booking.status === 'cancelled';
  return true;
}));

function openListSpaceNotice() {
  showListSpaceNotice.value = true;
  void nextTick(() => listSpaceDialog.value?.showModal());
}

function closeListSpaceNotice() {
  listSpaceDialog.value?.close();
}

function closeListSpaceNoticeOnBackdrop(event: MouseEvent) {
  if (event.target === listSpaceDialog.value) closeListSpaceNotice();
}

function handleListSpaceNoticeClose() {
  showListSpaceNotice.value = false;
  listSpaceButton.value?.focus();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message;
  return 'An unexpected error occurred.';
}

function formatDate(value: string | null): string {
  if (!value) return 'Not provided';
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatRequestedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatAmount(value: number | null): string {
  if (value === null) return 'Not available';
  const amount = Number(value);
  return Number.isFinite(amount) ? `₱${amount.toLocaleString('en-PH')} / month` : 'Not available';
}

function formatRefundAmount(value: number | null): string {
  if (value === null) return 'the booking amount';
  const amount = Number(value);
  return Number.isFinite(amount) ? `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'the booking amount';
}

function statusLabel(status: BookingStatus): string {
  return status === 'pending' ? 'Pending review' : status === 'approved' ? 'Approved' : status === 'declined' ? 'Declined' : status === 'cancelled' ? 'Cancelled' : 'Completed';
}

function paymentLabel(status: string): string {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
}

function mapBooking(booking: BookingRow, listing: BookingSpaceRow | undefined): ClientBooking {
  const status = booking.request_status;
  if (status !== 'pending' && status !== 'approved' && status !== 'declined' && status !== 'completed' && status !== 'cancelled') {
    throw new Error(`Booking ${booking.id} has an unsupported status.`);
  }
  const rooms = listing?.floors.flatMap((floor) => floor.rooms) ?? [];
  const room = rooms.find((candidate) => candidate.id === booking.room_id);
  const bedspace = room?.bedspaces.find((candidate) => candidate.id === booking.bedspace_id);
  return {
    id: booking.id,
    listingName: listing?.name ?? 'Listing unavailable',
    location: listing?.location ?? 'The listing details are no longer available.',
    spaceName: bedspace ? `${bedspace.name} · ${room?.name}` : room?.name ?? 'Space details unavailable',
    moveInDate: formatDate(booking.move_in_date),
    requestedAt: formatRequestedAt(booking.created_at),
    amount: booking.amount,
    paymentStatus: booking.payment_status,
    refundStatus: booking.refund_status === 'pending' || booking.refund_status === 'refunded' || booking.refund_status === 'rejected' ? booking.refund_status : 'none',
    status,
    rating: booking.rating === null ? null : Number(booking.rating),
    ratingDraft: booking.rating === null ? null : Number(booking.rating),
  };
}

async function loadBookings() {
  isLoading.value = true;
  errorMessage.value = '';
  notice.value = '';
  try {
    const client = getSupabaseClient();
    const { data: { user: account }, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!account) throw new Error('Sign in to view your bookings.');

    const { data: bookingData, error: bookingError } = await client.from('bookings')
      .select('id, listing_id, room_id, bedspace_id, payment_status, refund_status, request_status, move_in_date, amount, rating, created_at')
      .eq('tenant_id', account.id)
      .order('created_at', { ascending: false });
    if (bookingError) throw bookingError;

    const bookingRows = (bookingData ?? []) as BookingRow[];
    const listingIds = [...new Set(bookingRows.map((booking) => booking.listing_id))];
    if (!listingIds.length) {
      bookings.value = [];
      return;
    }

    const { data: listingData, error: listingError } = await client.from('spaces').select(`
      id, name, location, floors(rooms(id, name, bedspaces(id, name)))
    `).in('id', listingIds);
    if (listingError) throw listingError;

    const listings = (listingData ?? []) as BookingSpaceRow[];
    const listingsById = new Map(listings.map((listing) => [listing.id, listing]));
    bookings.value = bookingRows.map((booking) => mapBooking(booking, listingsById.get(booking.listing_id)));
  } catch (error) {
    errorMessage.value = `Your bookings couldn’t be loaded: ${getErrorMessage(error)}`;
    bookings.value = [];
  } finally {
    isLoading.value = false;
  }
}

function openRefundDialog(booking: ClientBooking) {
  refundError.value = '';
  bookingToRefund.value = booking;
}

function closeRefundDialog() {
  if (updatingBookingId.value !== null) return;
  bookingToRefund.value = null;
  refundError.value = '';
}

async function requestRefund() {
  const booking = bookingToRefund.value;
  if (!booking || booking.amount === null || booking.refundStatus !== 'none' || updatingBookingId.value !== null) return;
  updatingBookingId.value = booking.id;
  refundError.value = '';
  try {
    const { error } = await getSupabaseClient().rpc('request_tenant_booking_refund', { p_booking_id: booking.id });
    if (error) throw error;
    booking.refundStatus = 'pending';
    bookingToRefund.value = null;
    notice.value = 'Your refund request has been sent to the host.';
    window.dispatchEvent(new Event('casa:booking-completed'));
  } catch (error) {
    refundError.value = `Your refund request couldn’t be sent: ${getErrorMessage(error)}`;
  } finally {
    updatingBookingId.value = null;
  }
}

async function saveRating(booking: ClientBooking) {
  const rating = booking.ratingDraft;
  if ((booking.status !== 'approved' && booking.status !== 'completed')
    || rating === null
    || rating === booking.rating
    || ratingSavingBookingId.value !== null) return;
  const isEditing = booking.rating !== null;
  ratingSavingBookingId.value = booking.id;
  ratingErrorBookingId.value = null;
  ratingErrorMessage.value = '';
  try {
    const { error } = await getSupabaseClient().rpc('rate_tenant_booking', {
      p_booking_id: booking.id,
      p_rating: rating,
    });
    if (error) throw error;
    booking.rating = rating;
    notice.value = isEditing ? 'Your rating has been updated.' : 'Thanks for rating your stay!';
    confettiBookingId.value = booking.id;
    if (confettiTimeout) clearTimeout(confettiTimeout);
    confettiTimeout = setTimeout(() => {
      confettiBookingId.value = null;
      confettiTimeout = undefined;
    }, 2800);
    window.dispatchEvent(new Event('casa:booking-completed'));
  } catch (error) {
    ratingErrorBookingId.value = booking.id;
    ratingErrorMessage.value = `Your rating couldn’t be saved: ${getErrorMessage(error)}`;
  } finally {
    ratingSavingBookingId.value = null;
  }
}

function confirmEndBooking(booking: ClientBooking) {
  errorMessage.value = '';
  bookingToEnd.value = booking;
}

function closeEndBooking() {
  if (updatingBookingId.value !== null) return;
  if (bookingToEnd.value?.status === 'approved') {
    bookingToEnd.value.ratingDraft = bookingToEnd.value.rating;
  }
  bookingToEnd.value = null;
}

async function endBooking() {
  const booking = bookingToEnd.value;
  if (!booking || updatingBookingId.value !== null) return;
  updatingBookingId.value = booking.id;
  errorMessage.value = '';
  notice.value = '';
  try {
    const wasPending = booking.status === 'pending';
    const ratingToSave = wasPending ? null : booking.ratingDraft;
    const ratingChanged = ratingToSave !== null && ratingToSave !== booking.rating;
    const { error } = await getSupabaseClient().rpc('end_tenant_booking', {
      p_booking_id: booking.id,
      p_rating: ratingToSave,
    });
    if (error) throw error;
    if (ratingChanged) {
      booking.rating = ratingToSave;
      confettiBookingId.value = booking.id;
      if (confettiTimeout) clearTimeout(confettiTimeout);
      confettiTimeout = setTimeout(() => {
        confettiBookingId.value = null;
        confettiTimeout = undefined;
      }, 2800);
    }
    booking.status = wasPending ? 'cancelled' : 'completed';
    notice.value = wasPending
      ? 'Your booking request has been cancelled.'
      : ratingChanged
        ? 'Your stay has ended and your rating was saved.'
        : 'Your stay has been ended.';
    highlightedBookingId.value = booking.id;
    if (highlightTimeout) clearTimeout(highlightTimeout);
    highlightTimeout = setTimeout(() => {
      highlightedBookingId.value = null;
      highlightTimeout = undefined;
    }, 1400);
    bookingToEnd.value = null;
    window.dispatchEvent(new Event('casa:booking-completed'));
  } catch (error) {
    errorMessage.value = `This booking couldn’t be updated: ${getErrorMessage(error)}`;
  } finally {
    updatingBookingId.value = null;
  }
}

onIonViewWillEnter(() => {
  shouldAnimate.value = false;
  requestAnimationFrame(() => { shouldAnimate.value = true; });
  void loadBookings();
});
onUnmounted(() => {
  if (highlightTimeout) clearTimeout(highlightTimeout);
  if (confettiTimeout) clearTimeout(confettiTimeout);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
:global(body) { background: #fbfaf7; color: #174b35; font-family: 'DM Sans', sans-serif; }
.client-content { --background: #fbfaf7; }
.client-header { min-height: 76px; padding: 0 clamp(22px, 6vw, 88px); display: flex; align-items: center; justify-content: space-between; gap: 24px; background: #fff; border-bottom: 1px solid #e8eee8; }
.brand { display: inline-flex; align-items: center; gap: 9px; color: #174b35; font-size: 25px; font-weight: 700; text-decoration: none; letter-spacing: -1.5px; }
.brand-mark { width: 35px; height: 35px; object-fit: contain; }
.brand-dot, .heading-dot { color: #e9985d; }
.client-nav { display: flex; align-items: center; gap: 30px; height: 76px; }
.client-nav a { height: 100%; display: inline-flex; align-items: center; color: #66776c; font-size: 13px; font-weight: 600; text-decoration: none; border-bottom: 2px solid transparent; }
.client-nav a.active { color: #174b35; border-color: #e9985d; }
.client-account { display: flex; align-items: center; gap: 11px; }
.avatar { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 50%; color: #174b35; background: #e7f0e9; font-size: 12px; font-weight: 700; }
.client-name { max-width: 150px; overflow: hidden; color: #354d3e; font-size: 13px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.client-account button { padding: 8px 0 8px 10px; border: 0; color: #78847b; background: transparent; font: inherit; font-size: 12px; cursor: pointer; }
.client-shell { width: min(1120px, calc(100% - 48px)); margin: 0 auto; padding: 56px 0 90px; }
.page-enter.client-header { animation: client-rise-in .48s both; }
.page-enter .welcome-row { animation: client-rise-in .5s .08s both; }
.page-enter .summary-grid article { animation: client-rise-in .48s both; }
.page-enter .summary-grid article:nth-child(1) { animation-delay: .18s; }
.page-enter .summary-grid article:nth-child(2) { animation-delay: .28s; }
.page-enter .summary-grid article:nth-child(3) { animation-delay: .38s; }
.page-enter .section-heading { animation: client-rise-in .48s .48s both; }
.page-enter .booking-card,
.page-enter .empty-state,
.page-enter .data-message { animation: client-rise-in .48s both; }
@keyframes client-rise-in {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.welcome-row { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 30px; }
.eyebrow { color: #a06e45; font-size: 10px; font-weight: 700; letter-spacing: 1.6px; }
h1, h2, h3, p { margin-top: 0; }
.welcome-row h1 { margin: 8px 0 7px; color: #174b35; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(32px, 4vw, 44px); font-weight: 600; letter-spacing: -1.2px; }
.welcome-row p { margin-bottom: 0; color: #77847a; font-size: 14px; }
.browse-button { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; gap: 8px; padding: 0 16px; border: 0; border-radius: 8px; color: #fff; background: #20583c; font: inherit; font-size: 12px; font-weight: 700; text-decoration: none; cursor: pointer; }
.browse-button ion-icon { font-size: 16px; }
.client-cta-group { display: flex; flex-wrap: wrap; gap: 10px; }
.list-space-button { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; padding: 0 16px; border: 1px solid #dfe6df; border-radius: 8px; color: #20583c; background: #fff; font: inherit; font-size: 12px; font-weight: 700; text-decoration: none; cursor: pointer; }
.list-space-dialog { width: min(440px, calc(100% - 32px)); padding: 0; border: 0; border-radius: 14px; color: #174b35; background: #fff; box-shadow: 0 24px 70px rgb(23 75 53 / 28%); }
.list-space-dialog::backdrop { backdrop-filter: blur(3px); background: rgb(15 35 25 / 58%); }
.list-space-dialog-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 22px 24px 16px; border-bottom: 1px solid #e8eee7; }
.list-space-dialog-header h2 { margin: 8px 0 0; color: #174b35; font-family: 'Playfair Display', Georgia, serif; font-size: 23px; letter-spacing: -.5px; }
.list-space-close { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 50%; color: #174b35; background: #f0f3ee; font-size: 22px; line-height: 1; cursor: pointer; }
.list-space-dialog-content { padding: 18px 24px 22px; }
.list-space-dialog-content p { margin: 0; color: #68786e; font-size: 13px; line-height: 1.65; }
.list-space-dialog-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 20px; }
.list-space-dialog-actions button, .list-space-continue { display: inline-flex; min-height: 38px; align-items: center; justify-content: center; padding: 0 13px; border-radius: 7px; font: inherit; font-size: 11px; font-weight: 700; text-decoration: none; cursor: pointer; }
.list-space-cancel { border: 1px solid #e1e7e1; color: #526357; background: #fff; }
.list-space-continue { border: 1px solid #20583c; color: #fff; background: #20583c; }
.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 42px; }
.summary-grid article { min-height: 96px; display: flex; align-items: center; gap: 14px; padding: 18px 20px; border: 1px solid #e7ece6; border-radius: 12px; background: #fff; }
.summary-icon, .empty-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: 11px; color: #2a6947; background: #eaf3ec; font-size: 23px; }
.pending-icon { color: #a86e34; background: #fff2df; }
.approved-icon { color: #497d9a; background: #eaf4f8; }
.summary-grid article div { display: grid; gap: 5px; }
.summary-grid article div span { color: #78847b; font-size: 12px; }
.summary-grid article strong { color: #174b35; font-size: 22px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
.section-heading h2 { margin: 5px 0 0; color: #174b35; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 600; }
.tabs { display: flex; gap: 5px; padding: 4px; border: 1px solid #e8ece7; border-radius: 9px; background: #fff; }
.tabs button { display: flex; align-items: center; gap: 7px; padding: 8px 10px; border: 0; border-radius: 6px; color: #78847b; background: transparent; font: inherit; font-size: 11px; cursor: pointer; }
.tabs button.active { color: #174b35; background: #edf4ee; font-weight: 700; }
.tabs button span { color: inherit; opacity: .7; }
.booking-list { display: grid; gap: 13px; }
.booking-card { position: relative; overflow: hidden; padding: 22px 24px; border: 1px solid #e7ece6; border-radius: 12px; background: #fff; }
.booking-card-highlight { animation: booking-card-highlight 1.4s ease-out both; }
@keyframes booking-card-highlight {
  0%, 100% { border-color: #e7ece6; background: #fff; box-shadow: 0 0 0 0 rgb(53 116 74 / 0%); }
  25%, 60% { border-color: #74a982; background: #f0f7f0; box-shadow: 0 0 0 4px rgb(53 116 74 / 12%); }
}
.booking-card-top { display: flex; justify-content: space-between; gap: 15px; }
.booking-reference { color: #9aa39b; font-size: 9px; font-weight: 700; letter-spacing: 1px; }
.booking-card h3 { margin: 7px 0 4px; color: #204a34; font-size: 18px; font-weight: 700; }
.listing-location { margin: 0; color: #849087; font-size: 12px; }
.request-status { flex: 0 0 auto; align-self: flex-start; padding: 7px 10px; border-radius: 20px; color: #94672f; background: #fff4e3; font-size: 10px; font-weight: 700; }
.request-status.approved { color: #2f6a4b; background: #e9f4ec; }
.request-status.declined { color: #a84c43; background: #fbefed; }
.request-status.cancelled { color: #68766d; background: #eff2ef; }
.request-status.pending.refunded, .request-status.cancelled.refunded { color: #2f6a4b; background: #e9f4ec; }
.request-status.cancelled.pending { color: #94672f; background: #fff4e3; }
.request-status.cancelled.rejected { color: #a84c43; background: #fbefed; }
.request-status.completed { color: #68766d; background: #eff2ef; }
.booking-details { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 21px; padding: 17px 0; border-top: 1px solid #eef0ed; border-bottom: 1px solid #eef0ed; }
.booking-details div { display: grid; align-content: start; gap: 6px; }
.booking-details small { color: #929d94; font-size: 10px; }
.booking-details strong { color: #375242; font-size: 12px; font-weight: 600; }
.payment-status { text-transform: capitalize; }
.payment-status.paid { color: #2f6a4b; }
.booking-note { margin: 14px 0 0; color: #818d83; font-size: 11px; line-height: 1.5; }
.approved-note { color: #3c7252; }
.refund-note { color: #2f6a4b; font-weight: 600; }
.refund-rejected-note { color: #a84c43; font-weight: 600; }
.rating-panel { position: relative; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; margin-top: 16px; padding: 14px 16px; border: 1px solid #e8eee8; border-radius: 9px; background: #fbfcfa; }
.rating-prompt { margin: 0; color: #53675a; font-size: 11px; }
.rating-stars, .rating-result { display: flex; align-items: center; gap: 3px; }
.rating-stars button { display: grid; width: 30px; height: 30px; place-items: center; padding: 0; border: 0; border-radius: 5px; color: #c9d0ca; background: transparent; font-size: 20px; cursor: pointer; }
.rating-stars button:hover, .rating-stars button:focus-visible { background: #fff2df; outline: 2px solid #e9985d; outline-offset: 1px; }
.rating-stars button:disabled { cursor: wait; opacity: .6; }
.star-filled { color: #e2743e; }
.rating-result { color: #e2743e; font-size: 17px; }
.rating-result span { margin-left: 6px; color: #53675a; font-size: 11px; font-weight: 600; }
.save-rating-button { min-height: 32px; padding: 0 12px; border: 0; border-radius: 6px; color: #fff; background: #20583c; font: inherit; font-size: 10px; font-weight: 700; cursor: pointer; }
.save-rating-button:disabled { cursor: not-allowed; opacity: .5; }
.rating-error { flex-basis: 100%; margin: 0; color: #a84c43; font-size: 11px; }
.confetti-burst { position: fixed; z-index: 30; inset: 0; overflow: hidden; pointer-events: none; }
.confetti-piece { position: absolute; top: -12px; width: 9px; height: 13px; border-radius: 2px; background: #e2743e; animation: confetti-fall 2.4s ease-in forwards; }
.confetti-piece:nth-child(3n) { background: #f3c15d; }
.confetti-piece:nth-child(3n + 1) { background: #36734e; }
.confetti-piece:nth-child(4n) { width: 7px; height: 7px; border-radius: 50%; }
@keyframes confetti-fall { to { transform: translateY(110vh) rotate(760deg); } }
.data-message { padding: 18px; border: 1px solid #e7ece6; border-radius: 10px; color: #68766d; background: #fff; font-size: 13px; }
.error-message { color: #a84c43; }
.success-message { color: #2f6a4b; }
.error-message button { margin-left: 10px; border: 0; color: #174b35; background: transparent; font: inherit; font-weight: 700; cursor: pointer; }
.booking-actions { display: flex; justify-content: flex-end; margin-top: 12px; }
.end-booking-button { padding: 8px 12px; border: 1px solid #e5bcb4; border-radius: 7px; color: #a84c43; background: #fff; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
.end-booking-button:disabled { opacity: .6; cursor: wait; }
.request-refund-button { display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px; border: 1px solid #e8c99e; border-radius: 7px; color: #95642d; background: #fff8eb; font: inherit; font-size: 10px; font-weight: 700; cursor: pointer; }
.request-refund-button ion-icon { font-size: 14px; }
.request-refund-button:disabled { opacity: .6; cursor: wait; }
.confirmation-backdrop { position: fixed; z-index: 20; inset: 0; display: grid; place-items: center; padding: 20px; background: rgb(20 40 28 / 48%); }
.confirmation-dialog { width: min(100%, 430px); padding: 28px; border-radius: 14px; background: #fff; box-shadow: 0 18px 60px rgb(15 35 23 / 22%); }
.confirmation-icon { width: 38px; height: 38px; display: grid; place-items: center; margin-bottom: 15px; border-radius: 50%; color: #a84c43; background: #fbefed; font-weight: 700; }
.confirmation-dialog h2 { margin-bottom: 9px; color: #204a34; font-family: 'Playfair Display', Georgia, serif; font-size: 23px; }
.confirmation-dialog p { margin-bottom: 23px; color: #758178; font-size: 13px; line-height: 1.65; }
.confirmation-dialog .dialog-error { margin: -8px 0 16px; color: #a84c43; font-size: 12px; }
.confirmation-dialog strong { color: #385340; }
.end-rating-prompt { margin: -4px 0 18px; }
.end-rating-prompt .rating-prompt { margin-bottom: 8px; color: #53675a; font-size: 11px; }
.confirmation-actions { display: flex; justify-content: flex-end; gap: 9px; }
.confirmation-actions button { min-height: 38px; padding: 0 13px; border-radius: 7px; font: inherit; font-size: 11px; font-weight: 700; cursor: pointer; }
.keep-booking-button { border: 1px solid #e1e7e1; color: #526357; background: #fff; }
.confirm-end-button { border: 1px solid #a84c43; color: #fff; background: #a84c43; }
.refund-icon { color: #95642d; background: #fff2df; font-size: 19px; }
.refund-icon ion-icon { font-size: 20px; }
.refund-amount-label { display: block; margin: -5px 0 7px; color: #53675a; font-size: 11px; font-weight: 700; }
.refund-amount-field { display: flex; align-items: center; gap: 9px; margin-bottom: 20px; padding: 10px 12px; border: 1px solid #e1e7e1; border-radius: 7px; color: #758178; background: #f8faf7; }
.refund-amount-field input { width: 100%; padding: 0; border: 0; outline: 0; color: #204a34; background: transparent; font: inherit; font-size: 14px; font-weight: 700; }
.confirm-refund-button { border: 1px solid #95642d; color: #fff; background: #95642d; }
.confirm-refund-button:disabled { opacity: .6; cursor: wait; }
.confirmation-actions button:disabled { opacity: .6; cursor: wait; }
.empty-state { padding: 58px 20px; border: 1px dashed #dce5dc; border-radius: 12px; text-align: center; background: #fff; }
.empty-icon { margin: 0 auto 15px; }
.empty-state h2 { margin-bottom: 8px; color: #234a35; font-family: 'Playfair Display', Georgia, serif; font-size: 22px; }
.empty-state p { margin: 0 auto 20px; color: #849087; font-size: 12px; }
@media (max-width: 720px) {
  .client-header { padding: 0 18px; gap: 12px; }
  .brand { font-size: 22px; }
  .brand-mark { width: 30px; height: 30px; }
  .client-nav { gap: 14px; }
  .client-nav a { font-size: 11px; }
  .client-account { gap: 7px; }
  .client-name { display: none; }
  .client-shell { width: min(100% - 32px, 540px); padding-top: 38px; }
  .summary-grid { gap: 8px; margin-bottom: 32px; }
  .summary-grid article { min-height: 82px; gap: 8px; padding: 12px 10px; }
  .summary-icon { width: 32px; height: 32px; font-size: 19px; }
  .summary-grid article div span { font-size: 10px; }
  .summary-grid article strong { font-size: 19px; }
  .section-heading { align-items: flex-start; flex-direction: column; }
  .booking-details { grid-template-columns: repeat(2, 1fr); row-gap: 15px; }
  .booking-card { padding: 18px; }
}
@media (max-width: 420px) {
  .client-header { min-height: 64px; }
  .client-nav { height: 64px; gap: 9px; }
  .client-nav a { font-size: 10px; }
  .avatar { width: 30px; height: 30px; }
  .client-account button { font-size: 10px; }
  .welcome-row { align-items: flex-start; flex-direction: column; }
  .client-cta-group { width: 100%; }
  .booking-card-top { flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) {
  .page-enter.client-header,
  .page-enter .welcome-row,
  .page-enter .summary-grid article,
  .page-enter .section-heading,
  .page-enter .booking-card,
  .page-enter .empty-state,
  .page-enter .data-message,
  .booking-card-highlight,
  .confetti-piece { animation-duration: .01ms; animation-delay: 0ms !important; }
}
</style>
