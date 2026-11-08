<template>
  <ion-page>
    <ion-content :fullscreen="true" class="receipt-content">
      <main class="receipt-shell">
        <section v-if="isReady" class="receipt-card" aria-labelledby="receipt-title">
          <div class="success-check" aria-hidden="true">✓</div>
          <div class="receipt-brand"><img src="/gcash-logo.png" alt="" class="gcash-logo" /> <span>GCash</span></div>
          <h1 id="receipt-title">Payment successful</h1>
          <p class="sent-to">Sent via GCash</p>
          <div class="receipt-rule" />
          <div class="receipt-row"><span>Amount</span><strong>PHP {{ amount }}</strong></div>
          <div class="receipt-row total"><span>Total Amount Sent</span><strong>₱{{ amount }}</strong></div>
          <div class="receipt-meta"><span>Ref No. {{ referenceNumber }}</span><span>{{ currentDate }}</span></div>
          <div class="receipt-note">Your mock payment has been received by Casa. Your booking is confirmed.</div>
        </section>
        <section v-else class="receipt-card" role="alert">
          <h1>Receipt unavailable</h1>
          <p>{{ errorMessage }}</p>
        </section>
        <p v-if="isReady && errorMessage" class="receipt-error" role="alert">{{ errorMessage }}</p>
        <button v-if="isReady" class="merchant-redirect" type="button" @click="redirectToMerchant">
          <span>Redirect to merchant</span><span class="redirect-countdown">{{ secondsRemaining }}</span>
        </button>
        <a v-else class="return-link" href="/listings">Return to listings</a>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonContent, IonPage } from '@ionic/vue';
import { bookingIntentStorageKey, paidReceiptStorageKey, parseBookingIntent } from '../lib/bookingIntent';

const route = useRoute();
const router = useRouter();
const isReady = ref(false);
const errorMessage = ref('');
const secondsRemaining = ref(10);
const amount = computed(() => (Number(route.query.price) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }));
const referenceNumber = `${Date.now()}`.slice(-12);
const currentDate = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
let redirectTimer: ReturnType<typeof setInterval> | undefined;
let isRedirecting = false;

onMounted(() => {
  try {
    const rawIntent = sessionStorage.getItem(bookingIntentStorageKey);
    if (!rawIntent) throw new Error('Booking details were not found. Your reservation has not been made.');
    const parsed = parseBookingIntent(rawIntent);
    if (typeof route.query.intent !== 'string'
      || parsed.receiptToken !== route.query.intent
      || sessionStorage.getItem(paidReceiptStorageKey) !== parsed.receiptToken
      || !route.query.bookingId) {
      throw new Error('This receipt has no confirmed booking. Return to payment and try again.');
    }
    isReady.value = true;
    redirectTimer = setInterval(() => {
      secondsRemaining.value -= 1;
      if (secondsRemaining.value <= 0) void redirectToMerchant();
    }, 1000);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to verify this receipt.';
  }
});

async function redirectToMerchant() {
  if (!isReady.value || isRedirecting) return;
  isRedirecting = true;
  if (redirectTimer) clearInterval(redirectTimer);
  try {
    await router.replace({
      name: 'Checkout',
      query: {
        ...route.query,
        bookingSuccess: 'true',
      },
    });
    sessionStorage.removeItem(bookingIntentStorageKey);
    sessionStorage.removeItem(paidReceiptStorageKey);
  } catch (error) {
    isRedirecting = false;
    errorMessage.value = error instanceof Error ? error.message : 'Unable to return to Casa. Please try again.';
    redirectTimer = setInterval(() => {
      secondsRemaining.value -= 1;
      if (secondsRemaining.value <= 0) void redirectToMerchant();
    }, 1000);
  }
}

onUnmounted(() => {
  if (redirectTimer) clearInterval(redirectTimer);
});
</script>

<style scoped>
:global(*) { box-sizing: border-box; }
:global(body) { margin: 0; }
.receipt-content { --background: #0864e8; }
.receipt-shell { align-items: center; display: flex; flex-direction: column; min-height: 100%; padding: 38px 20px 45px; }
.receipt-card { background: #f9fbff; border-radius: 9px; box-shadow: 0 4px 15px rgba(0,0,0,.18); max-width: 535px; padding: 26px 34px 43px; width: 100%; }
.success-check { align-items: center; background: #0c64db; border: 2px solid white; border-radius: 50%; color: white; display: flex; font-size: 18px; height: 29px; justify-content: center; margin: -35px auto 13px; width: 29px; }
.receipt-brand { align-items: center; color: #173c85; display: flex; font-family: Arial, sans-serif; font-size: 18px; font-weight: 600; gap: 6px; justify-content: center; margin: 0 0 19px; }
.gcash-logo { filter: none; height: 24px; object-fit: contain; width: 32px; }
.receipt-card h1 { color: #173c85; font-family: 'Arial Black', Arial, sans-serif; font-size: 26px; margin: 0; text-align: center; }
.sent-to { color: #818896; font-size: 13px; margin: 8px 0 28px; text-align: center; }
.receipt-rule { border-top: 1px solid #e1e4ea; }
.receipt-row { align-items: center; border-bottom: 1px solid #e1e4ea; color: #253044; display: flex; font-size: 16px; font-weight: 700; justify-content: space-between; padding: 22px 0; }
.receipt-row strong { color: #1d273b; }
.receipt-row.total strong { color: #1b467b; font-size: 27px; }
.receipt-meta { color: #68758a; display: flex; font-size: 11px; justify-content: space-between; padding-top: 12px; }
.receipt-note { background: #9cebc9; color: #17684c; font-size: 13px; margin-top: 130px; padding: 18px; }
.merchant-redirect { align-items: center; background: transparent; border: 0; color: #fff; cursor: pointer; display: inline-flex; font: inherit; font-size: 15px; font-weight: 600; gap: 12px; margin-top: 24px; padding: 8px; text-decoration: underline; text-underline-offset: 4px; }
.redirect-countdown { align-items: center; border: 1px solid rgba(255,255,255,.7); border-radius: 50%; display: inline-flex; font-variant-numeric: tabular-nums; height: 30px; justify-content: center; text-decoration: none; width: 30px; }
.receipt-error { background: #fff1f0; border-radius: 8px; color: #8d2821; margin: 22px 0 0; max-width: 535px; padding: 14px; text-align: center; }
.return-link { color: white; margin-top: 24px; }
@media (max-width: 480px) { .receipt-card { padding: 24px 20px 38px; }.receipt-card h1 { font-size: 23px; }.receipt-row { font-size: 14px; }.receipt-row.total strong { font-size: 23px; }.receipt-note { margin-top: 90px; } }
</style>
