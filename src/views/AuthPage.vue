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

            <div class="role-switch" aria-label="Choose account type">
              <button type="button" :class="{ active: role === 'tenant' }" @click="setRole('tenant')">
                <ion-icon :icon="searchOutline" />
                <span><strong>I’m a tenant</strong><small>Looking for a space</small></span>
              </button>
              <button type="button" :class="{ active: role === 'landlord' }" @click="setRole('landlord')">
                <ion-icon :icon="homeOutline" />
                <span><strong>I’m a landlord</strong><small>Listing my space</small></span>
              </button>
            </div>

            <form class="auth-form" @submit.prevent="submitted = true">
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
              <label v-if="!isLogin" class="terms-check">
                <input type="checkbox" required />
                <span>I agree to Casa’s <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</span>
              </label>
              <div v-if="isLogin" class="form-options">
                <label class="remember-check"><input type="checkbox" /> <span>Remember me</span></label>
                <a href="#forgot-password">Forgot password?</a>
              </div>
              <button class="primary-action" type="submit">{{ isLogin ? 'Log in to Casa' : `Create ${role} account` }} <ion-icon :icon="arrowForwardOutline" /></button>
            </form>

            <p v-if="submitted" class="form-message" role="status">Thanks! Your Casa account is ready to connect.</p>
            <p class="switch-mode">{{ isLogin ? 'New to Casa?' : 'Already have an account?' }} <a :href="isLogin ? `/signup?role=${role}` : `/login?role=${role}`">{{ isLogin ? 'Create an account' : 'Log in' }}</a></p>
          </div>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

type Role = 'tenant' | 'landlord';

const route = useRoute();
const router = useRouter();
const role = ref<Role>(route.query.role === 'landlord' ? 'landlord' : 'tenant');
const fullName = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const submitted = ref(false);
const isLogin = computed(() => route.path === '/login');

function setRole(nextRole: Role) {
  role.value = nextRole;
  submitted.value = false;
  void router.replace({ query: { ...route.query, role: nextRole } });
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
.auth-form { display: flex; flex-direction: column; gap: 16px; margin-top: 25px; }.auth-form label > span, .remember-check span { color: #52675b; font-size: 11px; font-weight: 600; }.input-wrap { align-items: center; border: 1px solid #e2e8e1; border-radius: 8px; display: flex; gap: 9px; margin-top: 7px; padding: 0 12px; transition: border-color .2s, box-shadow .2s; }.input-wrap:focus-within { border-color: #6d9b76; box-shadow: 0 0 0 3px rgba(109,155,118,.12); }.input-wrap > ion-icon { color: #8ca196; font-size: 17px; }.input-wrap input { background: transparent; border: 0; color: #174b35; flex: 1; font: inherit; font-size: 12px; height: 43px; min-width: 0; outline: 0; }.input-wrap input::placeholder { color: #aab6ad; }.password-toggle { background: transparent; color: #8ca196; display: flex; font-size: 16px; padding: 4px; }.form-options { align-items: center; display: flex; justify-content: space-between; margin-top: -4px; }.form-options a, .terms-check a, .switch-mode a { color: #e2743e; font-weight: 700; text-decoration: none; }.remember-check, .terms-check { align-items: flex-start; display: flex; gap: 7px; }.remember-check input, .terms-check input { accent-color: #e2743e; margin: 1px 0 0; }.form-options a { font-size: 10px; }.terms-check span { font-size: 10px !important; font-weight: 400 !important; line-height: 1.4; }.primary-action { align-items: center; background: #e2743e; border-radius: 8px; color: white; display: flex; font-size: 12px; font-weight: 700; justify-content: center; margin-top: 4px; padding: 14px; transition: background .2s, transform .2s; }.primary-action:hover { background: #c95f2d; transform: translateY(-2px); }.primary-action ion-icon { font-size: 16px; margin-left: 8px; }.form-message { background: #e6f2e4; border-radius: 7px; color: #3e7650; font-size: 11px; margin: 14px 0 0; padding: 10px; text-align: center; }.switch-mode { color: #8b9890; font-size: 11px; margin: 23px 0 0; text-align: center; }
@media (max-width: 760px) { .auth-shell { display: block; }.auth-showcase { min-height: 230px; padding: 24px; }.auth-showcase::before { height: 300px; left: 55%; top: -200px; width: 300px; }.auth-showcase::after { height: 130px; right: -65px; top: -55px; width: 130px; }.showcase-copy { margin: 40px 0 0; }.showcase-copy h1 { font-size: 40px; margin: 10px 0; }.showcase-copy p { display: none; }.showcase-card, .showcase-note { display: none; }.auth-panel { padding: 25px 24px 40px; }.auth-form-wrap { margin: 52px auto 0; } }
@media (max-width: 400px) { .role-switch button { gap: 5px; padding: 9px 5px; }.role-switch strong { font-size: 10px; }.role-switch small { font-size: 8px; } }
</style>
