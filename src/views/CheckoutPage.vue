<template>
  <ion-page>
    <ion-content :fullscreen="true" class="checkout-content">
      <header class="checkout-header">
        <a class="brand" href="/home" aria-label="Casa home">
          <img src="/casa-logo.png" alt="" class="brand-mark" />
          <span>casa<span class="brand-dot">.</span></span>
        </a>
        <a class="back-link" href="/listings">Back to listings</a>
      </header>

      <main class="checkout-shell">
        <div class="checkout-heading">
          <span class="eyebrow">SECURE YOUR SPACE</span>
          <h1>Make it your<br /><em>next casa.</em></h1>
          <p>Review your space and share a few details to start your booking request.</p>
        </div>

        <div v-if="submitted" class="success-card" role="status">
          <span class="success-icon"><ion-icon :icon="checkmarkOutline" /></span>
          <div>
            <span class="eyebrow">REQUEST RECEIVED</span>
            <h2>Your booking request is on its way.</h2>
            <p>Casa will connect you with the host to confirm the next steps for {{ booking.space }}.</p>
          </div>
          <a href="/listings">Explore more spaces <ion-icon :icon="arrowForwardOutline" /></a>
        </div>

        <div v-else class="checkout-grid">
          <section class="booking-summary" aria-labelledby="booking-summary-title">
            <span class="eyebrow">YOUR SPACE</span>
            <h2 id="booking-summary-title">{{ booking.listing }}</h2>
            <p class="location"><ion-icon :icon="locationOutline" /> {{ booking.location }}</p>
            <img class="space-image" :src="booking.image" :alt="`${booking.space} at ${booking.listing}`" @error="useDefaultImage" />
            <div class="space-meta">
              <div><span>Booking</span><strong>{{ booking.space }}</strong></div>
              <div><span>Space type</span><strong>{{ booking.type }}</strong></div>
            </div>
            <div class="price-row"><span>Monthly rent</span><strong>₱{{ booking.price.toLocaleString() }}<small> / month</small></strong></div>
          </section>

          <form class="checkout-form" @submit.prevent="submitBooking">
            <div class="form-heading">
              <span class="eyebrow">BOOKING DETAILS</span>
              <h2>Tell us about yourself</h2>
              <p>Your host will use these details to review your request.</p>
            </div>
            <label>Full name<input v-model.trim="form.name" required type="text" placeholder="Juan Dela Cruz" autocomplete="name" /></label>
            <label>Email address<input v-model.trim="form.email" required type="email" placeholder="juan@example.com" autocomplete="email" /></label>
            <label>Move-in date<input v-model="form.moveIn" required type="date" /></label>
            <label>Message to host <span class="optional">(optional)</span><textarea v-model.trim="form.message" rows="3" placeholder="Tell the host a little about yourself..." /></label>
            <label class="terms"><input v-model="form.agreed" required type="checkbox" /><span>I agree to Casa's booking guidelines and understand this is a request, not a confirmed reservation.</span></label>
            <button class="submit-button" type="submit">Send booking request <ion-icon :icon="arrowForwardOutline" /></button>
            <p class="secure-note"><ion-icon :icon="shieldCheckmarkOutline" /> Your information is only shared with this host.</p>
          </form>
        </div>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowForwardOutline, checkmarkOutline, locationOutline, shieldCheckmarkOutline } from 'ionicons/icons';

const route = useRoute();
const defaultImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85';
const booking = computed(() => ({
  listing: String(route.query.listing || 'Casa space'),
  location: String(route.query.location || 'Your next neighborhood'),
  space: String(route.query.space || 'Available space'),
  type: String(route.query.type || 'Bedspace'),
  price: Number(route.query.price) || 0,
  image: String(route.query.image || defaultImage),
}));
const form = reactive({ name: '', email: '', moveIn: '', message: '', agreed: false });
const submitted = ref(false);

function useDefaultImage(event: Event) {
  const image = event.target as HTMLImageElement;
  image.src = defaultImage;
}
function submitBooking() {
  submitted.value = true;
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
:global(body) { background: #fbfaf7; color: #174b35; font-family: 'DM Sans', sans-serif; } :global(*) { box-sizing: border-box; }
.checkout-content { --background: #fbfaf7; }.checkout-header { align-items: center; background: #fff; border-bottom: 1px solid #e7ebe5; display: flex; height: 78px; justify-content: space-between; padding: 0 clamp(22px, 7vw, 100px); }.brand { align-items: center; color: #174b35; display: flex; font-size: 26px; font-weight: 700; gap: 8px; letter-spacing: -1.5px; text-decoration: none; }.brand-mark { height: 35px; width: 35px; }.brand-dot { color: #e2743e; }.back-link { border-bottom: 1px solid #e2743e; color: #174b35; font-size: 11px; font-weight: 700; padding-bottom: 5px; text-decoration: none; }.checkout-shell { margin: 0 auto; max-width: 1030px; padding: 58px 32px 80px; }.eyebrow { color: #e2743e; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; }.checkout-heading h1 { color: #174b35; font-family: 'Playfair Display', serif; font-size: clamp(42px, 5vw, 62px); letter-spacing: -2.7px; line-height: .98; margin: 16px 0 12px; }.checkout-heading h1 em { color: #e2743e; font-weight: 600; }.checkout-heading p { color: #819087; font-size: 13px; margin: 0; }.checkout-grid { align-items: start; display: grid; gap: 28px; grid-template-columns: minmax(280px, .9fr) minmax(350px, 1.1fr); margin-top: 42px; }.booking-summary, .checkout-form, .success-card { background: #fff; border: 1px solid #e5ebe4; border-radius: 14px; box-shadow: 0 10px 26px rgba(23,75,53,.06); }.booking-summary { padding: 23px; }.booking-summary h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 28px; margin: 10px 0 4px; }.location { color: #829088; font-size: 11px; margin: 0 0 18px; }.location ion-icon { color: #e2743e; vertical-align: middle; }.space-image { border-radius: 9px; display: block; height: 220px; object-fit: cover; width: 100%; }.space-meta { border-bottom: 1px solid #e8eee7; display: grid; gap: 12px; grid-template-columns: 1fr 1fr; padding: 17px 0; }.space-meta div { display: flex; flex-direction: column; gap: 5px; }.space-meta span, .price-row span { color: #89968d; font-size: 10px; }.space-meta strong { color: #174b35; font-size: 12px; }.price-row { align-items: center; display: flex; justify-content: space-between; padding-top: 17px; }.price-row strong { color: #174b35; font-size: 17px; }.price-row small { color: #89968d; font-size: 9px; font-weight: 400; }.checkout-form { display: flex; flex-direction: column; gap: 15px; padding: 26px; }.form-heading { border-bottom: 1px solid #e8eee7; margin-bottom: 3px; padding-bottom: 14px; }.form-heading h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 25px; margin: 8px 0 4px; }.form-heading p { color: #89968d; font-size: 10px; margin: 0; }.checkout-form label:not(.terms) { color: #174b35; display: flex; flex-direction: column; font-size: 10px; font-weight: 700; gap: 7px; }.checkout-form input:not([type='checkbox']), .checkout-form textarea { appearance: none; background: #fff; border: 1px solid #dfe8de; border-radius: 7px; color: #174b35; color-scheme: light; font: inherit; font-size: 11px; outline: 0; padding: 12px; resize: vertical; }.checkout-form input:focus, .checkout-form textarea:focus { border-color: #e2743e; box-shadow: 0 0 0 3px rgba(226,116,62,.12); }.optional { color: #9ba69f; font-weight: 400; }.terms { align-items: start; color: #819087; display: flex; font-size: 9px; font-weight: 400; gap: 8px; line-height: 1.4; }.terms input { accent-color: #e2743e; margin: 1px 0 0; }.submit-button { align-items: center; background: #e2743e; border-radius: 7px; color: #fff; display: flex; font-size: 11px; font-weight: 700; gap: 7px; justify-content: center; padding: 13px; }.submit-button ion-icon { font-size: 15px; }.secure-note { align-items: center; color: #9aa59e; display: flex; font-size: 9px; gap: 5px; justify-content: center; margin: 0; }.secure-note ion-icon { color: #4b9b61; }.success-card { animation: success-card-in .55s cubic-bezier(.22,1,.36,1) both; align-items: center; display: flex; gap: 18px; margin-top: 42px; padding: 30px; }.success-icon { align-items: center; animation: success-icon-pop .55s .12s cubic-bezier(.22,1,.36,1) both; background: #e5f1e4; border-radius: 50%; color: #4b9b61; display: flex; flex: 0 0 45px; font-size: 24px; height: 45px; justify-content: center; }.success-card .eyebrow, .success-card h2, .success-card p, .success-card a { animation: success-content-in .45s .2s ease both; }.success-card h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 25px; margin: 7px 0 5px; }.success-card p { color: #819087; font-size: 11px; margin: 0; }.success-card a { align-items: center; color: #e2743e; display: flex; font-size: 10px; font-weight: 700; gap: 5px; margin-left: auto; text-decoration: none; white-space: nowrap; }
@keyframes success-card-in { from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes success-icon-pop { 0% { opacity: 0; transform: scale(.3) rotate(-18deg); } 65% { opacity: 1; transform: scale(1.12) rotate(4deg); } 100% { transform: scale(1) rotate(0); } } @keyframes success-content-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .success-card, .success-icon, .success-card .eyebrow, .success-card h2, .success-card p, .success-card a { animation: none; } }
@media (max-width: 700px) { .checkout-shell { padding: 42px 18px 55px; }.checkout-grid { grid-template-columns: 1fr; margin-top: 30px; }.checkout-form { padding: 21px 18px; }.success-card { align-items: start; flex-wrap: wrap; margin-top: 30px; padding: 22px; }.success-card a { margin-left: 63px; }.space-image { height: 190px; } }
@media (max-width: 430px) { .checkout-header { height: 70px; padding: 0 18px; }.brand { font-size: 23px; }.brand-mark { height: 30px; width: 30px; }.back-link { font-size: 10px; }.checkout-heading h1 { font-size: 44px; }.success-card a { margin-left: 0; } }
</style>
