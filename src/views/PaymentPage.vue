<template>
  <ion-page>
    <ion-content :fullscreen="true" class="payment-content">
      <main class="payment-shell">
        <div class="gcash-brand"><img src="/gcash-logo.png" alt="" class="gcash-logo" /> <span>GCash</span></div>
        <section class="payment-card" aria-labelledby="payment-title">
          <h1 id="payment-title">Casa</h1>
          <span class="payment-label">PAY WITH</span>
          <div class="payment-row"><span>GCash</span><strong>PHP {{ amount }}</strong><span class="payment-radio" aria-hidden="true" /></div>
          <span class="payment-label about-to-pay">YOU ARE ABOUT TO PAY</span>
          <div class="payment-row amount-row"><span>Amount</span><strong>PHP {{ amount }}</strong></div>
          <div class="total-row"><span>Total</span><strong>PHP {{ amount }}</strong></div>
          <p class="review-copy">Please review to ensure that the details are correct before you proceed.</p>
          <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
          <button class="pay-button" type="button" :disabled="isSubmitting" @click="pay">PAY PHP {{ amount }}</button>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonContent, IonPage } from '@ionic/vue';
import { bookingIntentStorageKey, paidReceiptStorageKey, parseBookingIntent } from '../lib/bookingIntent';
import { getSupabaseClient } from '../lib/supabase';

const route = useRoute();
const router = useRouter();
const isSubmitting = ref(false);
const errorMessage = ref('');
const amount = computed(() => (Number(route.query.price) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 }));

async function pay() {
  if (isSubmitting.value) return;
  errorMessage.value = '';
  isSubmitting.value = true;
  try {
    const rawIntent = sessionStorage.getItem(bookingIntentStorageKey);
    if (!rawIntent) throw new Error('Your booking details were not found. Return to the listing and start again.');
    const intent = parseBookingIntent(rawIntent);
    if (typeof route.query.intent !== 'string' || intent.receiptToken !== route.query.intent) {
      throw new Error('This payment does not match your booking. Return to the listing and start again.');
    }

    const client = getSupabaseClient();
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!user) throw new Error('Please sign in again before confirming this booking.');

    const { data: bookingId, error: bookingError } = await client.rpc('confirm_booking_after_payment', {
      p_receipt_token: intent.receiptToken,
      p_space_id: intent.spaceId,
      p_room_id: intent.roomId,
      p_bedspace_id: intent.bedspaceId,
      p_tenant_name: intent.tenantName,
      p_tenant_email: intent.tenantEmail,
      p_move_in_date: intent.moveIn,
      p_message: intent.message,
    });
    if (bookingError) throw bookingError;
    if (bookingId === null || bookingId === undefined) {
      throw new Error('The booking could not be confirmed. Please try again.');
    }

    sessionStorage.setItem(paidReceiptStorageKey, intent.receiptToken);
    window.dispatchEvent(new Event('casa:booking-completed'));
    await router.replace({
      name: 'Receipt',
      query: { ...route.query, bookingId: String(bookingId) },
    });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to continue to the receipt.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
:global(*) { box-sizing: border-box; }
:global(body) { margin: 0; }
.payment-content { --background: linear-gradient(#0864e8 0 270px, #f1f3f8 270px); }
.payment-shell { min-height: 100%; padding: 38px 20px 70px; }
.gcash-brand { align-items: center; color: white; display: flex; font-family: Arial, sans-serif; font-size: 31px; font-weight: 500; gap: 9px; justify-content: center; margin: 0 auto 30px; }
.gcash-logo { filter: grayscale(1) brightness(0) invert(1); height: 39px; object-fit: contain; width: 51px; }
.payment-card { background: white; border: 1px solid #dfe3ea; border-radius: 9px; box-shadow: 0 4px 12px rgba(0,0,0,.2); margin: 0 auto; max-width: 535px; padding: 26px 34px 38px; }
.payment-card h1 { color: #0c2b72; font-family: 'Arial Black', Arial, sans-serif; font-size: 40px; letter-spacing: -.8px; margin: 0 0 42px; text-align: center; }
.payment-label { color: #666b73; display: block; font-size: 16px; font-weight: 700; letter-spacing: .4px; margin-bottom: 18px; }
.payment-row { align-items: center; color: #9a9da4; display: grid; font-size: 19px; gap: 12px; grid-template-columns: 1fr auto 25px; padding: 0 20px 36px; }
.payment-row strong { color: #777a82; font-size: 19px; font-weight: 500; }
.payment-radio { border: 3px solid #1287e5; border-radius: 50%; height: 25px; position: relative; width: 25px; }
.payment-radio::after { background: #1287e5; border-radius: 50%; content: ''; height: 11px; left: 4px; position: absolute; top: 4px; width: 11px; }
.about-to-pay { margin-top: 20px; }
.amount-row { border-bottom: 1px solid #e4e6eb; padding-bottom: 28px; }
.total-row { align-items: center; color: #44474d; display: flex; font-size: 19px; font-weight: 700; justify-content: space-between; padding: 28px 20px 0; }
.total-row strong { color: #151821; font-size: 26px; }
.review-copy { color: #92959c; font-size: 16px; line-height: 1.5; margin: 76px auto 23px; max-width: 390px; text-align: center; }
.pay-button { background: #0864e8; border: 0; border-radius: 30px; color: white; cursor: pointer; display: block; font-size: 18px; font-weight: 700; margin: 0 auto; padding: 17px; width: 100%; }
.pay-button:hover { background: #0756c7; }
.pay-button:disabled { cursor: wait; opacity: .7; }
.error-message { background: #fce8e5; border-radius: 7px; color: #a33b2d; font-size: 13px; padding: 10px; text-align: center; }
@media (max-width: 480px) { .payment-card { padding: 24px 20px 30px; }.payment-card h1 { font-size: 34px; }.payment-row, .total-row { padding-left: 8px; padding-right: 8px; }.review-copy { margin-top: 52px; } }
</style>
