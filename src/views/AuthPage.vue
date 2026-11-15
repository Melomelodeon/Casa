<template>
  <ion-page>
    <ion-content :fullscreen="true" class="auth-content">
      <main class="auth-shell">
        <section class="auth-showcase">
          <a class="brand" href="/home" aria-label="Back to Casa home">
            <img :src="'/casa-logo.png'" alt="" class="brand-mark" />
            <span>casa<span class="brand-dot">.</span></span>
          </a>

          <div class="showcase-copy">
            <span class="showcase-kicker">A place to belong</span>
            <h1>Make room<br />for <em>what matters.</em></h1>
            <p>Whether you’re finding your next space or sharing one, Casa makes every move feel a little more like home.</p>
          </div>

          <div class="showcase-card">
            <div class="mini-room-image" />
            <div>
              <span class="card-label">Casa community</span>
              <strong>Good spaces.<br />Good people.</strong>
            </div>
            <ion-icon :icon="sparklesOutline" />
          </div>
          <span class="showcase-note">✦ thoughtfully made for living</span>
        </section>

        <section class="auth-panel" aria-labelledby="auth-title">
          <a class="back-link" href="/home">
            <ion-icon :icon="arrowBackOutline" /> Back to home
          </a>

          <div class="auth-form-wrap">
            <div class="auth-heading">
              <span class="eyebrow">{{ isLogin ? 'WELCOME BACK' : 'WELCOME TO CASA' }}</span>
              <h2 id="auth-title">{{ isLogin ? 'Good to see you.' : 'Let’s get you settled.' }}</h2>
              <p>{{ isLogin ? 'Log in to continue your Casa journey.' : 'Create an account and find your place.' }}</p>
            </div>

            <div v-if="!isLogin" class="role-switch" aria-label="Choose account type">
              <button type="button" :class="{ active: role === 'tenant' }" @click="setRole('tenant')">
                <ion-icon :icon="searchOutline" />
                <span><strong>I’m a tenant</strong><small>Looking for a space</small></span>
              </button>
              <button type="button" :class="{ active: role === 'landlord' }" @click="setRole('landlord')">
                <ion-icon :icon="homeOutline" />
                <span><strong>I’m a landlord</strong><small>Listing my space</small></span>
              </button>
            </div>

            <form class="auth-form" @submit.prevent="submitForm">
              <label v-if="!isLogin">
                <span>Full name</span>
                <div class="input-wrap"><ion-icon :icon="personOutline" /><input v-model="fullName" type="text" placeholder="Your full name" required /></div>
              </label>
              <label>
                <span>Email address</span>
                <div class="input-wrap"><ion-icon :icon="mailOutline" /><input v-model="email" type="email" placeholder="you@example.com" required /></div>
              </label>
              <label>
                <span>Password</span>
                <div class="input-wrap"><ion-icon :icon="lockClosedOutline" /><input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Enter your password" minlength="8" required /><button class="password-toggle" type="button" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword"><ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline" /></button></div>
              </label>
              <div v-if="!isLogin" class="terms-check">
                <input id="signup-legal-agreement" type="checkbox" required
                  aria-label="Agree to Casa’s Terms of Service and Privacy Policy"
                  aria-describedby="signup-legal-copy" />
                <span id="signup-legal-copy">
                  I agree to Casa’s
                  <button class="legal-link" type="button" @click="openLegalDocument('terms', $event)">Terms of Service</button>
                  and
                  <button class="legal-link" type="button" @click="openLegalDocument('privacy', $event)">Privacy Policy</button>.
                </span>
              </div>
              <button class="primary-action" type="submit" :disabled="isSubmitting">
                {{ isSubmitting ? isLogin ? 'Logging in...' : 'Creating account...' : isLogin ? 'Log in to Casa' : `Create ${role} account` }}
                <ion-icon v-if="!isSubmitting" :icon="arrowForwardOutline" />
              </button>
            </form>

            <p v-if="formMessage" class="form-message" :class="{ error: formError }" role="status">{{ formMessage }}</p>
            <p class="switch-mode">{{ isLogin ? 'New to Casa?' : 'Already have an account?' }} <a :href="isLogin ? `/signup?role=${role}` : `/login?role=${role}`">{{ isLogin ? 'Create an account' : 'Log in' }}</a></p>
          </div>
        </section>
      </main>
      <dialog v-if="activeLegalDocument" ref="legalDialog" class="legal-dialog"
        :aria-labelledby="`${activeLegalDocument}-title`" @click="closeLegalDocumentOnBackdrop" @close="handleLegalDialogClose">
        <header class="legal-dialog-header">
          <div>
            <span class="eyebrow">CASA LEGAL</span>
            <h2 :id="`${activeLegalDocument}-title`">{{ activeLegalDocument === 'terms' ? 'Terms of Service' : 'Privacy Policy' }}</h2>
            <p>Last updated November 15, 2026</p>
          </div>
          <button class="legal-close" type="button" aria-label="Close document" @click="closeLegalDocument">×</button>
        </header>
        <div class="legal-content">
          <p class="legal-notice">This general template describes Casa’s current service. It is not legal advice and should be reviewed and adapted by the service operator before launch.</p>
          <section v-for="section in legalSections[activeLegalDocument]" :key="section.heading">
            <h3>{{ section.heading }}</h3>
            <p v-for="paragraph in section.paragraphs" :key="paragraph">{{ paragraph }}</p>
          </section>
        </div>
      </dialog>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import {
  arrowBackOutline,
  arrowForwardOutline,
  eyeOffOutline,
  eyeOutline,
  homeOutline,
  lockClosedOutline,
  mailOutline,
  personOutline,
  searchOutline,
  sparklesOutline,
} from 'ionicons/icons';
import { getSupabaseClient } from '../lib/supabase';

type Role = 'tenant' | 'landlord';
type LegalDocument = 'terms' | 'privacy';
type LegalSection = { heading: string; paragraphs: string[] };

const legalSections: Record<LegalDocument, LegalSection[]> = {
  terms: [
    {
      heading: '1. Who may use Casa',
      paragraphs: [
        'You must be at least 18 years old, or the age of legal majority where you live, to create an account or use Casa. By registering, you confirm that you meet this requirement.',
        'Give us accurate account information and keep your sign-in details secure. You are responsible for activity under your account and should promptly notify the service operator if you suspect unauthorized access.',
      ],
    },
    {
      heading: '2. Casa’s role',
      paragraphs: [
        'Casa provides an online service for discovering and listing rooms, bedspaces, and boarding houses. Casa is not the owner, landlord, tenant, broker, property manager, or insurer of a listed property unless explicitly stated in a separate written agreement.',
        'A listing or booking request does not by itself create a tenancy or guarantee that a space will be available. Any rental agreement is between the relevant host and renter and is subject to their separate agreement and applicable law.',
      ],
    },
    {
      heading: '3. Listings and user responsibilities',
      paragraphs: [
        'Hosts are responsible for having authority to offer a space and for keeping its description, location, photos, amenities, availability, rules, and price accurate and lawful. Casa may review or remove content but does not guarantee that a listing is complete, current, safe, or suitable.',
        'Renters should independently verify a property, its terms, and the identity and authority of the person offering it before making a decision. Do not rely on a listing as a substitute for your own inspection or written rental agreement.',
      ],
    },
    {
      heading: '4. Booking requests and payments',
      paragraphs: [
        'When you submit a booking request, you authorize Casa to use the information you provide to process that request and share relevant details with the host. A request may require host approval and does not guarantee acceptance.',
        'Review the amount and instructions shown during checkout before proceeding. Payment, cancellation, and refund status are handled according to the checkout flow, the parties’ agreement, and applicable law. Do not send cash or sensitive payment credentials to another user through Casa.',
      ],
    },
    {
      heading: '5. Acceptable use and content',
      paragraphs: [
        'Use Casa lawfully and respectfully. Do not post false or misleading listings, discriminate unlawfully, harass others, facilitate fraud, interfere with the service, access accounts or data without permission, or use automated means to collect content without authorization.',
        'You retain rights to content you submit. You give Casa permission to host, display, and use that content as reasonably necessary to operate and promote the service. Only submit content you have the right to share.',
      ],
    },
    {
      heading: '6. Third-party services and availability',
      paragraphs: [
        'Casa may rely on third-party services for authentication, data storage, maps, geocoding, fonts, and images. Those services may have their own terms and privacy practices. Casa does not control and is not responsible for third-party services.',
        'We work to keep Casa available but do not guarantee uninterrupted or error-free access. We may change, suspend, or discontinue features for maintenance, safety, or operational reasons.',
      ],
    },
    {
      heading: '7. Suspension and changes',
      paragraphs: [
        'Casa may restrict or suspend an account or remove content when reasonably necessary to protect users, comply with law, or enforce these terms. You may stop using Casa at any time.',
        'We may update these terms as the service changes. Updated terms will be posted here with a revised date. Continued use after an update takes effect means you accept the updated terms, to the extent permitted by law.',
      ],
    },
    {
      heading: '8. Disclaimers and applicable law',
      paragraphs: [
        'To the extent permitted by law, Casa is provided “as is” and “as available.” Nothing in these terms excludes rights or remedies that cannot lawfully be excluded or limits liability where such a limitation is prohibited.',
        'These terms are subject to applicable local law. Any mandatory consumer or privacy protections that apply to you remain in effect.',
      ],
    },
    {
      heading: '9. Contact',
      paragraphs: [
        'For questions about these terms, contact the Casa service operator using the contact details provided by the organization or administrator that operates your Casa service.',
      ],
    },
  ],
  privacy: [
    {
      heading: '1. Information we handle',
      paragraphs: [
        'Account information may include your name, email address, account role, and authentication data. Supabase Auth handles passwords and sign-in sessions; Casa does not store your password in its own application tables.',
        'If you use booking features, Casa handles the name and email you provide, the selected listing and room or bedspace, move-in date, optional message, booking amount, and booking or payment status. Hosts may provide listing descriptions, locations, photos, prices, room details, and rules.',
        'The service and its providers may also process technical information needed to deliver the site, such as browser and device data, network address, and service logs.',
      ],
    },
    {
      heading: '2. How information is used',
      paragraphs: [
        'We use information to create and secure accounts, operate and improve Casa, publish and manage listings, process booking requests and status changes, display receipts, prevent misuse, troubleshoot the service, and meet legal obligations.',
        'Casa does not use account passwords for advertising. This application does not provide a separate advertising profile or sell personal information as a feature of the service.',
      ],
    },
    {
      heading: '3. When information is shared',
      paragraphs: [
        'When you request a booking, relevant details such as your name, email, move-in date, and message are made available to the host for that listing so they can respond. Public listing details and photos may be visible to anyone browsing Casa.',
        'Casa uses service providers, including Supabase for authentication and data services, to operate the application. Providers process information on Casa’s behalf as needed to provide their services and may also process technical information under their own terms.',
        'Information may also be disclosed when required by law, to protect users or the service, or as part of a business transfer, subject to applicable law.',
      ],
    },
    {
      heading: '4. Maps and external content',
      paragraphs: [
        'Casa uses OpenStreetMap map tiles and the Nominatim geocoding service for map and address features. Requests to those services may reveal technical request data and the location or address being searched. The site also loads some fonts and listing images from external providers such as Google Fonts and Unsplash.',
        'Those providers operate independently and have their own privacy policies. Avoid entering sensitive personal information into a location search.',
      ],
    },
    {
      heading: '5. Storage, security, and retention',
      paragraphs: [
        'Account and application records are handled through the Casa Supabase project. Supabase may store authentication session data in your browser according to the application configuration. We use reasonable safeguards for the service, but no internet transmission or storage system can be guaranteed completely secure.',
        'Information is kept for as long as needed to operate your account and bookings, resolve disputes, maintain service records, and meet legal obligations. Retention periods may vary by record and legal requirements.',
      ],
    },
    {
      heading: '6. Your choices and requests',
      paragraphs: [
        'You can choose whether to create an account and whether to provide optional booking messages. Account and booking information is needed for the related features to work.',
        'Depending on your location, you may have rights to access, correct, or request deletion of personal information. To make a request or ask a privacy question, contact the Casa service operator using the contact details provided by the organization or administrator that operates your Casa service. Some information may need to be retained where the law permits or requires it.',
      ],
    },
    {
      heading: '7. Children',
      paragraphs: [
        'Casa is intended for adults arranging housing and is not directed to children. Do not create an account if you are under 18 or the age of legal majority where you live. If you believe a child has provided personal information, contact the service operator.',
      ],
    },
    {
      heading: '8. Updates and contact',
      paragraphs: [
        'We may update this policy when Casa’s features or practices change. The latest version and its update date will appear here. For privacy questions or requests, contact the Casa service operator using the contact details provided by the organization or administrator that operates your Casa service.',
      ],
    },
  ],
};

const route = useRoute();
const router = useRouter();
const role = ref<Role>(route.query.role === 'landlord' ? 'landlord' : 'tenant');
const fullName = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const submitted = ref(false);
const isSubmitting = ref(false);
const formMessage = ref('');
const formError = ref(false);
const isLogin = computed(() => route.path === '/login');
const activeLegalDocument = ref<LegalDocument | null>(null);
const legalDialog = ref<HTMLDialogElement | null>(null);
const legalDialogOpener = ref<HTMLElement | null>(null);

function openLegalDocument(document: LegalDocument, event: MouseEvent) {
  legalDialogOpener.value = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
  activeLegalDocument.value = document;
  void nextTick(() => legalDialog.value?.showModal());
}

function closeLegalDocument() {
  legalDialog.value?.close();
}

function closeLegalDocumentOnBackdrop(event: MouseEvent) {
  if (event.target === legalDialog.value) closeLegalDocument();
}

function handleLegalDialogClose() {
  activeLegalDocument.value = null;
  legalDialogOpener.value?.focus();
}

function setRole(nextRole: Role) {
  role.value = nextRole;
  submitted.value = false;
  formMessage.value = '';
  formError.value = false;
  void router.replace({ query: { ...route.query, role: nextRole } });
}

async function submitForm() {
  submitted.value = false;
  formMessage.value = '';
  formError.value = false;

  if (isLogin.value) {
    await login();
  } else {
    await register();
  }
}

async function login() {
  isSubmitting.value = true;

  try {
    const { error, data } = await getSupabaseClient().auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    });

    if (error) {
      throw error;
    }

    submitted.value = true;
    const accountRole = data.user.user_metadata?.role;
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '';
    const destination = redirect.startsWith('/') && !redirect.startsWith('//')
      ? redirect
      : accountRole === 'landlord' ? '/host' : '/client';
    await router.replace(destination);
  } catch (error) {
    formError.value = true;
    formMessage.value = error instanceof Error ? error.message : 'Unable to log in. Please check your credentials.';
  } finally {
    isSubmitting.value = false;
  }
}

async function register() {
  isSubmitting.value = true;

  try {
    const { error, data } = await getSupabaseClient().auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        data: {
          full_name: fullName.value.trim(),
          role: role.value,
        },
      },
    });

    if (error) {
      throw error;
    }

    submitted.value = true;
    formMessage.value = data.session
      ? 'Your Casa account is ready. Welcome!'
      : 'If this is a new Casa account, check your email to confirm it. If you already have an account, log in; signing up again will not change its account type.';
    fullName.value = '';
    email.value = '';
    password.value = '';
  } catch (error) {
    formError.value = true;
    formMessage.value = error instanceof Error ? error.message : 'Unable to create your account. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
:global(body) { background: #fbfaf7; color: #174b35; font-family: 'DM Sans', sans-serif; }
:global(*) { box-sizing: border-box; }
.auth-content { --background: #fbfaf7; }
.auth-shell { display: grid; grid-template-columns: 42% 58%; min-height: 100%; }
.auth-showcase { background: #174b35; color: white; min-height: 100vh; overflow: hidden; padding: 34px clamp(30px, 6vw, 90px); position: relative; }
.auth-showcase::before { border: 1px solid rgba(255,255,255,.12); border-radius: 50%; content: ''; height: 560px; left: -230px; position: absolute; top: 19%; width: 560px; }
.auth-showcase::after { background: #e2743e; border-radius: 50%; content: ''; height: 230px; opacity: .9; position: absolute; right: -110px; top: -60px; width: 230px; }
.brand { align-items: center; color: white; display: inline-flex; font-size: 27px; font-weight: 700; gap: 9px; letter-spacing: -1.5px; position: relative; text-decoration: none; z-index: 1; }.brand-mark { filter: brightness(0) invert(1); height: 38px; object-fit: contain; width: 38px; }.brand-dot { color: #f6b264; }
.showcase-copy { margin: clamp(100px, 18vh, 190px) 0 0; max-width: 430px; position: relative; z-index: 1; }.showcase-kicker { color: #f6b264; font-size: 10px; font-weight: 700; letter-spacing: 2px; }.showcase-copy h1 { font-family: 'Playfair Display', Georgia, serif; font-size: clamp(45px, 5vw, 70px); letter-spacing: -2.5px; line-height: 1.02; margin: 18px 0; }.showcase-copy h1 em { color: #f0a15d; font-weight: 600; }.showcase-copy p { color: #c2d1c7; font-size: 14px; line-height: 1.7; max-width: 360px; }
.showcase-card { align-items: center; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.12); border-radius: 12px; bottom: 68px; display: flex; gap: 13px; padding: 11px; position: absolute; width: min(300px, calc(100% - 60px)); z-index: 1; }.mini-room-image { background: url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80') center/cover; border-radius: 8px; height: 56px; width: 58px; }.showcase-card div { display: flex; flex: 1; flex-direction: column; gap: 3px; }.card-label { color: #f6b264; font-size: 9px; text-transform: uppercase; letter-spacing: 1px; }.showcase-card strong { font-family: 'Playfair Display', serif; font-size: 15px; line-height: 1.1; }.showcase-card > ion-icon { color: #f6b264; font-size: 22px; }.showcase-note { bottom: 31px; color: #a7c0b1; font-family: 'Playfair Display', serif; font-size: 12px; font-style: italic; position: absolute; right: 22%; transform: rotate(-7deg); }
.auth-panel { padding: 33px clamp(30px, 7vw, 110px); }.back-link { align-items: center; color: #7d8e84; display: inline-flex; font-size: 12px; gap: 6px; text-decoration: none; }.back-link:hover { color: #e2743e; }.back-link ion-icon { font-size: 16px; }.auth-form-wrap { margin: clamp(65px, 11vh, 120px) auto 50px; max-width: 430px; }.eyebrow { color: #e2743e; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; }.auth-heading h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: clamp(34px, 4vw, 47px); letter-spacing: -1.8px; line-height: 1.05; margin: 15px 0 9px; }.auth-heading p { color: #839087; font-size: 13px; margin: 0 0 26px; }
.role-switch { background: #f0f1ec; border-radius: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px; padding: 5px; }.role-switch button { align-items: center; background: transparent; border: 1px solid transparent; border-radius: 7px; color: #849088; display: flex; gap: 9px; padding: 10px 8px; text-align: left; }.role-switch button.active { background: white; border-color: #e3e8df; box-shadow: 0 3px 9px rgba(23,75,53,.06); color: #174b35; }.role-switch ion-icon { color: #e2743e; font-size: 19px; }.role-switch span { display: flex; flex-direction: column; }.role-switch strong { font-size: 11px; }.role-switch small { font-size: 9px; margin-top: 3px; }
.auth-form { display: flex; flex-direction: column; gap: 16px; margin-top: 25px; }.auth-form label > span { color: #52675b; font-size: 11px; font-weight: 600; }.input-wrap { align-items: center; border: 1px solid #e2e8e1; border-radius: 8px; display: flex; gap: 9px; margin-top: 7px; padding: 0 12px; transition: border-color .2s, box-shadow .2s; }.input-wrap:focus-within { border-color: #6d9b76; box-shadow: 0 0 0 3px rgba(109,155,118,.12); }.input-wrap > ion-icon { color: #8ca196; font-size: 17px; }.input-wrap input { background: transparent; border: 0; color: #174b35; flex: 1; font: inherit; font-size: 12px; height: 43px; min-width: 0; outline: 0; }.input-wrap input::placeholder { color: #aab6ad; }.password-toggle { background: transparent; color: #8ca196; display: flex; font-size: 16px; padding: 4px; }.terms-check { align-items: flex-start; display: flex; gap: 7px; }.terms-check input { accent-color: #e2743e; flex: none; margin: 1px 0 0; }.terms-check span { color: #52675b; font-size: 10px; font-weight: 400; line-height: 1.5; }.terms-check a, .terms-check .legal-link, .switch-mode a { color: #e2743e; font-weight: 700; text-decoration: none; }.legal-link { background: transparent; border: 0; cursor: pointer; font: inherit; padding: 0; text-decoration: underline !important; }.legal-link:focus-visible { outline: 2px solid #e2743e; outline-offset: 2px; }.primary-action { align-items: center; background: #e2743e; border-radius: 8px; color: white; display: flex; font-size: 12px; font-weight: 700; justify-content: center; margin-top: 4px; padding: 14px; transition: background .2s, transform .2s; }.primary-action:hover { background: #c95f2d; transform: translateY(-2px); }.primary-action ion-icon { font-size: 16px; margin-left: 8px; }.form-message { background: #e6f2e4; border-radius: 7px; color: #3e7650; font-size: 11px; margin: 14px 0 0; padding: 10px; text-align: center; }.switch-mode { color: #8b9890; font-size: 11px; margin: 23px 0 0; text-align: center; }
.legal-dialog { background: #fbfaf7; border: 0; border-radius: 14px; box-shadow: 0 24px 70px rgba(23,75,53,.28); color: #174b35; display: flex; flex-direction: column; margin: auto; max-height: min(86vh, 900px); max-width: 760px; padding: 0; width: calc(100% - 32px); }.legal-dialog::backdrop { backdrop-filter: blur(3px); background: rgba(15,35,25,.58); }.legal-dialog-header { align-items: flex-start; border-bottom: 1px solid #e8eee7; display: flex; flex: none; justify-content: space-between; padding: 24px 28px 18px; }.legal-dialog-header h2 { color: #174b35; font-family: 'Playfair Display', serif; font-size: 30px; letter-spacing: -1px; margin: 8px 0 4px; }.legal-dialog-header p { color: #89968d; font-size: 10px; margin: 0; }.legal-close { align-items: center; background: #f0f3ee; border-radius: 50%; color: #174b35; cursor: pointer; display: flex; font-size: 24px; height: 35px; justify-content: center; line-height: 1; width: 35px; }.legal-content { overflow-y: auto; padding: 18px 28px 28px; scrollbar-width: none; -ms-overflow-style: none; }.legal-content::-webkit-scrollbar { display: none; }.legal-content section + section { border-top: 1px solid #edf0eb; margin-top: 18px; padding-top: 14px; }.legal-content h3 { color: #174b35; font-size: 13px; margin: 0 0 7px; }.legal-content p { color: #68786e; font-size: 11px; line-height: 1.7; margin: 0 0 9px; }.legal-content p:last-child { margin-bottom: 0; }.legal-content .legal-notice { background: #f6f4ed; border-left: 3px solid #e2743e; border-radius: 4px; margin-bottom: 18px; padding: 10px 12px; }
.primary-action:disabled { cursor: wait; opacity: .7; }.form-message.error { background: #fce8e5; color: #a33b2d; }
@media (max-width: 760px) { .auth-shell { display: block; }.auth-showcase { min-height: 230px; padding: 24px; }.auth-showcase::before { height: 300px; left: 55%; top: -200px; width: 300px; }.auth-showcase::after { height: 130px; right: -65px; top: -55px; width: 130px; }.showcase-copy { margin: 40px 0 0; }.showcase-copy h1 { font-size: 40px; margin: 10px 0; }.showcase-copy p { display: none; }.showcase-card, .showcase-note { display: none; }.auth-panel { padding: 25px 24px 40px; }.auth-form-wrap { margin: 52px auto 0; } }
@media (max-width: 400px) { .role-switch button { gap: 5px; padding: 9px 5px; }.role-switch strong { font-size: 10px; }.role-switch small { font-size: 8px; } }
</style>
