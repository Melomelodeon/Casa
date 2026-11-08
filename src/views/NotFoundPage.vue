<template>
  <ion-page>
    <ion-content :fullscreen="true" class="not-found-content">
      <main class="not-found">
        <a class="brand" href="/home" aria-label="Casa home">
          <span class="brand-mark">c</span>
          <span>casa<span class="brand-dot">.</span></span>
        </a>

        <section class="message" aria-labelledby="not-found-title">
          <div class="illustration" aria-hidden="true">
            <span class="orbit orbit-one" />
            <span class="orbit orbit-two" />
            <span class="star star-one">✦</span>
            <span class="star star-two">✧</span>
            <span class="house">
              <span class="roof" />
              <span class="house-body">
                <span class="window window-one" />
                <span class="window window-two" />
                <span class="door" />
              </span>
            </span>
            <span class="floating-404">404</span>
          </div>

          <p class="eyebrow"><span /> LOST YOUR WAY?</p>
          <h1 id="not-found-title">This page feels<br /><em>a little lost.</em></h1>
          <p class="description">
            We couldn’t find the page you were looking for. It may have moved, or the link might be
            taking a little detour.
          </p>
          <div class="actions">
            <button class="home-button" type="button" @click="goHome">
              <ion-icon :icon="homeOutline" />
              Take me home
            </button>
            <button class="back-button" type="button" @click="goBack">
              <ion-icon :icon="arrowBackOutline" />
              Go back
            </button>
          </div>
          <p class="page-code">ERROR CODE <span>404</span></p>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { arrowBackOutline, homeOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';

const router = useRouter();

function goHome() {
  void router.push({ name: 'Home' });
}

function goBack() {
  if (window.history.state?.back) {
    router.back();
    return;
  }

  goHome();
}
</script>

<style scoped>
.not-found-content {
  --background: #faf8f4;
  font-family: 'DM Sans', sans-serif;
}

.not-found {
  box-sizing: border-box;
  display: flex;
  min-height: 100%;
  flex-direction: column;
  align-items: center;
  padding: 28px 24px 36px;
  color: #23332c;
}

.brand {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 9px;
  color: #23332c;
  font-size: 25px;
  font-weight: 700;
  letter-spacing: -1.5px;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 12px;
  background: #e5eee5;
  color: #4a765d;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 25px;
  font-style: italic;
}

.brand-dot {
  color: #83a889;
}

.message {
  display: flex;
  width: min(100%, 520px);
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0 16px;
  text-align: center;
}

.illustration {
  position: relative;
  width: 260px;
  height: 230px;
  margin-bottom: 15px;
  animation: arrive 700ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.orbit {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 1px solid #dce5d8;
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(-18deg);
}

.orbit-one {
  width: 228px;
  height: 116px;
}

.orbit-two {
  width: 194px;
  height: 170px;
  transform: translate(-50%, -50%) rotate(54deg);
}

.house {
  position: absolute;
  top: 66px;
  left: 88px;
  width: 84px;
  height: 100px;
  animation: float 4s ease-in-out infinite;
}

.roof {
  position: absolute;
  z-index: 1;
  top: -5px;
  left: -6px;
  width: 96px;
  height: 60px;
  background: #d3a875;
  clip-path: polygon(50% 0, 100% 65%, 90% 77%, 50% 34%, 10% 77%, 0 65%);
}

.house-body {
  position: absolute;
  z-index: 0;
  right: 0;
  bottom: 0;
  left: 0;
  height: 77px;
  border-radius: 8px 8px 10px 10px;
  background: #f0dfc8;
  box-shadow: 0 13px 25px rgb(68 72 52 / 10%);
}

.window,
.door {
  position: absolute;
  bottom: 34px;
  width: 16px;
  height: 19px;
  border: 3px solid #88a88c;
  border-radius: 5px 5px 2px 2px;
  background: #e8f0e5;
}

.window-one {
  left: 11px;
}

.window-two {
  right: 11px;
}

.door {
  bottom: 0;
  left: 32px;
  width: 21px;
  height: 42px;
  border-color: #8d7052;
  background: #b98f68;
}

.floating-404 {
  position: absolute;
  top: 29px;
  right: 16px;
  padding: 8px 12px;
  border: 1px solid #e8e4da;
  border-radius: 12px;
  background: #fffefa;
  color: #66836a;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  box-shadow: 0 8px 20px rgb(54 65 48 / 8%);
  animation: float 3.5s ease-in-out -1s infinite;
}

.star {
  position: absolute;
  color: #d5a35e;
}

.star-one {
  top: 58px;
  left: 36px;
  font-size: 24px;
  animation: twinkle 2.4s ease-in-out infinite;
}

.star-two {
  right: 37px;
  bottom: 43px;
  color: #88a88c;
  font-size: 30px;
  animation: twinkle 2.4s ease-in-out -1.1s infinite;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 14px;
  color: #7e927f;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.eyebrow span {
  width: 22px;
  height: 1px;
  background: #9ab19a;
}

h1 {
  margin: 0;
  color: #26372e;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: clamp(42px, 8vw, 58px);
  font-weight: 600;
  letter-spacing: -1.8px;
  line-height: 1.08;
}

h1 em {
  color: #7b9b7e;
  font-weight: 600;
}

.description {
  max-width: 390px;
  margin: 17px 0 25px;
  color: #778078;
  font-size: 15px;
  line-height: 1.7;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.actions button {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
}

.actions button:hover {
  transform: translateY(-2px);
}

.actions button:focus-visible,
.brand:focus-visible {
  outline: 3px solid #a9c5a8;
  outline-offset: 4px;
}

.actions ion-icon {
  font-size: 17px;
}

.home-button {
  background: #55775e;
  color: #fff;
  box-shadow: 0 7px 16px rgb(67 103 76 / 18%);
}

.home-button:hover {
  background: #45684f;
  box-shadow: 0 10px 20px rgb(67 103 76 / 23%);
}

.back-button {
  border-color: #e4e6df !important;
  background: #fffefa;
  color: #58675c;
}

.back-button:hover {
  background: #f1f3ed;
}

.page-code {
  margin: 30px 0 0;
  color: #a0a89f;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
}

.page-code span {
  margin-left: 5px;
  color: #79877a;
}

@keyframes arrive {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.55;
    transform: scale(0.9) rotate(-8deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.12) rotate(8deg);
  }
}

@media (max-width: 420px) {
  .not-found {
    padding-right: 18px;
    padding-left: 18px;
  }

  .illustration {
    transform: scale(0.9);
    margin-bottom: -2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
