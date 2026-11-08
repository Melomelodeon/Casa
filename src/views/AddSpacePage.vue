<template>
  <ion-page>
    <ion-content :fullscreen="true" class="host-content">
      <header class="host-header">
        <a class="brand" href="/home" aria-label="Casa home"><img src="/casa-logo.png" alt=""
            class="brand-mark" /><span>casa<span class="brand-dot">.</span></span></a>
        <nav class="host-nav" aria-label="Host navigation"><a href="/host">Dashboard</a><a class="active"
            href="/host/spaces">My spaces</a><a href="/host/requests">Requests <span class="nav-count">2</span></a>
        </nav>
        <div class="host-account"><span class="avatar">{{ initials }}</span><span class="host-name">{{ displayName
            }}</span><button type="button" aria-label="Log out" @click="logout">Log out</button></div>
      </header>
      <main class="host-shell">
        <a class="back-link" href="/host/spaces">← Back to my spaces</a>
        <div class="page-heading">
          <div><span class="eyebrow">CREATE A LISTING</span>
            <h1>Add a space.</h1>
            <p>Share the details that help residents picture themselves at home.</p>
          </div><span class="step-label">STEP {{ submitted ? totalSteps : currentStep }} OF {{ totalSteps }}</span>
        </div>
        <div v-if="submitted" class="success-card" role="status"><span class="success-icon"><ion-icon
              :icon="checkmarkOutline" /></span>
          <div><span class="eyebrow">LISTING PUBLISHED</span>
            <h2>Your listing has been published.</h2>
            <p>Residents can now discover and book your space.</p>
          </div><a href="/host/spaces">View my spaces <ion-icon :icon="arrowForwardOutline" /></a>
        </div>
        <form v-else ref="formElement" class="listing-form" novalidate @submit.prevent="handleSubmit">
          <section v-if="currentStep === 1" class="form-card">
            <div class="section-heading"><span class="section-number">01</span>
              <div>
                <h2>Tell us about your space</h2>
                <p>Start with the basics residents need to know.</p>
              </div>
            </div>
            <div class="field-grid"><label>Space name<input v-model.trim="form.name" required type="text"
                  placeholder="e.g. Sage House" /></label><label>City or area<input v-model.trim="form.location"
                  required type="text" placeholder="e.g. Poblacion, Makati" /></label></div>
            <fieldset class="listing-type">
              <legend>What are you listing?</legend>
              <div class="type-options"><label v-for="type in ['Bedspace', 'Private room']" :key="type"
                  class="type-option"><input v-model="form.type" name="listing-type" type="radio" :value="type" />
                  <span>{{ type }}</span></label></div>
            </fieldset><label>Description<textarea v-model.trim="form.description" required rows="4"
                placeholder="Describe what makes this space special..." /></label><label class="cover-photo-field"><span
                class="photo-field-label">Cover photo</span><span class="photo-dropzone"><input type="file"
                  accept="image/*" @change="handleCoverPhoto" /><ion-icon :icon="cloudUploadOutline" /><strong>{{
                    coverPhotoName || 'Drop cover photo here or browse' }}</strong><span class="photo-upload-hint">PNG or
                  JPG · 1 photo</span><small>{{ coverPhotoName ? 'Cover photo selected' : 'Choose cover photo'
                  }}</small></span></label>
          </section>
          <section v-if="currentStep === 2" class="form-card">
            <div class="section-heading"><span class="section-number">02</span>
              <div>
                <h2>Floor details</h2>
                <p>Give residents a clear idea of where the space is located.</p>
              </div>
            </div>
            <label>Floor name<input v-model.trim="form.floorName" type="text" placeholder="e.g. Ground floor" /></label>
            <label class="floor-photo-field"><span class="photo-field-label">Floor photo</span><span class="photo-dropzone"><input type="file"
              accept="image/*" @change="handleFloorPhoto" /><ion-icon :icon="cloudUploadOutline" /><strong>{{
                floorPhotoName || 'Drop floor photo here or browse' }}</strong><span class="photo-upload-hint">PNG or JPG · 1 photo</span><small>{{
                floorPhotoName ? 'Floor photo selected' : 'Choose floor photo' }}</small></span></label>
          </section>
          <section v-if="currentStep === 3" class="form-card">
            <div class="section-heading"><span class="section-number">03</span>
              <div>
                <h2>Room details</h2>
                <p>Add the room name and a photo residents can use to identify it.</p>
              </div>
            </div>
            <label>Room name<input v-model.trim="form.roomName" type="text"
              placeholder="e.g. Sunrise Room" /></label>
            <label class="room-photo-field"><span class="photo-field-label">Room photo</span><span class="photo-dropzone"><input type="file"
              accept="image/*" @change="handleRoomPhoto" /><ion-icon :icon="cloudUploadOutline" /><strong>{{
                roomPhotoName || 'Drop room photo here or browse' }}</strong><span class="photo-upload-hint">PNG or JPG · 1 photo</span><small>{{
                roomPhotoName ? 'Room photo selected' : 'Choose room photo' }}</small></span></label>
            <template v-if="form.type === 'Private room'">
              <div class="field-grid private-room-space-details">
                <label>Space name<input v-model.trim="privateRoomSpace.name" type="text" placeholder="e.g. Sunrise Space" /></label>
                <label>Monthly rent<input v-model.number="privateRoomSpace.price" min="1" type="number" placeholder="8500" /></label>
              </div>
              <fieldset class="detail-list">
                <legend>Amenities included</legend>
                <div class="repeatable-list">
                  <div v-for="(_, index) in privateRoomSpace.amenities" :key="`private-amenity-${index}`" class="repeatable-row">
                    <input v-model.trim="privateRoomSpace.amenities[index]" type="text" placeholder="e.g. Wi-Fi" :aria-label="`Amenity ${index + 1}`" />
                    <button v-if="privateRoomSpace.amenities.length > 1" type="button" class="remove-item" :aria-label="`Remove amenity ${index + 1}`" @click="removeItem(privateRoomSpace.amenities, index)">×</button>
                  </div>
                </div>
                <button type="button" class="add-item" @click="addItem(privateRoomSpace.amenities)">+ Add another amenity</button>
              </fieldset>
              <fieldset class="detail-list">
                <legend>House rules</legend>
                <div class="repeatable-list">
                  <div v-for="(_, index) in privateRoomSpace.houseRules" :key="`private-rule-${index}`" class="repeatable-row">
                    <input v-model.trim="privateRoomSpace.houseRules[index]" type="text" placeholder="e.g. Quiet hours after 10 PM" :aria-label="`House rule ${index + 1}`" />
                    <button v-if="privateRoomSpace.houseRules.length > 1" type="button" class="remove-item" :aria-label="`Remove house rule ${index + 1}`" @click="removeItem(privateRoomSpace.houseRules, index)">×</button>
                  </div>
                </div>
                <button type="button" class="add-item" @click="addItem(privateRoomSpace.houseRules)">+ Add another house rule</button>
              </fieldset>
              <fieldset class="detail-list">
                <legend>Maintenance history</legend>
                <div class="repeatable-list">
                  <div v-for="(_, index) in privateRoomSpace.maintenance" :key="`private-maintenance-${index}`" class="repeatable-row">
                    <input v-model.trim="privateRoomSpace.maintenance[index]" type="text" placeholder="e.g. Room deep-cleaned and sanitized" :aria-label="`Maintenance entry ${index + 1}`" />
                    <button v-if="privateRoomSpace.maintenance.length > 1" type="button" class="remove-item" :aria-label="`Remove maintenance entry ${index + 1}`" @click="removeItem(privateRoomSpace.maintenance, index)">×</button>
                  </div>
                </div>
                <button type="button" class="add-item" @click="addItem(privateRoomSpace.maintenance)">+ Add maintenance entry</button>
              </fieldset>
            </template>
          </section>
          <section v-if="currentStep === 4 && form.type === 'Bedspace'" class="form-card layout-form">
            <div class="section-heading"><span class="section-number">04</span>
              <div>
                <h2>Room layout</h2>
                <p>Set the room grid, then select a cell to add a bedspace.</p>
              </div>
            </div>
            <div class="field-grid grid-size-fields">
              <label>Grid rows<input v-model.number="gridRows" type="number" min="1" step="1" /></label>
              <label>Grid columns<input v-model.number="gridColumns" type="number" min="1" step="1" /></label>
            </div>
            <div class="door-controls">
              <button type="button" class="door-placement-button" :class="{ active: isPlacingDoor }"
                @click="isPlacingDoor = !isPlacingDoor">
                <ion-icon :icon="enterOutline" /> {{ isPlacingDoor ? 'Select a cell for the door' : doorPosition ? 'Move door' : 'Place door' }}
              </button>
              <button v-if="doorPosition" type="button" class="clear-door-button" @click="doorPosition = null">Remove door</button>
            </div>
            <div class="grid-preview-wrap">
              <div class="host-bed-grid" :style="{ '--layout-rows': normalizedRows, '--layout-columns': normalizedColumns }">
                <button v-for="cell in layoutCells" :key="cell.id" type="button" class="host-grid-cell"
                  :class="{ 'has-bedspaces': cell.bedspaces.length, 'has-door': cell.isDoor, 'door-placement-target': isPlacingDoor }"
                  :aria-label="`Row ${cell.row}, column ${cell.column}${cell.isDoor ? ', door' : ''}${cell.bedspaces.length ? `, ${cell.bedspaces.length} bedspaces` : ', empty'}`"
                  @click="selectGridCell(cell.row, cell.column)">
                  <span v-if="cell.isDoor" class="host-door-marker" aria-label="Door position"><ion-icon :icon="enterOutline" /><small>Door</small></span>
                  <span v-if="cell.bedspaces.length" class="cell-bedspaces">
                    <span v-for="space in cell.bedspaces" :key="space.id" class="cell-bedspace">
                      <ion-icon :icon="bedOutline" /><span>{{ space.name || 'Bedspace' }}</span>
                    </span>
                  </span>
                  <span v-else class="empty-cell"><ion-icon :icon="addOutline" /><small>Add bedspace</small></span>
                  <small class="cell-position">{{ cell.row }}, {{ cell.column }}</small>
                </button>
              </div>
              <p class="bunk-tip"><ion-icon :icon="informationCircleOutline" /> Add another bedspace to the same grid cell to create a bunk bed.</p>
            </div>
            <p class="layout-count">{{ roomSpaces.length }} bedspace{{ roomSpaces.length === 1 ? '' : 's' }} added</p>
          </section>
          <div class="form-actions"><button v-if="currentStep > 1" class="back-form-button" type="button"
              @click="currentStep--">Back</button><button v-if="currentStep < totalSteps" class="submit-button" type="button"
              @click="goToNextStep">Continue <ion-icon :icon="arrowForwardOutline" /></button><button v-else
              class="submit-button" type="button" :disabled="form.type === 'Bedspace' && roomSpaces.length === 0" @click="openConfirmation">Publish listing <ion-icon :icon="arrowForwardOutline" /></button></div>
          <p v-if="form.type === 'Bedspace' && currentStep === totalSteps && roomSpaces.length === 0" class="publish-hint">Add at least one bedspace before publishing.</p>
        </form>
        <div v-if="showAddBedspaceConfirmation" class="dialog-backdrop" role="presentation" @click.self="cancelAddBedspace">
          <section class="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="add-bedspace-title">
            <span class="dialog-icon"><ion-icon :icon="bedOutline" /></span>
            <h2 id="add-bedspace-title">Add a bedspace?</h2>
            <p>Add a bedspace to row {{ selectedCell?.row }}, column {{ selectedCell?.column }}?</p>
            <div class="dialog-actions">
              <button type="button" class="back-form-button" @click="cancelAddBedspace">Cancel</button>
              <button type="button" class="submit-button" @click="continueToBedspaceDetails">Continue</button>
            </div>
          </section>
        </div>
        <div v-if="showBedspaceForm" class="dialog-backdrop bedspace-dialog-backdrop" role="presentation" @click.self="cancelBedspaceForm">
          <section class="bedspace-dialog" role="dialog" aria-modal="true" aria-labelledby="bedspace-dialog-title">
            <div class="section-heading"><span class="section-number">05</span><div>
              <h2 id="bedspace-dialog-title">Bedspace details</h2>
              <p>For grid cell {{ selectedCell?.row }}, {{ selectedCell?.column }}</p>
            </div></div>
            <div class="field-grid">
              <label>Bedspace name<input v-model.trim="bedspaceDraft.name" type="text" placeholder="e.g. Bed A" /></label>
              <label>Monthly rent<input v-model.number="bedspaceDraft.price" min="1" type="number" placeholder="8500" /></label>
            </div>
            <label class="bedspace-photo-field"><span class="photo-field-label">Bedspace photo</span><span class="photo-dropzone bedspace-photo-dropzone">
              <input type="file" accept="image/*" @change="handleBedspacePhoto" />
              <ion-icon :icon="cloudUploadOutline" /><strong>{{ bedspaceDraft.image?.name || 'Drop bedspace photo here or browse' }}</strong>
              <span class="photo-upload-hint">PNG or JPG · 1 photo</span>
              <small>{{ bedspaceDraft.image ? 'Bedspace photo selected' : 'Choose bedspace photo' }}</small>
            </span></label>
            <fieldset class="detail-list">
              <legend>Amenities included</legend>
              <div class="repeatable-list">
                <div v-for="(_, index) in bedspaceDraft.amenities" :key="`amenity-${index}`" class="repeatable-row">
                  <input v-model.trim="bedspaceDraft.amenities[index]" type="text" placeholder="e.g. Wi-Fi" :aria-label="`Amenity ${index + 1}`" />
                  <button v-if="bedspaceDraft.amenities.length > 1" type="button" class="remove-item" :aria-label="`Remove amenity ${index + 1}`" @click="removeItem(bedspaceDraft.amenities, index)">×</button>
                </div>
              </div>
              <button type="button" class="add-item" @click="addItem(bedspaceDraft.amenities)">+ Add another amenity</button>
            </fieldset>
            <fieldset class="detail-list">
              <legend>House rules</legend>
              <div class="repeatable-list">
                <div v-for="(_, index) in bedspaceDraft.houseRules" :key="`rule-${index}`" class="repeatable-row">
                  <input v-model.trim="bedspaceDraft.houseRules[index]" type="text" placeholder="e.g. Quiet hours after 10 PM" :aria-label="`House rule ${index + 1}`" />
                  <button v-if="bedspaceDraft.houseRules.length > 1" type="button" class="remove-item" :aria-label="`Remove house rule ${index + 1}`" @click="removeItem(bedspaceDraft.houseRules, index)">×</button>
                </div>
              </div>
              <button type="button" class="add-item" @click="addItem(bedspaceDraft.houseRules)">+ Add another house rule</button>
            </fieldset>
            <fieldset class="detail-list">
              <legend>Maintenance history</legend>
              <div class="repeatable-list">
                <div v-for="(_, index) in bedspaceDraft.maintenance" :key="`maintenance-${index}`" class="repeatable-row">
                  <input v-model.trim="bedspaceDraft.maintenance[index]" type="text" placeholder="e.g. Bed frame checked and tightened" :aria-label="`Maintenance entry ${index + 1}`" />
                  <button v-if="bedspaceDraft.maintenance.length > 1" type="button" class="remove-item" :aria-label="`Remove maintenance entry ${index + 1}`" @click="removeItem(bedspaceDraft.maintenance, index)">×</button>
                </div>
              </div>
              <button type="button" class="add-item" @click="addItem(bedspaceDraft.maintenance)">+ Add maintenance entry</button>
            </fieldset>
            <div class="dialog-actions">
              <button type="button" class="back-form-button" @click="cancelBedspaceForm">Cancel</button>
              <button type="button" class="submit-button" @click="createBedspace">Add bedspace</button>
            </div>
          </section>
        </div>
        <div v-if="showConfirmation" class="dialog-backdrop" role="presentation" @click.self="closeConfirmation">
          <section class="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-dialog-title">
            <span class="dialog-icon"><ion-icon :icon="checkmarkOutline" /></span>
            <h2 id="publish-dialog-title">Publish this listing?</h2>
            <p>Once published, residents will be able to view your listing and request to book it.</p>
            <div class="dialog-actions">
              <button type="button" class="back-form-button" @click="closeConfirmation">Cancel</button>
              <button type="button" class="submit-button" @click="confirmPublish">Publish listing</button>
            </div>
          </section>
        </div>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { addOutline, arrowForwardOutline, bedOutline, checkmarkOutline, cloudUploadOutline, enterOutline, informationCircleOutline } from 'ionicons/icons';
import { useLogout } from '../composables/useLogout';
import { useAuthUser } from '../composables/useAuthUser';

const { logout } = useLogout();
const { user } = useAuthUser();
const displayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'Host');
const initials = computed(() => displayName.value.split(/\s+/).filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase());
const form = reactive({ name: '', location: '', type: 'Bedspace', description: '', floorName: '', roomName: '' });
const totalSteps = computed(() => form.type === 'Private room' ? 3 : 4);
const privateRoomSpace = reactive({ name: '', price: 0, amenities: [''], houseRules: [''], maintenance: [''] });
const bedspaceDraft = reactive({ name: '', price: 0, image: null as File | null, amenities: [''], houseRules: [''], maintenance: [''] });
const coverPhotoName = ref('');
const floorPhotoName = ref('');
const roomPhotoName = ref('');
const submitted = ref(false);
const showConfirmation = ref(false);
const showAddBedspaceConfirmation = ref(false);
const showBedspaceForm = ref(false);
const isPlacingDoor = ref(false);
const doorPosition = ref<{ row: number; column: number } | null>(null);
const selectedCell = ref<{ row: number; column: number } | null>(null);
const roomSpaces = ref<Array<{ id: number; row: number; column: number; name: string; price: number; image: File | null; amenities: string[]; houseRules: string[]; maintenance: string[] }>>([]);
const gridRows = ref(3);
const gridColumns = ref(4);
const currentStep = ref(1);
const formElement = ref<HTMLFormElement | null>(null);
const normalizedRows = computed(() => Math.max(1, Math.floor(Number(gridRows.value) || 1)));
const normalizedColumns = computed(() => Math.max(1, Math.floor(Number(gridColumns.value) || 1)));
const layoutCells = computed(() => Array.from(
  { length: normalizedRows.value * normalizedColumns.value },
  (_, index) => {
    const row = Math.floor(index / normalizedColumns.value) + 1;
    const column = (index % normalizedColumns.value) + 1;
    return {
      id: `${row}-${column}`,
      row,
      column,
      isDoor: doorPosition.value?.row === row && doorPosition.value.column === column,
      bedspaces: roomSpaces.value.filter((space) => space.row === row && space.column === column),
    };
  },
));

watch(() => form.type, () => {
  if (currentStep.value > totalSteps.value) currentStep.value = totalSteps.value;
});
watch(gridRows, (value) => {
  const occupiedRows = roomSpaces.value.reduce((maximum, space) => Math.max(maximum, space.row), doorPosition.value?.row ?? 1);
  gridRows.value = Math.max(occupiedRows, Math.floor(Number(value) || 1));
});
watch(gridColumns, (value) => {
  const occupiedColumns = roomSpaces.value.reduce((maximum, space) => Math.max(maximum, space.column), doorPosition.value?.column ?? 1);
  gridColumns.value = Math.max(occupiedColumns, Math.floor(Number(value) || 1));
});
function handleCoverPhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  coverPhotoName.value = input.files?.[0]?.name || '';
}
function handleFloorPhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  floorPhotoName.value = input.files?.[0]?.name || '';
}
function handleRoomPhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  roomPhotoName.value = input.files?.[0]?.name || '';
}
function handleBedspacePhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  bedspaceDraft.image = input.files?.[0] ?? null;
}
function goToNextStep() {
  currentStep.value += 1;
}
function handleSubmit() {
  submitted.value = true;
}
function requestBedspace(row: number, column: number) {
  selectedCell.value = { row, column };
  showAddBedspaceConfirmation.value = true;
}
function selectGridCell(row: number, column: number) {
  if (isPlacingDoor.value) {
    doorPosition.value = { row, column };
    isPlacingDoor.value = false;
    return;
  }
  requestBedspace(row, column);
}
function cancelAddBedspace() {
  showAddBedspaceConfirmation.value = false;
  selectedCell.value = null;
}
function continueToBedspaceDetails() {
  showAddBedspaceConfirmation.value = false;
  showBedspaceForm.value = true;
}
function cancelBedspaceForm() {
  showBedspaceForm.value = false;
  selectedCell.value = null;
  resetBedspaceDraft();
}
function createBedspace() {
  const cell = selectedCell.value;
  if (!cell) {
    throw new Error('Cannot create a bedspace without a selected grid cell.');
  }
  roomSpaces.value.push({
    id: Date.now(),
    row: cell.row,
    column: cell.column,
    name: bedspaceDraft.name.trim() || `Bed ${roomSpaces.value.length + 1}`,
    price: Number(bedspaceDraft.price) || 0,
    image: bedspaceDraft.image,
    amenities: bedspaceDraft.amenities.filter((item) => item.trim()),
    houseRules: bedspaceDraft.houseRules.filter((item) => item.trim()),
    maintenance: bedspaceDraft.maintenance.filter((item) => item.trim()),
  });
  showBedspaceForm.value = false;
  selectedCell.value = null;
  resetBedspaceDraft();
}
function resetBedspaceDraft() {
  bedspaceDraft.name = '';
  bedspaceDraft.price = 0;
  bedspaceDraft.image = null;
  bedspaceDraft.amenities = [''];
  bedspaceDraft.houseRules = [''];
  bedspaceDraft.maintenance = [''];
}
function openConfirmation() {
  showConfirmation.value = true;
}
function closeConfirmation() {
  showConfirmation.value = false;
}
function confirmPublish() {
  closeConfirmation();
  handleSubmit();
}
function addItem(items: string[]) {
  items.push('');
}
function removeItem(items: string[], index: number) {
  items.splice(index, 1);
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');

:global(body) {
  background: #f7f8f4;
  color: #174b35;
  font-family: 'DM Sans', sans-serif;
}

:global(*) {
  box-sizing: border-box;
}

.host-content {
  --background: #f7f8f4;
}

.host-header {
  align-items: center;
  background: #fff;
  border-bottom: 1px solid #e5ebe4;
  display: flex;
  height: 78px;
  justify-content: space-between;
  padding: 0 clamp(22px, 5vw, 74px);
}

.brand {
  align-items: center;
  color: #174b35;
  display: flex;
  font-size: 26px;
  font-weight: 700;
  gap: 8px;
  letter-spacing: -1.5px;
  text-decoration: none;
}

.brand-mark {
  height: 35px;
  width: 35px;
}

.brand-dot {
  color: #e2743e;
}

.host-nav {
  display: flex;
  gap: 28px;
}

.host-nav a {
  color: #849087;
  font-size: 11px;
  font-weight: 600;
  padding: 29px 0 25px;
  text-decoration: none;
}

.host-nav a.active {
  border-bottom: 2px solid #e2743e;
  color: #174b35;
}

.nav-count {
  background: #e2743e;
  border-radius: 10px;
  color: #fff;
  font-size: 8px;
  margin-left: 3px;
  padding: 2px 5px;
}

.host-account {
  align-items: center;
  display: flex;
  gap: 9px;
}

.avatar {
  align-items: center;
  background: #dcebdd;
  border-radius: 50%;
  color: #35744a;
  display: flex;
  font-size: 10px;
  font-weight: 700;
  height: 32px;
  justify-content: center;
  width: 32px;
}

.host-name {
  color: #174b35;
  font-size: 11px;
  font-weight: 700;
}

.host-account button {
  background: transparent;
  border: 0;
  color: #99a59d;
  cursor: pointer;
  font: inherit;
  font-size: 10px;
  margin-left: 10px;
  padding: 0;
}

.host-shell {
  margin: 0 auto;
  max-width: 930px;
  padding: 45px 32px 75px;
}

.back-link {
  color: #e2743e;
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 24px;
  text-decoration: none;
}

.page-heading {
  align-items: end;
  display: flex;
  justify-content: space-between;
}

.eyebrow {
  color: #e2743e;
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.8px;
}

.page-heading h1 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: clamp(42px, 5vw, 58px);
  letter-spacing: -2px;
  margin: 13px 0 8px;
}

.page-heading p {
  color: #849087;
  font-size: 12px;
  margin: 0;
}

.step-label {
  color: #89968d;
  font-size: 10px;
  font-weight: 700;
}

.listing-form {
  display: flex;
  flex-direction: column;
  gap: 17px;
  margin-top: 37px;
}

.form-card,
.success-card {
  background: #fff;
  border: 1px solid #e5ebe4;
  border-radius: 12px;
  padding: 25px;
}

.section-heading {
  align-items: start;
  display: flex;
  gap: 13px;
  margin-bottom: 22px;
}

.section-number {
  color: #e2743e;
  font-family: 'Playfair Display', serif;
  font-size: 19px;
}

.section-heading h2 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: 23px;
  margin: 0 0 4px;
}

.section-heading p {
  color: #89968d;
  font-size: 10px;
  margin: 0;
}

.field-grid {
  display: grid;
  gap: 15px;
  grid-template-columns: 1fr 1fr;
}

.form-card label,
fieldset legend {
  color: #174b35;
  display: flex;
  flex-direction: column;
  font-size: 10px;
  font-weight: 700;
  gap: 7px;
}

.form-card>label {
  margin-top: 17px;
}

.form-card input:not([type='checkbox']):not([type='radio']):not([type='file']),
.form-card textarea,
.form-card select {
  appearance: none;
  background: #fff;
  border: 1px solid #dfe8de;
  border-radius: 7px;
  color: #174b35;
  color-scheme: light;
  font: inherit;
  font-size: 11px;
  outline: 0;
  padding: 12px;
}

.form-card input:focus,
.form-card textarea:focus,
.form-card select:focus {
  border-color: #e2743e;
  box-shadow: 0 0 0 3px rgba(226, 116, 62, .12);
}

.listing-type {
  border: 0;
  margin: 20px 0 0;
  padding: 0;
}

.type-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.type-option {
  align-items: center;
  background: #f7f8f4;
  border: 1px solid #dfe8de;
  border-radius: 6px;
  color: #718177;
  cursor: pointer;
  flex-direction: row !important;
  font-size: 10px !important;
  font-weight: 400 !important;
  gap: 7px !important;
  padding: 10px 12px;
}

.type-option:has(input:checked) {
  background: #e5f1e4;
  border-color: #76ae80;
  color: #35744a;
  font-weight: 700 !important;
}

.type-option input {
  accent-color: #4b9b61;
  margin: 0;
}

.form-card fieldset:not(.listing-type) {
  border: 0;
  margin: 20px 0 0;
  padding: 0;
}

.detail-list legend {
  display: block;
}

.repeatable-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.repeatable-row {
  align-items: center;
  display: flex;
  gap: 8px;
}

.repeatable-row input {
  flex: 1;
  min-width: 0;
}

.remove-item {
  align-items: center;
  background: #f9ece6;
  border-radius: 50%;
  color: #c9683b;
  display: flex;
  flex: 0 0 27px;
  font-size: 18px;
  height: 27px;
  justify-content: center;
  line-height: 1;
  padding: 0;
}

.add-item {
  background: transparent;
  color: #e2743e;
  font-size: 10px;
  font-weight: 700;
  margin-top: 9px;
  padding: 0;
}

.cover-photo-field,
.floor-photo-field,
.room-photo-field {
  gap: 8px;
  margin-top: 17px;
}

.photo-field-label {
  color: #174b35;
  font-size: 10px;
  font-weight: 700;
}

.photo-dropzone {
  align-items: center;
  background: linear-gradient(135deg, #fbfdf9, #f2f8f0);
  border: 1.5px dashed #cdbf8c;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  min-height: 190px;
  padding: 25px;
  text-align: center;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}

.photo-dropzone:hover,
.photo-dropzone:focus-within {
  border-color: #e2743e;
  box-shadow: 0 8px 18px rgba(23, 75, 53, .08);
  transform: translateY(-1px);
}

.photo-dropzone input {
  display: none;
}

.photo-dropzone ion-icon {
  color: #4b9b61;
  font-size: 38px;
}

.photo-dropzone strong {
  color: #174b35;
  font-size: 12px;
}

.photo-upload-hint {
  color: #a4afa8;
  font-size: 9px;
}

.photo-dropzone small {
  color: #e2743e;
  font-size: 10px;
  font-weight: 700;
}

.upload-area {
  align-items: center;
  background: linear-gradient(135deg, #fbfdf9, #f1f8f0);
  border: 1.5px dashed #8fbd96;
  border-radius: 11px;
  cursor: pointer;
  justify-content: center;
  min-height: 190px;
  padding: 25px;
  text-align: center;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}

.upload-area:hover,
.upload-area:focus-within {
  border-color: #e2743e;
  box-shadow: 0 8px 18px rgba(23, 75, 53, .08);
  transform: translateY(-1px);
}

.upload-area input {
  display: none;
}

.upload-area ion-icon {
  color: #4b9b61;
  font-size: 34px;
}

.upload-area strong {
  color: #174b35;
  font-size: 12px;
}

.upload-area span,
.upload-area small {
  color: #89968d;
  font-size: 9px;
  font-weight: 400;
}

.upload-area small {
  color: #e2743e;
  font-weight: 700;
}

.form-actions {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.back-form-button {
  background: #f3f6f1;
  border-radius: 7px;
  color: #587065;
  font-size: 11px;
  font-weight: 700;
  padding: 13px 17px;
}

.submit-button {
  align-items: center;
  background: #e2743e;
  border-radius: 7px;
  color: #fff;
  display: flex;
  font-size: 11px;
  font-weight: 700;
  gap: 7px;
  padding: 13px 17px;
}

.success-card {
  align-items: center;
  display: flex;
  gap: 18px;
  margin-top: 40px;
}

.success-icon {
  align-items: center;
  background: #e5f1e4;
  border-radius: 50%;
  color: #4b9b61;
  display: flex;
  flex: 0 0 45px;
  font-size: 24px;
  height: 45px;
  justify-content: center;
  width: 45px;
}

.success-card h2 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: 25px;
  margin: 7px 0 5px;
}

.success-card p {
  color: #819087;
  font-size: 11px;
  margin: 0;
}

.success-card a {
  align-items: center;
  color: #e2743e;
  display: flex;
  font-size: 10px;
  font-weight: 700;
  gap: 5px;
  margin-left: auto;
  text-decoration: none;
  white-space: nowrap;
}

.dialog-backdrop {
  align-items: center;
  background: rgba(23, 75, 53, .28);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 20px;
  position: fixed;
  z-index: 10;
}

.confirmation-dialog {
  background: #fff;
  border: 1px solid #e5ebe4;
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(23, 75, 53, .18);
  max-width: 410px;
  padding: 28px;
  text-align: center;
  width: 100%;
}

.dialog-icon {
  align-items: center;
  background: #e5f1e4;
  border-radius: 50%;
  color: #4b9b61;
  display: flex;
  font-size: 24px;
  height: 48px;
  justify-content: center;
  margin: 0 auto 15px;
  width: 48px;
}

.confirmation-dialog h2 {
  color: #174b35;
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  margin: 0 0 8px;
}

.confirmation-dialog p {
  color: #819087;
  font-size: 11px;
  line-height: 1.6;
  margin: 0;
}

.dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 24px;
}

.dialog-actions button {
  border: 0;
  cursor: pointer;
}

.grid-size-fields {
  margin-bottom: 20px;
  max-width: 430px;
}

.door-controls {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: -7px 0 15px;
}

.door-placement-button,
.clear-door-button {
  align-items: center;
  border: 1px solid #dce7da;
  border-radius: 7px;
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  font-size: 10px;
  font-weight: 700;
  gap: 6px;
  padding: 9px 11px;
}

.door-placement-button {
  background: #fff3e9;
  color: #b86a3f;
}

.door-placement-button.active {
  background: #e2743e;
  border-color: #e2743e;
  color: #fff;
}

.door-placement-button ion-icon {
  font-size: 15px;
}

.clear-door-button {
  background: #f3f6f1;
  color: #587065;
}

.grid-preview-wrap {
  overflow-x: auto;
  padding: 2px 0;
}

.host-bed-grid {
  background: #f3f6f1;
  border: 1px solid #dce7da;
  border-radius: 12px;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(var(--layout-columns), minmax(78px, 1fr));
  grid-template-rows: repeat(var(--layout-rows), minmax(92px, auto));
  min-width: max(100%, calc(var(--layout-columns) * 86px));
  padding: 12px;
}

.host-grid-cell {
  align-items: center;
  background: rgba(255, 255, 255, .72);
  border: 1px dashed #cbd9cb;
  border-radius: 8px;
  color: #174b35;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  font: inherit;
  gap: 5px;
  justify-content: center;
  min-height: 92px;
  min-width: 0;
  padding: 8px 5px 16px;
  position: relative;
  transition: background .2s, border-color .2s, transform .2s;
}

.host-grid-cell:hover,
.host-grid-cell:focus-visible {
  background: #fff;
  border-color: #e2743e;
  outline: 0;
  transform: translateY(-2px);
}

.host-grid-cell.has-bedspaces {
  background: #eef6ee;
  border-style: solid;
  border-color: #9dbf9f;
}

.host-grid-cell.door-placement-target {
  cursor: crosshair;
}

.host-grid-cell.has-door {
  padding-top: 24px;
}

.host-door-marker {
  align-items: center;
  color: #e2743e;
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: absolute;
  right: 5px;
  top: 5px;
}

.host-door-marker ion-icon {
  background: #fff3e9;
  border: 1px solid #f1c7a8;
  border-radius: 5px;
  font-size: 17px;
  padding: 2px;
}

.host-door-marker small {
  color: #b86a3f;
  font-size: 7px;
  font-weight: 700;
}

.empty-cell {
  align-items: center;
  color: #71917a;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empty-cell ion-icon {
  font-size: 19px;
}

.empty-cell small {
  font-size: 9px;
}

.cell-bedspaces {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 100%;
  width: 100%;
}

.cell-bedspace {
  align-items: center;
  background: #fff;
  border: 1px solid #dce7da;
  border-radius: 5px;
  color: #35744a;
  display: flex;
  font-size: 8px;
  gap: 4px;
  justify-content: center;
  min-width: 0;
  padding: 4px;
}

.cell-bedspace ion-icon {
  flex: 0 0 auto;
  font-size: 12px;
}

.cell-bedspace span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell-position {
  bottom: 4px;
  color: #9aa79e;
  font-size: 7px;
  position: absolute;
  right: 6px;
}

.bunk-tip,
.layout-count,
.publish-hint {
  align-items: center;
  color: #718177;
  display: flex;
  font-size: 10px;
  gap: 6px;
  margin: 12px 0 0;
}

.bunk-tip ion-icon {
  color: #e2743e;
  flex: 0 0 auto;
  font-size: 15px;
}

.publish-hint {
  justify-content: flex-end;
  margin-top: -9px;
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.bedspace-dialog-backdrop {
  z-index: 11;
}

.bedspace-dialog {
  background: #fff;
  border: 1px solid #e5ebe4;
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(23, 75, 53, .18);
  max-height: min(90vh, 760px);
  max-width: 640px;
  overscroll-behavior: contain;
  overflow-y: auto;
  padding: 25px;
  scrollbar-width: none;
  width: 100%;
}

.bedspace-dialog::-webkit-scrollbar {
  display: none;
}

.bedspace-dialog .section-heading {
  margin-bottom: 18px;
}

.bedspace-photo-field {
  margin-top: 17px;
}

.bedspace-photo-dropzone {
  min-height: 120px;
  padding: 16px;
}

.bedspace-photo-dropzone ion-icon {
  font-size: 30px;
}

.bedspace-dialog label,
.bedspace-dialog fieldset legend {
  color: #174b35;
  display: flex;
  flex-direction: column;
  font-size: 10px;
  font-weight: 700;
  gap: 7px;
}

.bedspace-dialog input:not([type='checkbox']):not([type='radio']):not([type='file']) {
  appearance: none;
  background: #fff;
  border: 1px solid #dfe8de;
  border-radius: 7px;
  color: #174b35;
  font: inherit;
  font-size: 11px;
  outline: 0;
  padding: 12px;
}

.bedspace-dialog input:focus {
  border-color: #e2743e;
  box-shadow: 0 0 0 3px rgba(226, 116, 62, .12);
}

.bedspace-dialog fieldset {
  border: 0;
  margin: 20px 0 0;
  padding: 0;
}

.bedspace-dialog .detail-list legend {
  display: block;
}

.bedspace-dialog .repeatable-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.bedspace-dialog .repeatable-row {
  align-items: center;
  display: flex;
  gap: 8px;
}

.bedspace-dialog .repeatable-row input {
  flex: 1;
  min-width: 0;
}

.bedspace-dialog .remove-item {
  align-items: center;
  background: #f9ece6;
  border: 0;
  border-radius: 50%;
  color: #c9683b;
  cursor: pointer;
  display: flex;
  flex: 0 0 27px;
  font-size: 18px;
  height: 27px;
  justify-content: center;
  line-height: 1;
  padding: 0;
}

.bedspace-dialog .add-item {
  background: transparent;
  border: 0;
  color: #e2743e;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  margin-top: 9px;
  padding: 0;
}

.bedspace-dialog .detail-list {
  margin-top: 20px;
}

.bedspace-dialog .dialog-actions {
  justify-content: flex-end;
}

@media (max-width: 700px) {
  .host-header {
    height: 70px;
    padding: 0 18px;
  }

  .host-nav {
    display: none;
  }

  .host-name,
  .host-account button {
    display: none;
  }

  .host-shell {
    padding: 38px 18px 55px;
  }

  .page-heading {
    align-items: start;
    flex-direction: column;
    gap: 22px;
  }

  .form-card {
    padding: 19px 16px;
  }

  .bedspace-dialog {
    padding: 19px 16px;
  }

  .bedspace-dialog .field-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    align-items: stretch;
  }

  .submit-button {
    justify-content: center;
    width: 100%;
  }

  .success-card {
    align-items: start;
    flex-wrap: wrap;
    padding: 20px;
  }

  .success-card a {
    margin-left: 63px;
  }
}
</style>
