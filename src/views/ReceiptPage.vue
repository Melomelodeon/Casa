<template>
  <ion-page>
    <ion-content :fullscreen="true" class="receipt-content">
      <main class="receipt-shell">
        <section class="receipt-card" aria-labelledby="receipt-title">
          <div class="success-check" aria-hidden="true">✓</div>
          <div class="receipt-brand"><img src="/gcash-logo.png" alt="" class="gcash-logo" /> <span>GCash</span></div>
          <h1 id="receipt-title">Payment successful</h1>
          <p class="sent-to">Sent via GCash</p>
          <div class="receipt-rule" />
          <div class="receipt-row"><span>Amount</span><strong>PHP {{ amount }}</strong></div>
          <div class="receipt-row total"><span>Total Amount Sent</span><strong>₱{{ amount }}</strong></div>
          <div class="receipt-meta"><span>Ref No. {{ referenceNumber }}</span><span>{{ currentDate }}</span></div>
          <div class="receipt-note">Your mock payment has been received by Casa.</div>
        </section>
        <p class="redirect-message">Returning to your booking in <strong>{{ secondsRemaining }}</strong>s...</p>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonContent, IonPage } from '@ionic/vue';

const route = useRoute();
const router = useRouter();
const secondsRemaining = ref(5);
const amount = computed(() => (Number(route.query.price) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }));
const referenceNumber = `${Date.now()}`.slice(-12);
const currentDate = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());
let redirectTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  redirectTimer = setInterval(() => {
    secondsRemaining.value -= 1;
    if (secondsRemaining.value <= 0) {
      if (redirectTimer) clearInterval(redirectTimer);
      void router.replace({
        name: 'Checkout',
        query: { ...route.query, bookingSuccess: 'true' },
      });
    }
  }, 1000);
});

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
.redirect-message { color: white; font-size: 16px; margin: 30px 0 0; text-align: center; }
.redirect-message strong { font-size: 21px; }
@media (max-width: 480px) { .receipt-card { padding: 24px 20px 38px; }.receipt-card h1 { font-size: 23px; }.receipt-row { font-size: 14px; }.receipt-row.total strong { font-size: 23px; }.receipt-note { margin-top: 90px; } }
</style>
