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
        <div v-if="!submitted" :key="windAnimationKey" class="wind-gust" aria-hidden="true">
          <div class="wind-band wind-top">
            <span
              v-for="gust in 4"
              :key="`top-gust-${gust}`"
              class="wind-trail"
              :style="{ '--trail-offset': `${(gust * 7) % 30}vh`, '--trail-delay': `${(gust - 1) * 0.09}s` }"
            />
            <span
              v-for="leaf in 8"
              :key="`top-leaf-${leaf}`"
              class="wind-leaf"
              :style="{
                '--leaf-offset': `${(leaf * 5) % 32}vh`,
                '--leaf-delay': `${(leaf % 4) * 0.08}s`,
                '--leaf-size': `${11 + (leaf % 4) * 3}px`,
              }"
            />
          </div>
          <div class="wind-band wind-bottom">
            <span
              v-for="gust in 3"
              :key="`bottom-gust-${gust}`"
              class="wind-trail"
              :style="{ '--trail-offset': `${(gust * 9) % 30}vh`, '--trail-delay': `${0.2 + gust * 0.16}s` }"
            />
            <span
              v-for="leaf in 7"
              :key="`bottom-leaf-${leaf}`"
              class="wind-leaf"
              :style="{
                '--leaf-offset': `${(leaf * 4) % 32}vh`,
                '--leaf-delay': `${0.15 + (leaf % 4) * 0.13}s`,
                '--leaf-size': `${15 + (leaf % 4) * 3}px`,
              }"
            />
          </div>
        </div>
        <div v-if="!submitted" class="checkout-heading">
          <span class="eyebrow">SECURE YOUR SPACE</span>
          <h1>Make it your<br /><em>next casa.</em></h1>
          <p>Review your space and share a few details to start your booking request.</p>
        </div>

        <section v-if="submitted" class="booking-success" role="status" aria-labelledby="booking-success-title">
          <div class="confetti-layer" aria-hidden="true">
            <span v-for="piece in 32" :key="piece" class="confetti-piece" />
          </div>
          <div class="success-heading">
            <span class="success-icon"><ion-icon :icon="checkmarkOutline" /></span>
            <span class="eyebrow">PAYMENT RECEIVED</span>
            <h1 id="booking-success-title">Your next casa<br /><em>is in motion.</em></h1>
            <p>Your booking request is complete. The host can now follow up about your move-in.</p>
          </div>
          <div class="success-card">
            <div class="success-card-heading">
              <span class="eyebrow">BOOKING CONFIRMED</span>
              <h2>{{ booking.listing }}</h2>
              <p><ion-icon :icon="locationOutline" /> {{ booking.location }}</p>
            </div>
            <div class="success-details">
              <div><span>Space</span><strong>{{ booking.space }}</strong></div>
              <div><span>Move-in date</span><strong>{{ confirmationMoveInDate }}</strong></div>
              <div><span>Monthly rent</span><strong>₱{{ booking.price.toLocaleString() }}</strong></div>
            </div>
            <a href="/listings">Explore more spaces <ion-icon :icon="arrowForwardOutline" /></a>
          </div>
        </section>

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

          <form ref="wizardForm" class="checkout-form" @submit.prevent="handleWizardSubmit">
            <div class="form-heading">
              <span class="eyebrow">BOOKING DETAILS</span>
              <h2>Let’s get you settled.</h2>
              <p>A few quick steps, then your request is ready for the host.</p>
            </div>
            <div class="wizard-progress" :aria-label="`Step ${currentStep} of ${steps.length}`">
              <div v-for="(step, index) in steps" :key="step.title" class="progress-step"
                :class="{ active: currentStep === index + 1, complete: currentStep > index + 1 }">
                <span class="progress-dot"><ion-icon v-if="currentStep > index + 1" :icon="checkmarkOutline" />
                  <span v-else>{{ `0${index + 1}` }}</span></span>
                <span class="progress-label">{{ step.title }}</span>
              </div>
            </div>

            <Transition :name="transitionName" mode="out-in">
              <section :key="currentStep" class="wizard-panel" :aria-label="steps[currentStep - 1].title">
                <template v-if="currentStep === 1">
                  <div class="step-intro"><span class="step-kicker">STEP 01 · YOUR DETAILS</span>
                    <h3>Who’s making the request?</h3>
                    <p>Share the best way for your host to get in touch.</p>
                  </div>
                  <label>Full name<input v-model.trim="form.name" data-wizard-field required type="text"
                    placeholder="Juan Dela Cruz" autocomplete="name" /></label>
                  <label>Email address<input v-model.trim="form.email" data-wizard-field required type="email"
                    placeholder="juan@example.com" autocomplete="email" /></label>
                </template>

                <template v-else-if="currentStep === 2">
                  <div class="step-intro"><span class="step-kicker">STEP 02 · MOVE-IN PLANS</span>
                    <h3>When would you like to move?</h3>
                    <p>Choose today or a future date. You can leave a note for the host, too.</p>
                  </div>
                  <label>Move-in date<input v-model="form.moveIn" data-wizard-field :min="minimumMoveInDate"
                    required type="date" /></label>
                  <label>Message to host <span class="optional">(optional)</span>
                    <textarea v-model.trim="form.message" rows="3"
                      placeholder="Tell the host a little about yourself..." /></label>
                </template>

                <template v-else>
                  <div class="step-intro"><span class="step-kicker">STEP 03 · FINAL REVIEW</span>
                    <h3>Ready to meet your next casa?</h3>
                    <p>Check your details before continuing to payment.</p>
                  </div>
                  <div class="review-card">
                    <div><span>Your name</span><strong>{{ form.name }}</strong></div>
                    <div><span>Email address</span><strong>{{ form.email }}</strong></div>
                    <div><span>Move-in date</span><strong>{{ formattedMoveInDate }}</strong></div>
                    <div v-if="form.message"><span>Note to host</span><strong>{{ form.message }}</strong></div>
                    <div class="review-space"><span>Space</span><strong>{{ booking.space }} · {{ booking.listing }}</strong></div>
                  </div>
                  <label class="terms"><input v-model="form.agreed" data-wizard-field required type="checkbox" />
                    <span>I agree to Casa's booking guidelines and understand this is a request, not a confirmed reservation.</span></label>
                </template>
              </section>
            </Transition>

            <div class="wizard-actions">
              <button v-if="currentStep > 1" class="back-step-button" type="button" @click="previousStep">
                <ion-icon :icon="arrowBackOutline" /> Back
              </button>
              <span v-else class="step-caption">STEP {{ currentStep }} OF {{ steps.length }}</span>
              <button v-if="currentStep < steps.length" class="submit-button" type="button" @click="nextStep">
                Continue <ion-icon :icon="arrowForwardOutline" />
              </button>
              <button v-else class="submit-button" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? 'Opening payment...' : 'Continue to payment' }}
                <ion-icon v-if="!isSubmitting" :icon="arrowForwardOutline" />
              </button>
            </div>
            <p class="secure-note"><ion-icon :icon="shieldCheckmarkOutline" /> Your information is only shared with this host.</p>
            <p v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</p>
          </form>
        </div>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage, onIonViewWillEnter } from '@ionic/vue';
import { arrowBackOutline, arrowForwardOutline, checkmarkOutline, locationOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { getSupabaseClient } from '../lib/supabase';
import { bookingIntentStorageKey, paidReceiptStorageKey, type BookingIntent } from '../lib/bookingIntent';

const route = useRoute();
const router = useRouter();
const windAnimationKey = ref(0);
const defaultImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85';
const booking = computed(() => ({
  listingId: Number(route.query.listingId) || 0,
  listing: String(route.query.listing || 'Casa space'),
  location: String(route.query.location || 'Your next neighborhood'),
  space: String(route.query.space || 'Available space'),
  type: String(route.query.type || 'Bedspace'),
  price: Number(route.query.price) || 0,
  image: String(route.query.image || defaultImage),
}));
const form = reactive({ name: '', email: '', moveIn: '', message: '', agreed: false });
const steps = [
  { title: 'Your details' },
  { title: 'Move-in plans' },
  { title: 'Review' },
];
const currentStep = ref(1);
const transitionName = ref('wizard-forward');
const wizardForm = ref<HTMLFormElement | null>(null);
const minimumMoveInDate = (() => {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60_000);
  return localToday.toISOString().slice(0, 10);
})();
const submitted = computed(() => route.query.bookingSuccess === 'true');
const isSubmitting = ref(false);
const errorMessage = ref('');
onIonViewWillEnter(() => {
  windAnimationKey.value += 1;
});
const formattedMoveInDate = computed(() => {
  if (!form.moveIn) return '';
  return new Date(`${form.moveIn}T00:00:00`).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});
const confirmationMoveInDate = computed(() => {
  const date = String(route.query.moveIn || '');
  if (!date) return 'To be confirmed';
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

onMounted(async () => {
  const { data: { user } } = await getSupabaseClient().auth.getUser();
  if (!user) return;
  form.email = user.email || '';
  form.name = user.user_metadata?.full_name || '';
});

function useDefaultImage(event: Event) {
  const image = event.target as HTMLImageElement;
  image.src = defaultImage;
}
function validateCurrentStep() {
  const panel = wizardForm.value?.querySelector<HTMLElement>('.wizard-panel');
  const fields = panel?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-wizard-field]');
  if (!fields) return false;
  for (const field of Array.from(fields)) {
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
  }
  return true;
}
function nextStep() {
  errorMessage.value = '';
  if (!validateCurrentStep()) return;
  transitionName.value = 'wizard-forward';
  currentStep.value += 1;
}
function previousStep() {
  errorMessage.value = '';
  transitionName.value = 'wizard-back';
  currentStep.value -= 1;
}
function handleWizardSubmit() {
  if (currentStep.value < steps.length) {
    nextStep();
    return;
  }
  void submitBooking();
}
async function submitBooking() {
  errorMessage.value = '';
  if (!validateCurrentStep()) return;
  if (!form.moveIn || form.moveIn < minimumMoveInDate) {
    errorMessage.value = 'Please choose today or a future move-in date.';
    return;
  }
  isSubmitting.value = true;

  try {
    const { data: { user } } = await getSupabaseClient().auth.getUser();
    if (!user) {
      throw new Error('Please sign in before sending a booking request.');
    }
    if (!booking.value.listingId) {
      throw new Error('This listing is missing its ID. Please return to the listings page and try again.');
    }
    const roomId = Number(route.query.roomId);
    const selectionKind = String(route.query.selectionKind);
    const bedspaceId = route.query.bedspaceId ? Number(route.query.bedspaceId) : null;
    if (!Number.isSafeInteger(roomId) || roomId <= 0
      || (selectionKind !== 'bed' && selectionKind !== 'room')
      || (selectionKind === 'bed' && (!Number.isSafeInteger(bedspaceId) || (bedspaceId ?? 0) <= 0))
      || (selectionKind === 'room' && bedspaceId !== null)) {
      throw new Error('The selected room or bed is missing. Return to the listing and select an available space.');
    }

    const intent: BookingIntent = {
      receiptToken: crypto.randomUUID(),
      spaceId: booking.value.listingId,
      roomId,
      bedspaceId,
      moveIn: form.moveIn,
      message: form.message,
      tenantName: form.name,
      tenantEmail: form.email,
    };
    sessionStorage.setItem(bookingIntentStorageKey, JSON.stringify(intent));
    sessionStorage.removeItem(paidReceiptStorageKey);

    await router.push({
      name: 'Payment',
      query: {
        ...route.query,
        intent: intent.receiptToken,
      },
    });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to send your booking request.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
:global(body) { background: #fbfaf7; color: #174b35; font-family: 'DM Sans', sans-serif; } :global(*) { box-sizing: border-box; }
.checkout-content { --background: #fbfaf7; }.checkout-header { align-items: center; background: #fff; border-bottom: 1px solid #e7ebe5; display: flex; height: 78px; justify-content: space-between; padding: 0 clamp(22px, 7vw, 100px); }.brand { align-items: center; color: #174b35; display: flex; font-size: 26px; font-weight: 700; gap: 8px; letter-spacing: -1.5px; text-decoration: none; }.brand-mark { height: 35px; width: 35px; }.brand-dot { color: #e2743e; }.back-link { border-bottom: 1px solid #e2743e; color: #174b35; font-size: 11px; font-weight: 700; padding-bottom: 5px; text-decoration: none; }.checkout-shell { margin: 0 auto; max-width: 1030px; padding: 58px 32px 80px; }.eyebrow { color: #e2743e; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; }.checkout-heading h1 { color: #174b35; font-family: 'Playfair Display', serif; font-size: clamp(42px, 5vw, 62px); letter-spacing: -2.7px; line-height: .98; margin: 16px 0 12px; }.checkout-heading h1 em { color: #e2743e; font-weight: 600; }.checkout-heading p { color: #819087; font-size: 13px; margin: 0; }.checkout-grid { align-items: start; display: grid; gap: 28px; grid-template-columns: minmax(280px, .9fr) minmax(350px, 1.1fr); margin-top: 42px; }.booking-summary, .checkout-form, .success-card { background: #fff; border: 1px solid #e5ebe4; border-radius: 14px; box-shadow: 0 10px 26px rgba(23,75,53,.06); }.booking-summary { padding: 23px; }.booking-summary h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 28px; margin: 10px 0 4px; }.location { color: #829088; font-size: 11px; margin: 0 0 18px; }.location ion-icon { color: #e2743e; vertical-align: middle; }.space-image { border-radius: 9px; display: block; height: 220px; object-fit: cover; width: 100%; }.space-meta { border-bottom: 1px solid #e8eee7; display: grid; gap: 12px; grid-template-columns: 1fr 1fr; padding: 17px 0; }.space-meta div { display: flex; flex-direction: column; gap: 5px; }.space-meta span, .price-row span { color: #89968d; font-size: 10px; }.space-meta strong { color: #174b35; font-size: 12px; }.price-row { align-items: center; display: flex; justify-content: space-between; padding-top: 17px; }.price-row strong { color: #174b35; font-size: 17px; }.price-row small { color: #89968d; font-size: 9px; font-weight: 400; }.checkout-form { display: flex; flex-direction: column; gap: 15px; padding: 26px; }.form-heading { border-bottom: 1px solid #e8eee7; margin-bottom: 3px; padding-bottom: 14px; }.form-heading h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 25px; margin: 8px 0 4px; }.form-heading p { color: #89968d; font-size: 10px; margin: 0; }.checkout-form label:not(.terms) { color: #174b35; display: flex; flex-direction: column; font-size: 10px; font-weight: 700; gap: 7px; }.checkout-form input:not([type='checkbox']), .checkout-form textarea { appearance: none; background: #fff; border: 1px solid #dfe8de; border-radius: 7px; color: #174b35; color-scheme: light; font: inherit; font-size: 11px; outline: 0; padding: 12px; resize: vertical; }.checkout-form input:focus, .checkout-form textarea:focus { border-color: #e2743e; box-shadow: 0 0 0 3px rgba(226,116,62,.12); }.optional { color: #9ba69f; font-weight: 400; }.terms { align-items: start; color: #819087; display: flex; font-size: 9px; font-weight: 400; gap: 8px; line-height: 1.4; }.terms input { accent-color: #e2743e; margin: 1px 0 0; }.submit-button { align-items: center; background: #e2743e; border-radius: 7px; color: #fff; display: flex; font-size: 11px; font-weight: 700; gap: 7px; justify-content: center; padding: 13px; }.submit-button:disabled { cursor: wait; opacity: .7; }.submit-button ion-icon { font-size: 15px; }.secure-note { align-items: center; color: #9aa59e; display: flex; font-size: 9px; gap: 5px; justify-content: center; margin: 0; }.secure-note ion-icon { color: #4b9b61; }.error-message { background: #fce8e5; border-radius: 7px; color: #a33b2d; font-size: 10px; margin: 0; padding: 10px; text-align: center; }.success-card { animation: success-card-in .55s cubic-bezier(.22,1,.36,1) both; align-items: center; display: flex; gap: 18px; margin-top: 42px; padding: 30px; }.success-icon { align-items: center; animation: success-icon-pop .55s .12s cubic-bezier(.22,1,.36,1) both; background: #e5f1e4; border-radius: 50%; color: #4b9b61; display: flex; flex: 0 0 45px; font-size: 24px; height: 45px; justify-content: center; }.success-card .eyebrow, .success-card h2, .success-card p, .success-card a { animation: success-content-in .45s .2s ease both; }.success-card h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 25px; margin: 7px 0 5px; }.success-card p { color: #819087; font-size: 11px; margin: 0; }.success-card a { align-items: center; color: #e2743e; display: flex; font-size: 10px; font-weight: 700; gap: 5px; margin-left: auto; text-decoration: none; white-space: nowrap; }
.wind-gust { inset: 0; overflow: hidden; pointer-events: none; position: fixed; z-index: 30; }
.wind-band { height: 44vh; left: 0; overflow: hidden; position: absolute; width: 100%; }
.wind-top { top: 0; }
.wind-bottom { bottom: 0; }
.wind-trail { border: 1px solid transparent; border-radius: 50%; height: 13vh; opacity: 0; position: absolute; will-change: transform, opacity; }
.wind-top .wind-trail { animation: top-trail 1.05s cubic-bezier(.2, .65, .35, 1) var(--trail-delay) both; border-top-color: rgba(75, 155, 97, .22); left: -44vw; top: var(--trail-offset); transform: rotate(-12deg); width: 40vw; }
.wind-top .wind-trail::before, .wind-top .wind-trail::after { border: 1px solid transparent; border-radius: 50%; border-top-color: rgba(75, 155, 97, .15); content: ''; height: 100%; left: 8%; position: absolute; top: 4px; transform: rotate(9deg); width: 100%; }
.wind-top .wind-trail::after { left: 16%; top: 8px; transform: rotate(-5deg); }
.wind-bottom .wind-trail { animation: bottom-trail 2.15s cubic-bezier(.22, .7, .28, 1) var(--trail-delay) both; border-bottom-color: rgba(226, 116, 62, .2); height: 19vh; right: -48vw; top: var(--trail-offset); transform: rotate(15deg); width: 52vw; }
.wind-bottom .wind-trail::before, .wind-bottom .wind-trail::after { border: 1px solid transparent; border-bottom-color: rgba(226, 116, 62, .14); border-radius: 50%; content: ''; height: 100%; left: -9%; position: absolute; top: -7px; transform: rotate(-10deg); width: 100%; }
.wind-bottom .wind-trail::after { left: -17%; top: -14px; transform: rotate(6deg); }
.wind-leaf { border-radius: 0 85% 0 85%; filter: drop-shadow(0 2px 2px rgba(23, 75, 53, .16)); height: var(--leaf-size); opacity: 0; position: absolute; transform-origin: center; will-change: transform, opacity; }
.wind-leaf::after { background: rgba(235, 248, 219, .78); content: ''; height: 1px; left: 10%; position: absolute; top: 50%; transform: rotate(-35deg); transform-origin: center; width: 90%; }
.wind-top .wind-leaf { animation: top-leaf 1.32s cubic-bezier(.15, .75, .3, 1) var(--leaf-delay) both; background: linear-gradient(135deg, #b1d982, #4b9b61 68%, #347b4b); left: -7vw; top: var(--leaf-offset); width: var(--leaf-size); }
.wind-bottom .wind-leaf { animation: bottom-leaf 2.45s cubic-bezier(.25, .6, .3, 1) var(--leaf-delay) both; background: linear-gradient(135deg, #f3c58a, #e2743e 72%, #bd572e); right: -7vw; top: var(--leaf-offset); width: var(--leaf-size); }
@keyframes top-trail { 0% { opacity: 0; transform: translate3d(-5vw, 0, 0) rotate(-12deg) scaleX(.3); } 18% { opacity: .9; } 68% { opacity: .5; transform: translate3d(59vw, -2vh, 0) rotate(8deg) scaleX(1.1); } 100% { opacity: 0; transform: translate3d(142vw, 3vh, 0) rotate(-5deg) scaleX(.75); } }
@keyframes bottom-trail { 0% { opacity: 0; transform: translate3d(8vw, 4vh, 0) rotate(15deg) scaleX(.25); } 22% { opacity: .75; } 58% { opacity: .5; transform: translate3d(-63vw, -5vh, 0) rotate(-10deg) scaleX(1.2); } 100% { opacity: 0; transform: translate3d(-150vw, 0, 0) rotate(8deg) scaleX(.8); } }
@keyframes top-leaf { 0% { opacity: 0; transform: translate3d(-8vw, 0, 0) rotate(-30deg); } 12% { opacity: .95; } 38% { transform: translate3d(37vw, -4vh, 0) rotate(150deg); } 71% { transform: translate3d(81vw, 3vh, 0) rotate(340deg); } 100% { opacity: 0; transform: translate3d(120vw, -2vh, 0) rotate(520deg); } }
@keyframes bottom-leaf { 0% { opacity: 0; transform: translate3d(8vw, 0, 0) rotate(45deg); } 16% { opacity: .9; } 42% { transform: translate3d(-34vw, -7vh, 0) rotate(-120deg); } 72% { transform: translate3d(-79vw, 1vh, 0) rotate(-290deg); } 100% { opacity: 0; transform: translate3d(-120vw, -4vh, 0) rotate(-500deg); } }
@media (prefers-reduced-motion: reduce) { .wind-gust { display: none; } }
@keyframes success-card-in { from { opacity: 0; transform: translateY(18px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } } @keyframes success-icon-pop { 0% { opacity: 0; transform: scale(.3) rotate(-18deg); } 65% { opacity: 1; transform: scale(1.12) rotate(4deg); } 100% { transform: scale(1) rotate(0); } } @keyframes success-content-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@media (prefers-reduced-motion: reduce) { .success-card, .success-icon, .success-card .eyebrow, .success-card h2, .success-card p, .success-card a { animation: none; } }
@media (max-width: 700px) { .checkout-shell { padding: 42px 18px 55px; }.checkout-grid { grid-template-columns: 1fr; margin-top: 30px; }.checkout-form { padding: 21px 18px; }.success-card { align-items: start; flex-wrap: wrap; margin-top: 30px; padding: 22px; }.success-card a { margin-left: 63px; }.space-image { height: 190px; } }
@media (max-width: 430px) { .checkout-header { height: 70px; padding: 0 18px; }.brand { font-size: 23px; }.brand-mark { height: 30px; width: 30px; }.back-link { font-size: 10px; }.checkout-heading h1 { font-size: 44px; }.success-card a { margin-left: 0; } }

.booking-summary {
  animation: summary-arrive .7s cubic-bezier(.2, .8, .2, 1) both;
}

.checkout-form {
  animation: form-arrive .7s .08s cubic-bezier(.2, .8, .2, 1) both;
  overflow: hidden;
}

.wizard-progress {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, 1fr);
  margin: 3px 0 5px;
}

.progress-step {
  align-items: center;
  color: #a0aaa3;
  display: flex;
  flex-direction: column;
  gap: 7px;
  position: relative;
  text-align: center;
}

.progress-step:not(:last-child)::after {
  background: #e7ece6;
  content: '';
  height: 2px;
  left: calc(50% + 17px);
  position: absolute;
  right: calc(-50% + 17px);
  top: 16px;
}

.progress-step.complete:not(:last-child)::after {
  animation: progress-fill .45s ease both;
  background: #4b9b61;
  transform-origin: left;
}

.progress-dot {
  align-items: center;
  background: #f3f5f1;
  border: 1px solid #e3e9e1;
  border-radius: 50%;
  color: #89968d;
  display: flex;
  font-size: 9px;
  height: 33px;
  justify-content: center;
  transition: background .3s ease, border-color .3s ease, color .3s ease, transform .3s ease;
  width: 33px;
  z-index: 1;
}

.progress-step.active .progress-dot {
  animation: dot-pop .45s cubic-bezier(.2, 1.5, .5, 1) both;
  background: #e2743e;
  border-color: #e2743e;
  box-shadow: 0 0 0 5px rgba(226, 116, 62, .12);
  color: #fff;
}

.progress-step.complete .progress-dot {
  background: #4b9b61;
  border-color: #4b9b61;
  color: #fff;
}

.progress-label {
  font-size: 9px;
  font-weight: 600;
  transition: color .25s ease;
}

.progress-step.active,
.progress-step.complete {
  color: #174b35;
}

.wizard-panel {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 225px;
  padding: 13px 0 4px;
}

.step-intro {
  margin-bottom: 2px;
}

.step-kicker {
  color: #e2743e;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.4px;
}

.step-intro h3 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  margin: 7px 0 4px;
}

.step-intro p {
  color: #89968d;
  font-size: 10px;
  line-height: 1.5;
  margin: 0;
}

.wizard-actions {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
}

.step-caption {
  color: #9aa59e;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
}

.back-step-button {
  align-items: center;
  background: transparent;
  color: #587264;
  display: flex;
  font-size: 11px;
  font-weight: 700;
  gap: 6px;
  padding: 12px 4px;
  transition: color .2s ease, transform .2s ease;
}

.back-step-button:hover {
  color: #174b35;
  transform: translateX(-3px);
}

.submit-button {
  box-shadow: 0 5px 12px rgba(226, 116, 62, .2);
  cursor: pointer;
  transition: box-shadow .25s ease, transform .25s cubic-bezier(.2, .8, .2, 1), background .2s ease;
}

.submit-button:hover:not(:disabled) {
  background: #d66733;
  box-shadow: 0 8px 18px rgba(226, 116, 62, .28);
  transform: translateY(-2px);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0) scale(.98);
}

.review-card {
  animation: review-arrive .45s .08s both;
  background: #f8faf6;
  border: 1px solid #e8eee7;
  border-radius: 9px;
  display: grid;
  gap: 13px 16px;
  grid-template-columns: 1fr 1fr;
  padding: 15px;
}

.review-card div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.review-card span {
  color: #89968d;
  font-size: 9px;
}

.review-card strong {
  color: #174b35;
  font-size: 10px;
  overflow-wrap: anywhere;
}

.review-card .review-space {
  border-top: 1px solid #e5ebe4;
  grid-column: 1 / -1;
  padding-top: 11px;
}

.wizard-panel .terms {
  padding: 2px 0;
}

.wizard-forward-enter-active,
.wizard-forward-leave-active,
.wizard-back-enter-active,
.wizard-back-leave-active {
  transition: opacity .22s ease, transform .28s cubic-bezier(.2, .8, .2, 1);
}

.wizard-forward-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.wizard-forward-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}

.wizard-back-enter-from {
  opacity: 0;
  transform: translateX(-24px);
}

.wizard-back-leave-to {
  opacity: 0;
  transform: translateX(18px);
}

@keyframes summary-arrive {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes form-arrive {
  from { opacity: 0; transform: translateY(22px) scale(.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes dot-pop {
  from { transform: scale(.75); }
  to { transform: scale(1); }
}

@keyframes progress-fill {
  from { transform: scaleX(.15); }
  to { transform: scaleX(1); }
}

@keyframes review-arrive {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 430px) {
  .progress-label { font-size: 8px; }
  .wizard-panel { min-height: 250px; }
  .review-card { gap: 12px; padding: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .booking-summary,
  .checkout-form,
  .progress-step.complete:not(:last-child)::after,
  .progress-step.active .progress-dot,
  .review-card {
    animation: none;
  }
  .wizard-forward-enter-active,
  .wizard-forward-leave-active,
  .wizard-back-enter-active,
  .wizard-back-leave-active,
  .progress-dot,
  .progress-label,
  .back-step-button,
  .submit-button {
    transition: none;
  }
}

.booking-success {
  margin: 28px auto 0;
  max-width: 650px;
  position: relative;
}

.confetti-layer {
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: fixed;
  z-index: 5;
}

.confetti-piece {
  animation: confetti-fall 3.8s linear both;
  background: #e2743e;
  border-radius: 2px;
  height: 10px;
  left: 3%;
  opacity: 0;
  position: absolute;
  top: -14px;
  width: 7px;
}

.confetti-piece:nth-child(6n + 1) { background: #4b9b61; left: 6%; animation-delay: .05s; }
.confetti-piece:nth-child(6n + 2) { background: #f3c969; left: 13%; animation-delay: .35s; animation-duration: 4.2s; }
.confetti-piece:nth-child(6n + 3) { background: #e2743e; left: 21%; animation-delay: .15s; animation-duration: 3.5s; }
.confetti-piece:nth-child(6n + 4) { background: #174b35; left: 29%; animation-delay: .55s; }
.confetti-piece:nth-child(6n + 5) { background: #8bc6a0; left: 37%; animation-delay: .25s; animation-duration: 4.4s; }
.confetti-piece:nth-child(6n) { background: #f0a184; left: 44%; animation-delay: .45s; animation-duration: 3.6s; }
.confetti-piece:nth-child(12n + 1) { left: 53%; }
.confetti-piece:nth-child(12n + 2) { left: 60%; }
.confetti-piece:nth-child(12n + 3) { left: 67%; }
.confetti-piece:nth-child(12n + 4) { left: 74%; }
.confetti-piece:nth-child(12n + 5) { left: 81%; }
.confetti-piece:nth-child(12n) { left: 90%; }
.confetti-piece:nth-child(3n) { border-radius: 50%; height: 8px; width: 8px; }

@keyframes confetti-fall {
  0% { opacity: 0; transform: translate3d(0, -4vh, 0) rotate(0); }
  10% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; transform: translate3d(24px, 110vh, 0) rotate(760deg); }
}

.success-heading {
  animation: success-content-in .55s .08s both;
  margin: 0 auto 28px;
  max-width: 510px;
  text-align: center;
}

.success-heading .success-icon {
  animation: success-icon-pop .65s cubic-bezier(.22, 1, .36, 1) both;
  height: 58px;
  margin: 0 auto 20px;
  width: 58px;
}

.success-heading h1 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: clamp(42px, 6vw, 58px);
  letter-spacing: -2px;
  line-height: 1;
  margin: 12px 0;
}

.success-heading h1 em {
  color: #e2743e;
  font-weight: 600;
}

.success-heading p {
  color: #819087;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
}

.booking-success .success-card {
  animation: success-card-in .65s .18s cubic-bezier(.22, 1, .36, 1) both;
  display: block;
  margin: 0;
  padding: 26px;
}

.success-card-heading {
  border-bottom: 1px solid #e8eee7;
  padding-bottom: 17px;
}

.success-card-heading h2 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: 25px;
  margin: 9px 0 5px;
}

.success-card-heading p {
  align-items: center;
  color: #829088;
  display: flex;
  font-size: 11px;
  gap: 5px;
  margin: 0;
}

.success-card-heading p ion-icon {
  color: #e2743e;
}

.success-details {
  display: grid;
  gap: 15px;
  grid-template-columns: repeat(3, 1fr);
  padding: 19px 0;
}

.success-details div {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.success-details span {
  color: #89968d;
  font-size: 10px;
}

.success-details strong {
  color: #174b35;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.booking-success .success-card > a {
  border-top: 1px solid #e8eee7;
  justify-content: center;
  margin: 0;
  padding-top: 17px;
}

@media (max-width: 480px) {
  .booking-success { margin-top: 12px; }
  .booking-success .success-card { padding: 20px; }
  .success-details { gap: 12px; grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .confetti-piece {
    animation: none;
    display: none;
  }
  .success-heading,
  .success-heading .success-icon,
  .booking-success .success-card {
    animation: none;
  }
}
</style>
