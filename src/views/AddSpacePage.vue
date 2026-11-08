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
          <div><span class="eyebrow">{{ isEditMode ? 'EDIT YOUR LISTING' : 'CREATE A LISTING' }}</span>
            <h1>{{ isEditMode ? 'Edit your space.' : 'Add a space.' }}</h1>
            <p>Share the details that help residents picture themselves at home.</p>
          </div><span class="step-label">STEP {{ submitted ? totalSteps : currentStep }} OF {{ totalSteps }}</span>
        </div>
        <div v-if="submitted" class="success-card" role="status"><span class="success-icon"><ion-icon
              :icon="checkmarkOutline" /></span>
          <div><span class="eyebrow">{{ isEditMode ? 'CHANGES SAVED' : 'LISTING PUBLISHED' }}</span>
            <h2>{{ isEditMode ? 'Your listing has been updated.' : 'Your listing has been published.' }}</h2>
            <p>{{ isEditMode ? 'Your listing details and space layout are up to date.' : 'Residents can now discover and book your space.' }}</p>
          </div><a href="/host/spaces">View my spaces <ion-icon :icon="arrowForwardOutline" /></a>
        </div>
        <p v-else-if="isLoadingListing" class="form-status" role="status">Loading listing details…</p>
        <form v-else ref="formElement" class="listing-form" novalidate @submit.prevent="goToNextStep">
          <p v-if="editLoadError" class="submit-error" role="alert">{{ editLoadError }}</p>
          <section v-if="currentStep === 1" class="form-card">
            <div class="section-heading"><span class="section-number">01</span>
              <div>
                <h2>Tell us about your space</h2>
                <p>Start with the basics residents need to know.</p>
              </div>
            </div>
            <div class="field-grid"><label>Space name<input v-model="form.name" required type="text" @blur="form.name = formatTextField(form.name, true)"
                  placeholder="e.g. Sage House" /></label><label>City or area<input v-model.trim="form.location"
                  required type="text" placeholder="Choose a point on the map" @blur="form.location = formatTextField(form.location, true)" /></label></div>
            <div class="location-picker">
              <div class="location-picker-heading">
                <div><strong>Pin your space on the map</strong><p>Click the map to set the location and fill in the city or area.</p></div>
                <button type="button" class="use-location-button" :disabled="isLocating" @click="useCurrentLocation">
                  {{ isLocating ? 'Finding location…' : 'Use my location' }}
                </button>
              </div>
              <div ref="locationMapElement" class="location-map" role="application" aria-label="Choose your space location by clicking on the map" />
              <p class="location-picker-status" :class="{ 'location-picker-error': locationError }" aria-live="polite">
                {{ locationError || locationStatus }}
              </p>
            </div>
            <fieldset class="listing-type">
              <legend>What are you listing?</legend>
              <div class="type-options"><label v-for="type in ['Bedspace', 'Private room']" :key="type"
                  class="type-option"><input name="listing-type" type="radio" :value="type" :checked="form.type === type"
                    @change="requestListingTypeChange(type)" />
                  <span>{{ type }}</span></label></div>
            </fieldset><label>Description<textarea v-model="form.description" required rows="4" @blur="form.description = formatTextField(form.description)"
                placeholder="Describe what makes this space special..." /></label><label class="cover-photo-field"><span
                class="photo-field-label">Cover photo</span><span class="photo-dropzone"><input type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif" @change="handleCoverPhoto" /><img v-if="coverPhotoPreview || existingListing?.coverPhotoUrl" class="photo-preview" :src="coverPhotoPreview || existingListing?.coverPhotoUrl || ''" alt="Cover photo preview" /><ion-icon v-else :icon="cloudUploadOutline" /><strong>{{
                    coverPhotoName || 'Drop cover photo here or browse' }}</strong><span class="photo-upload-hint">PNG or
                      JPG · 1 photo</span><small>{{ coverPhoto ? 'Cover photo selected' : coverPhotoName ? 'Current photo will be kept' : 'Choose cover photo'
                  }}</small></span></label>
          </section>
          <section v-if="currentStep === 2" class="form-card">
            <div class="section-heading"><span class="section-number">02</span>
              <div>
                <h2>Floor details</h2>
                <p>Give residents a clear idea of where the space is located.</p>
              </div>
            </div>
            <div class="floor-selector" aria-label="Listing floors">
              <button v-for="(floor, index) in floorDrafts" :key="floor.key" type="button"
                :class="{ active: index === activeFloorIndex }" @click="selectFloor(index)">
                {{ floor.name || `Floor ${index + 1}` }}
              </button>
              <button type="button" class="add-floor-button" @click="addFloor"><ion-icon :icon="addOutline" /> Add another floor</button>
            </div>
            <label>Floor name<input v-model="activeFloor.name" type="text" placeholder="e.g. Ground floor" @blur="activeFloor.name = formatTextField(activeFloor.name, true)" /></label>
            <label class="floor-photo-field"><span class="photo-field-label">Floor photo</span><span class="photo-dropzone"><input type="file"
              accept="image/png,image/jpeg,image/webp,image/gif" @change="handleFloorPhoto" /><img v-if="floorPhotoPreview || activeFloor.floorPhotoUrl" class="photo-preview" :src="floorPhotoPreview || activeFloor.floorPhotoUrl || ''" alt="Floor photo preview" /><ion-icon v-else :icon="cloudUploadOutline" /><strong>{{
                floorPhotoName || 'Drop floor photo here or browse' }}</strong><span class="photo-upload-hint">PNG or JPG · 1 photo</span><small>{{
                floorPhoto ? 'Floor photo selected' : floorPhotoName ? 'Current photo will be kept' : 'Choose floor photo' }}</small></span></label>
          </section>
          <section v-if="currentStep === 3" class="form-card">
            <div class="section-heading"><span class="section-number">03</span>
              <div>
                <h2>Room details</h2>
                <p>Add the room name and a photo residents can use to identify it.</p>
              </div>
            </div>
            <div class="floor-selector" aria-label="Listing floors">
              <button v-for="(floor, index) in floorDrafts" :key="floor.key" type="button"
                :class="{ active: index === activeFloorIndex }" @click="selectFloor(index)">
                {{ floor.name || `Floor ${index + 1}` }}
              </button>
            </div>
            <div class="room-selector" aria-label="Rooms on selected floor">
              <button v-for="(room, index) in activeFloor.rooms" :key="room.key" type="button"
                :class="{ active: index === activeRoomIndex }" @click="selectRoom(index)">
                {{ room.name || `Room ${index + 1}` }}
              </button>
              <button type="button" class="add-floor-button" @click="addRoom"><ion-icon :icon="addOutline" /> Add room</button>
            </div>
            <label>Room name<input v-model="activeRoom.name" type="text"
              placeholder="e.g. Sunrise Room" @blur="activeRoom.name = formatTextField(activeRoom.name, true)" /></label>
            <label class="room-photo-field"><span class="photo-field-label">Room photo</span><span class="photo-dropzone"><input type="file"
              accept="image/png,image/jpeg,image/webp,image/gif" @change="handleRoomPhoto" /><img v-if="roomPhotoPreview || activeRoom.roomPhotoUrl" class="photo-preview" :src="roomPhotoPreview || activeRoom.roomPhotoUrl || ''" alt="Room photo preview" /><ion-icon v-else :icon="cloudUploadOutline" /><strong>{{
                roomPhotoName || 'Drop room photo here or browse' }}</strong><span class="photo-upload-hint">PNG or JPG · 1 photo</span><small>{{
                roomPhoto ? 'Room photo selected' : roomPhotoName ? 'Current photo will be kept' : 'Choose room photo' }}</small></span></label>
            <template v-if="form.type === 'Private room'">
              <div class="field-grid private-room-space-details">
                <label>Monthly rent<input v-model="privateRoomRentText" required type="text" inputmode="decimal" placeholder="8,500" @input="updateRentInput($event, 'private-room')" @focus="privateRoomRentText = String(privateRoomSpace.price || '')" @blur="formatRentInput($event, 'private-room')" /></label>
              </div>
              <fieldset class="detail-list">
                <legend>Amenities included</legend>
                <div class="repeatable-list">
                  <div v-for="(_, index) in privateRoomSpace.amenities" :key="`private-amenity-${index}`" class="repeatable-row">
                    <input v-model="privateRoomSpace.amenities[index]" type="text" placeholder="e.g. Wi-Fi" :aria-label="`Amenity ${index + 1}`" @blur="privateRoomSpace.amenities[index] = formatTextField(privateRoomSpace.amenities[index])" />
                    <button v-if="privateRoomSpace.amenities.length > 1" type="button" class="remove-item" :aria-label="`Remove amenity ${index + 1}`" @click="removeItem(privateRoomSpace.amenities, index)">×</button>
                  </div>
                </div>
                <button type="button" class="add-item" @click="addItem(privateRoomSpace.amenities)">+ Add another amenity</button>
              </fieldset>
              <fieldset class="detail-list">
                <legend>House rules</legend>
                <div class="repeatable-list">
                  <div v-for="(_, index) in privateRoomSpace.houseRules" :key="`private-rule-${index}`" class="repeatable-row">
                    <input v-model="privateRoomSpace.houseRules[index]" type="text" placeholder="e.g. Quiet hours after 10 PM" :aria-label="`House rule ${index + 1}`" @blur="privateRoomSpace.houseRules[index] = formatTextField(privateRoomSpace.houseRules[index])" />
                    <button v-if="privateRoomSpace.houseRules.length > 1" type="button" class="remove-item" :aria-label="`Remove house rule ${index + 1}`" @click="removeItem(privateRoomSpace.houseRules, index)">×</button>
                  </div>
                </div>
                <button type="button" class="add-item" @click="addItem(privateRoomSpace.houseRules)">+ Add another house rule</button>
              </fieldset>
              <fieldset class="detail-list">
                <legend>Maintenance history</legend>
                <div class="repeatable-list">
                  <div v-for="(_, index) in privateRoomSpace.maintenance" :key="`private-maintenance-${index}`" class="repeatable-row">
                    <input v-model="privateRoomSpace.maintenance[index]" type="text" placeholder="e.g. Room deep-cleaned and sanitized" :aria-label="`Maintenance entry ${index + 1}`" @blur="privateRoomSpace.maintenance[index] = formatTextField(privateRoomSpace.maintenance[index])" />
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
                <p>Set the room grid, then select a cell to add or update a bedspace.</p>
              </div>
            </div>
            <div class="floor-selector" aria-label="Listing floors">
              <button v-for="(floor, index) in floorDrafts" :key="floor.key" type="button"
                :class="{ active: index === activeFloorIndex }" @click="selectFloor(index)">
                {{ floor.name || `Floor ${index + 1}` }}
              </button>
            </div>
            <div class="room-selector" aria-label="Rooms on selected floor">
              <button v-for="(room, index) in activeFloor.rooms" :key="room.key" type="button"
                :class="{ active: index === activeRoomIndex }" @click="selectRoom(index)">
                {{ room.name || `Room ${index + 1}` }}
              </button>
              <button type="button" class="add-floor-button" @click="addRoom"><ion-icon :icon="addOutline" /> Add room</button>
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
                <div v-for="cell in layoutCells" :key="cell.id" class="host-grid-cell" role="button" tabindex="0"
                  :class="{ 'has-bedspaces': cell.bedspaces.length, 'has-door': cell.isDoor, 'door-placement-target': isPlacingDoor }"
                  :aria-label="`Row ${cell.row}, column ${cell.column}${cell.isDoor ? ', door' : ''}${cell.bedspaces.length ? `, ${cell.bedspaces.length} bedspaces` : ', empty'}`"
                  @click="selectGridCell(cell.row, cell.column)" @keydown.enter="selectGridCell(cell.row, cell.column)">
                  <span v-if="cell.isDoor" class="host-door-marker" aria-label="Door position"><ion-icon :icon="enterOutline" /><small>Door</small></span>
                  <TransitionGroup v-if="cell.bedspaces.length" name="bed-item" tag="span" class="cell-bedspaces">
                    <span v-for="space in cell.bedspaces" :key="space.id" class="cell-bedspace">
                      <ion-icon :icon="bedOutline" /><span>{{ space.name || 'Bedspace' }}</span>
                      <button type="button" class="edit-bedspace-button" :aria-label="`Edit ${space.name || 'bedspace'}`" @click.stop="editBedspace(space)" @keydown.enter.stop>Edit</button>
                    </span>
                  </TransitionGroup>
                  <span v-else class="empty-cell"><ion-icon :icon="addOutline" /><small>Add bedspace</small></span>
                  <small class="cell-position">{{ cell.row }}, {{ cell.column }}</small>
                </div>
              </div>
              <p class="bunk-tip"><ion-icon :icon="informationCircleOutline" /> Add another bedspace to the same grid cell to create a bunk bed.</p>
            </div>
            <p class="layout-count">{{ roomSpaces.length }} bedspace{{ roomSpaces.length === 1 ? '' : 's' }} added</p>
          </section>
          <div class="form-actions"><button v-if="currentStep > 1" class="back-form-button" type="button"
              @click="currentStep--">Back</button><button v-if="currentStep < totalSteps" class="submit-button" type="button"
              @click="goToNextStep">Continue <ion-icon :icon="arrowForwardOutline" /></button><button v-else
              class="submit-button" type="button" :disabled="!allFloorsReady" @click="openConfirmation">{{ isEditMode ? 'Save changes' : 'Publish listing' }} <ion-icon :icon="arrowForwardOutline" /></button></div>
          <p v-if="currentStep === totalSteps && !allFloorsReady" class="publish-hint">
            {{ form.type === 'Bedspace' ? 'Add at least one correctly priced bedspace to every room before publishing.' : 'Enter a monthly rent for every room before publishing.' }}
          </p>
        </form>
        <Transition name="dialog">
        <div v-if="showTypeSwitchConfirmation" class="dialog-backdrop type-switch-backdrop" role="presentation" @click.self="cancelTypeSwitch">
          <section class="confirmation-dialog type-switch-dialog" role="alertdialog" aria-modal="true" aria-labelledby="type-switch-title">
            <span class="dialog-icon warning-icon"><ion-icon :icon="informationCircleOutline" /></span>
            <h2 id="type-switch-title">Switch listing type?</h2>
            <p>Switching from {{ form.type }} to {{ pendingListingType }} will reset this listing’s room and bed layout. Existing bookings for those spaces will be permanently deleted when you save. You can create new bookable spaces before saving.</p>
            <div class="dialog-actions">
              <button type="button" class="back-form-button" @click="cancelTypeSwitch">Keep current type</button>
              <button type="button" class="submit-button destructive-confirm" @click="confirmTypeSwitch">Reset and switch</button>
            </div>
          </section>
        </div>
        </Transition>
        <Transition name="dialog">
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
        </Transition>
        <Transition name="dialog">
        <div v-if="showBedspaceForm" class="dialog-backdrop bedspace-dialog-backdrop" role="presentation" @click.self="cancelBedspaceForm">
          <section class="bedspace-dialog" role="dialog" aria-modal="true" aria-labelledby="bedspace-dialog-title">
            <div class="section-heading"><span class="section-number">05</span><div>
              <h2 id="bedspace-dialog-title">Bedspace details</h2>
              <p>{{ editingBedspaceId === null ? 'For' : 'Editing' }} grid cell {{ selectedCell?.row }}, {{ selectedCell?.column }}</p>
            </div></div>
            <div class="field-grid">
              <label>Bedspace name<input v-model="bedspaceDraft.name" type="text" placeholder="e.g. Bed A" @blur="bedspaceDraft.name = formatTextField(bedspaceDraft.name, true)" /></label>
              <label>Monthly rent<input v-model="bedspaceRentText" required type="text" inputmode="decimal" placeholder="8,500" @input="updateRentInput($event, 'bedspace')" @focus="bedspaceRentText = String(bedspaceDraft.price || '')" @blur="formatRentInput($event, 'bedspace')" /></label>
            </div>
            <label class="bedspace-photo-field"><span class="photo-field-label">Bedspace photo</span><span class="photo-dropzone bedspace-photo-dropzone">
              <input type="file"               accept="image/png,image/jpeg,image/webp,image/gif" @change="handleBedspacePhoto" />
              <img v-if="bedspacePhotoPreview || bedspaceDraft.photoUrl" class="photo-preview" :src="bedspacePhotoPreview || bedspaceDraft.photoUrl || ''" alt="Bedspace photo preview" /><ion-icon v-else :icon="cloudUploadOutline" /><strong>{{ bedspaceDraft.image?.name || (bedspaceDraft.photoUrl ? 'Current photo saved' : 'Drop bedspace photo here or browse') }}</strong>
              <span class="photo-upload-hint">PNG or JPG · 1 photo</span>
              <small>{{ bedspaceDraft.image ? 'Bedspace photo selected' : bedspaceDraft.photoUrl ? 'Current photo will be kept' : 'Choose bedspace photo' }}</small>
            </span></label>
            <fieldset class="detail-list">
              <legend>Amenities included</legend>
              <div class="repeatable-list">
                <div v-for="(_, index) in bedspaceDraft.amenities" :key="`amenity-${index}`" class="repeatable-row">
                  <input v-model="bedspaceDraft.amenities[index]" type="text" placeholder="e.g. Wi-Fi" :aria-label="`Amenity ${index + 1}`" @blur="bedspaceDraft.amenities[index] = formatTextField(bedspaceDraft.amenities[index])" />
                  <button v-if="bedspaceDraft.amenities.length > 1" type="button" class="remove-item" :aria-label="`Remove amenity ${index + 1}`" @click="removeItem(bedspaceDraft.amenities, index)">×</button>
                </div>
              </div>
              <button type="button" class="add-item" @click="addItem(bedspaceDraft.amenities)">+ Add another amenity</button>
            </fieldset>
            <fieldset class="detail-list">
              <legend>House rules</legend>
              <div class="repeatable-list">
                <div v-for="(_, index) in bedspaceDraft.houseRules" :key="`rule-${index}`" class="repeatable-row">
                  <input v-model="bedspaceDraft.houseRules[index]" type="text" placeholder="e.g. Quiet hours after 10 PM" :aria-label="`House rule ${index + 1}`" @blur="bedspaceDraft.houseRules[index] = formatTextField(bedspaceDraft.houseRules[index])" />
                  <button v-if="bedspaceDraft.houseRules.length > 1" type="button" class="remove-item" :aria-label="`Remove house rule ${index + 1}`" @click="removeItem(bedspaceDraft.houseRules, index)">×</button>
                </div>
              </div>
              <button type="button" class="add-item" @click="addItem(bedspaceDraft.houseRules)">+ Add another house rule</button>
            </fieldset>
            <fieldset class="detail-list">
              <legend>Maintenance history</legend>
              <div class="repeatable-list">
                <div v-for="(_, index) in bedspaceDraft.maintenance" :key="`maintenance-${index}`" class="repeatable-row">
                  <input v-model="bedspaceDraft.maintenance[index]" type="text" placeholder="e.g. Bed frame checked and tightened" :aria-label="`Maintenance entry ${index + 1}`" @blur="bedspaceDraft.maintenance[index] = formatTextField(bedspaceDraft.maintenance[index])" />
                  <button v-if="bedspaceDraft.maintenance.length > 1" type="button" class="remove-item" :aria-label="`Remove maintenance entry ${index + 1}`" @click="removeItem(bedspaceDraft.maintenance, index)">×</button>
                </div>
              </div>
              <button type="button" class="add-item" @click="addItem(bedspaceDraft.maintenance)">+ Add maintenance entry</button>
            </fieldset>
            <div class="dialog-actions">
              <button type="button" class="back-form-button" @click="cancelBedspaceForm">Cancel</button>
              <button type="button" class="submit-button" @click="createBedspace">{{ editingBedspaceId === null ? 'Add bedspace' : 'Save bedspace' }}</button>
            </div>
            <p v-if="bedspaceError" class="submit-error" role="alert">{{ bedspaceError }}</p>
          </section>
        </div>
        </Transition>
        <Transition name="dialog">
        <div v-if="showConfirmation" class="dialog-backdrop" role="presentation" @click.self="closeConfirmation">
          <section class="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="publish-dialog-title">
            <span class="dialog-icon"><ion-icon :icon="checkmarkOutline" /></span>
            <h2 id="publish-dialog-title">{{ isEditMode ? 'Save listing changes?' : 'Publish this listing?' }}</h2>
            <p>{{ isEditMode ? 'Your existing listing will be updated with these details.' : 'Once published, residents will be able to view your listing and request to book it.' }}</p>
            <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>
            <div class="dialog-actions">
              <button type="button" class="back-form-button" :disabled="isSubmitting" @click="closeConfirmation">Cancel</button>
              <button type="button" class="submit-button" :disabled="isSubmitting" @click="confirmPublish">{{ isSubmitting ? (isEditMode ? 'Saving…' : 'Publishing…') : (isEditMode ? 'Save changes' : 'Publish listing') }}</button>
            </div>
          </section>
        </div>
        </Transition>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { IonContent, IonIcon, IonPage } from '@ionic/vue';
import { useRoute } from 'vue-router';
import L, { type Map as LeafletMap, type Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { addOutline, arrowForwardOutline, bedOutline, checkmarkOutline, cloudUploadOutline, enterOutline, informationCircleOutline } from 'ionicons/icons';
import { useLogout } from '../composables/useLogout';
import { useAuthUser } from '../composables/useAuthUser';
import { getSupabaseClient } from '../lib/supabase';

const { logout } = useLogout();
const { user } = useAuthUser();
const route = useRoute();
const displayName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || 'Host');
const initials = computed(() => displayName.value.split(/\s+/).filter(Boolean).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase());
const requestedEditId = Number(route.query.edit);
const isEditMode = Number.isSafeInteger(requestedEditId) && requestedEditId > 0;
const editSpaceId = isEditMode ? requestedEditId : null;
const form = reactive({ name: '', location: '', type: 'Bedspace', description: '' });
const locationCoordinates = ref<{ latitude: number; longitude: number } | null>(null);
const locationMapElement = ref<HTMLDivElement | null>(null);
const locationStatus = ref('Loading map…');
const locationError = ref('');
const isLocating = ref(false);
let locationMap: LeafletMap | null = null;
let locationMarker: Marker | null = null;
let reverseGeocodeController: AbortController | null = null;
let reverseGeocodeTimer: ReturnType<typeof setTimeout> | undefined;
let hasSelectedLocation = false;
const totalSteps = computed(() => form.type === 'Private room' ? 3 : 4);
const bedspaceDraft = reactive({ name: '', price: 0, image: null as File | null, photoUrl: null as string | null, amenities: [''], houseRules: [''], maintenance: [''] });
const privateRoomRentText = ref('');
const bedspaceRentText = ref('');
type BedspaceDraft = { id: number; row: number; column: number; name: string; price: number; image: File | null; photoUrl?: string | null; amenities: string[]; houseRules: string[]; maintenance: string[] };
type RoomDraft = {
  key: number;
  name: string;
  roomPhoto: File | null;
  roomPhotoUrl: string | null;
  roomPhotoName: string;
  privateRoomSpace: { price: number; amenities: string[]; houseRules: string[]; maintenance: string[] };
  bedspaces: BedspaceDraft[];
  gridRows: number;
  gridColumns: number;
  doorPosition: { row: number; column: number } | null;
  roomId?: number;
  bedspaceIds: number[];
};
type FloorDraft = {
  key: number;
  name: string;
  floorPhoto: File | null;
  floorPhotoUrl: string | null;
  floorPhotoName: string;
  floorId?: number;
  rooms: RoomDraft[];
};
function createRoomDraft(key = Date.now()): RoomDraft {
  return {
    key,
    name: '',
    roomPhoto: null,
    roomPhotoUrl: null,
    roomPhotoName: '',
    privateRoomSpace: { price: 0, amenities: [''], houseRules: [''], maintenance: [''] },
    bedspaces: [],
    gridRows: 3,
    gridColumns: 4,
    doorPosition: null,
    bedspaceIds: [],
  };
}
function createFloorDraft(key = Date.now()): FloorDraft {
  return {
    key,
    name: '',
    floorPhoto: null,
    floorPhotoUrl: null,
    floorPhotoName: '',
    rooms: [createRoomDraft(key + 1)],
  };
}
const floorDrafts = ref<FloorDraft[]>([createFloorDraft()]);
const activeFloorIndex = ref(0);
const activeFloor = computed(() => floorDrafts.value[activeFloorIndex.value]);
const activeRoomIndex = ref(0);
const activeRoom = computed(() => activeFloor.value.rooms[activeRoomIndex.value]);
const privateRoomSpace = computed(() => activeRoom.value.privateRoomSpace);
const floorPhoto = computed({
  get: () => activeFloor.value.floorPhoto,
  set: (value: File | null) => { activeFloor.value.floorPhoto = value; },
});
const floorPhotoName = computed({
  get: () => activeFloor.value.floorPhotoName,
  set: (value: string) => { activeFloor.value.floorPhotoName = value; },
});
const roomPhoto = computed({
  get: () => activeRoom.value.roomPhoto,
  set: (value: File | null) => { activeRoom.value.roomPhoto = value; },
});
const roomPhotoName = computed({
  get: () => activeRoom.value.roomPhotoName,
  set: (value: string) => { activeRoom.value.roomPhotoName = value; },
});
const roomSpaces = computed({
  get: () => activeRoom.value.bedspaces,
  set: (value: BedspaceDraft[]) => { activeRoom.value.bedspaces = value; },
});
const gridRows = computed({
  get: () => activeRoom.value.gridRows,
  set: (value: number) => { activeRoom.value.gridRows = value; },
});
const gridColumns = computed({
  get: () => activeRoom.value.gridColumns,
  set: (value: number) => { activeRoom.value.gridColumns = value; },
});
const doorPosition = computed({
  get: () => activeRoom.value.doorPosition,
  set: (value: { row: number; column: number } | null) => { activeRoom.value.doorPosition = value; },
});
const coverPhoto = ref<File | null>(null);
const coverPhotoPreview = ref('');
const floorPhotoPreview = ref('');
const roomPhotoPreview = ref('');
const bedspacePhotoPreview = ref('');
const coverPhotoName = ref('');
const submitted = ref(false);
const isLoadingListing = ref(isEditMode);
const editLoadError = ref('');
const existingListing = ref<{
  id: number;
  coverPhotoUrl: string | null;
  floorIds: number[];
  originalType: string;
} | null>(null);
const showConfirmation = ref(false);
const isSubmitting = ref(false);
const submitError = ref('');
const bedspaceError = ref('');
const showAddBedspaceConfirmation = ref(false);
const showBedspaceForm = ref(false);
const showTypeSwitchConfirmation = ref(false);
const pendingListingType = ref<string | null>(null);
const resetExistingLayout = ref(false);
const isPlacingDoor = ref(false);
const selectedCell = ref<{ row: number; column: number } | null>(null);
const editingBedspaceId = ref<number | null>(null);
const currentStep = ref(1);
const formElement = ref<HTMLFormElement | null>(null);
const normalizedRows = computed(() => Math.max(1, Math.floor(Number(gridRows.value) || 1)));
const normalizedColumns = computed(() => Math.max(1, Math.floor(Number(gridColumns.value) || 1)));
const allFloorsReady = computed(() => floorDrafts.value.length > 0 && floorDrafts.value.every((floor) =>
  floor.rooms.length > 0 && floor.rooms.every((room) =>
  form.type === 'Private room'
    ? Number.isFinite(Number(room.privateRoomSpace.price)) && room.privateRoomSpace.price >= 1
    : room.bedspaces.length > 0 && room.bedspaces.every((space) => Number.isFinite(space.price) && space.price >= 1))));
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
async function loadListingForEdit(spaceId: number) {
  try {
    const client = getSupabaseClient();
    const { data: { user: host }, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!host) throw new Error('Sign in again before editing your listing.');
    const { data, error } = await client.from('spaces').select(`
      id, host_id, name, location, type, description, monthly_rent, cover_photo_url, latitude, longitude,
      floors(id, name, photo_url, rooms(
        id, name, photo_url, monthly_rent, amenities, house_rules, maintenance, grid_rows, grid_columns,
        door_row, door_column, bedspaces(id, name, price, row, column_index, photo_url, amenities, house_rules, maintenance)
      ))
    `).eq('id', spaceId).eq('host_id', host.id).single();
    if (error) throw error;
    if (!data) throw new Error('That listing could not be found.');

    const floors = data.floors ?? [];
    if (!floors.length || floors.some((floor: { rooms: unknown[] }) => floor.rooms.length === 0)) {
      throw new Error('This listing must have at least one room on every floor before it can be edited.');
    }
    form.name = data.name;
    form.location = data.location;
    form.type = data.type;
    form.description = data.description;
    floorDrafts.value = floors.map((floor: {
      id: number;
      name: string;
      photo_url: string | null;
      rooms: Array<{
        id: number;
        name: string;
        photo_url: string | null;
        monthly_rent: number | null;
        amenities: string[] | null;
        house_rules: string[] | null;
        maintenance: string[] | null;
        grid_rows: number;
        grid_columns: number;
        door_row: number | null;
        door_column: number | null;
        bedspaces: Array<{
          id: number;
          row: number;
          column_index: number;
          name: string;
          price: number;
          photo_url: string | null;
          amenities: string[] | null;
          house_rules: string[] | null;
          maintenance: string[] | null;
        }>;
      }>;
    }, index: number) => {
      return {
        ...createFloorDraft(index + 1),
        key: floor.id,
        name: floor.name,
        floorPhotoUrl: floor.photo_url,
        floorPhotoName: floor.photo_url ? 'Current floor photo saved' : '',
        floorId: floor.id,
        rooms: floor.rooms.map((room, roomIndex) => ({
          ...createRoomDraft(floor.id + roomIndex + 1),
          name: room.name,
          roomPhotoUrl: room.photo_url,
          roomPhotoName: room.photo_url ? 'Current room photo saved' : '',
          privateRoomSpace: {
            price: Number(room.monthly_rent ?? data.monthly_rent),
            amenities: room.amenities?.length ? [...room.amenities] : [''],
            houseRules: room.house_rules?.length ? [...room.house_rules] : [''],
            maintenance: room.maintenance?.length ? [...room.maintenance] : [''],
          },
          bedspaces: room.bedspaces.map((bedspace) => ({
            id: bedspace.id,
            row: bedspace.row,
            column: bedspace.column_index,
            name: bedspace.name,
            price: Number(bedspace.price),
            image: null,
            photoUrl: bedspace.photo_url,
            amenities: [...(bedspace.amenities ?? [])],
            houseRules: [...(bedspace.house_rules ?? [])],
            maintenance: [...(bedspace.maintenance ?? [])],
          })),
          gridRows: room.grid_rows,
          gridColumns: room.grid_columns,
          doorPosition: room.door_row !== null && room.door_column !== null
            ? { row: room.door_row, column: room.door_column }
            : null,
          roomId: room.id,
          bedspaceIds: room.bedspaces.map((bedspace) => bedspace.id),
        })),
      };
    });
    activeFloorIndex.value = 0;
    activeRoomIndex.value = 0;
    privateRoomRentText.value = formatRent(privateRoomSpace.value.price);
    existingListing.value = {
      id: data.id,
      coverPhotoUrl: data.cover_photo_url,
      floorIds: floorDrafts.value.map((floor) => floor.floorId).filter((id): id is number => id !== undefined),
      originalType: data.type,
    };
    coverPhotoName.value = data.cover_photo_url ? 'Current cover photo saved' : '';
    if (data.latitude !== null && data.longitude !== null) {
      locationCoordinates.value = { latitude: Number(data.latitude), longitude: Number(data.longitude) };
      hasSelectedLocation = true;
      locationStatus.value = 'Saved listing location loaded.';
    }
  } catch (error) {
    editLoadError.value = error instanceof Error ? error.message : 'Unable to load this listing for editing.';
  } finally {
    isLoadingListing.value = false;
  }
}
onMounted(async () => {
  if (isEditMode && editSpaceId !== null) await loadListingForEdit(editSpaceId);
  await nextTick(initializeLocationMap);
});
onBeforeUnmount(() => {
  if (reverseGeocodeTimer) clearTimeout(reverseGeocodeTimer);
  reverseGeocodeController?.abort();
  locationMap?.remove();
  [coverPhotoPreview, floorPhotoPreview, roomPhotoPreview, bedspacePhotoPreview].forEach(revokePhotoPreview);
});
watch(currentStep, async (step) => {
  if (step === 1) {
    await nextTick();
    initializeLocationMap();
  } else {
    locationMap?.remove();
    locationMap = null;
    locationMarker = null;
  }
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
  coverPhoto.value = input.files?.[0] ?? null;
  coverPhotoName.value = coverPhoto.value?.name || '';
  setPhotoPreview(coverPhotoPreview, coverPhoto.value);
}
function handleFloorPhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  floorPhoto.value = input.files?.[0] ?? null;
  floorPhotoName.value = floorPhoto.value?.name || '';
  setPhotoPreview(floorPhotoPreview, floorPhoto.value);
}
function handleRoomPhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  roomPhoto.value = input.files?.[0] ?? null;
  roomPhotoName.value = roomPhoto.value?.name || '';
  setPhotoPreview(roomPhotoPreview, roomPhoto.value);
}
function handleBedspacePhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  bedspaceDraft.image = input.files?.[0] ?? null;
  setPhotoPreview(bedspacePhotoPreview, bedspaceDraft.image);
}
function setPhotoPreview(preview: { value: string }, file: File | null) {
  revokePhotoPreview(preview);
  preview.value = file ? URL.createObjectURL(file) : '';
}
function revokePhotoPreview(preview: { value: string }) {
  if (preview.value.startsWith('blob:')) URL.revokeObjectURL(preview.value);
  preview.value = '';
}
function formatTextField(value: string, titleCase = false): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!titleCase) return normalized;
  return normalized.replace(/(^|[\s-])([^\s-]+)/g, (_match, separator: string, word: string) => {
    if (/^[A-Z\d]{2,4}$/.test(word)) return `${separator}${word}`;
    return `${separator}${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
  });
}
function formatRent(value: number): string {
  return Number.isFinite(value) && value > 0
    ? new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(value)
    : '';
}
function updateRentInput(event: Event, field: 'private-room' | 'bedspace') {
  const input = event.target as HTMLInputElement;
  const sanitized = input.value.replace(/[^\d.]/g, '');
  const decimalIndex = sanitized.indexOf('.');
  const clean = decimalIndex === -1
    ? sanitized
    : `${sanitized.slice(0, decimalIndex)}.${sanitized.slice(decimalIndex + 1).replace(/\./g, '').slice(0, 2)}`;
  if (field === 'private-room') {
    privateRoomRentText.value = clean;
    privateRoomSpace.value.price = Number(clean) || 0;
  } else {
    bedspaceRentText.value = clean;
    bedspaceDraft.price = Number(clean) || 0;
  }
}
function formatRentInput(event: Event, field: 'private-room' | 'bedspace') {
  const input = event.target as HTMLInputElement;
  const price = field === 'private-room' ? privateRoomSpace.value.price : bedspaceDraft.price;
  const formatted = formatRent(price);
  if (field === 'private-room') privateRoomRentText.value = formatted;
  else bedspaceRentText.value = formatted;
  input.value = formatted;
}
function initializeLocationMap() {
  if (!locationMapElement.value || locationMap) return;
  locationMap = L.map(locationMapElement.value).setView([12.8797, 121.774], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(locationMap);
  locationMap.on('click', (event: L.LeafletMouseEvent) => setLocationPin(event.latlng, true));
  if (locationCoordinates.value) {
    setLocationPin(L.latLng(locationCoordinates.value.latitude, locationCoordinates.value.longitude), false);
    locationMap.setView([locationCoordinates.value.latitude, locationCoordinates.value.longitude], 15);
  } else {
    locationStatus.value = 'Click the map to choose your space location.';
    useCurrentLocation();
  }
  void nextTick(() => locationMap?.invalidateSize());
}
function setLocationPin(position: L.LatLng, lookupArea: boolean) {
  if (!locationMap) return;
  const coordinates = { latitude: position.lat, longitude: position.lng };
  locationCoordinates.value = coordinates;
  hasSelectedLocation = true;
  locationError.value = '';
  locationStatus.value = 'Location selected.';
  if (!locationMarker) {
    locationMarker = L.marker(position, {
      draggable: true,
      icon: L.divIcon({
        className: 'space-location-marker',
        html: '<span></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
    }).addTo(locationMap);
    locationMarker.on('dragend', () => {
      if (locationMarker) setLocationPin(locationMarker.getLatLng(), true);
    });
  } else {
    locationMarker.setLatLng(position);
  }
  if (lookupArea) scheduleAreaLookup(coordinates);
}
function scheduleAreaLookup(coordinates: { latitude: number; longitude: number }) {
  if (reverseGeocodeTimer) clearTimeout(reverseGeocodeTimer);
  reverseGeocodeController?.abort();
  locationStatus.value = 'Finding city or area…';
  reverseGeocodeTimer = setTimeout(() => {
    void lookupArea(coordinates);
  }, 800);
}
async function lookupArea(coordinates: { latitude: number; longitude: number }) {
  const controller = new AbortController();
  reverseGeocodeController = controller;
  try {
    const query = new URLSearchParams({
      format: 'jsonv2',
      lat: String(coordinates.latitude),
      lon: String(coordinates.longitude),
      zoom: '18',
      addressdetails: '1',
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Location lookup failed (${response.status}).`);
    const result = await response.json() as { address?: Record<string, string> };
    const selectedCoordinates = locationCoordinates.value;
    if (!selectedCoordinates
      || selectedCoordinates.latitude !== coordinates.latitude
      || selectedCoordinates.longitude !== coordinates.longitude) return;
    const address = result.address ?? {};
    const street = [address.house_number, address.road || address.residential || address.pedestrian]
      .filter(Boolean)
      .join(' ');
    const area = address.suburb
      || address.neighbourhood
      || address.city_district
      || address.village
      || address.town
      || address.city
      || address.municipality
      || address.county;
    const city = address.city || address.town || address.municipality || address.village || address.county;
    const location = [street, area, city]
      .filter((part, index, parts) => part && parts.indexOf(part) === index)
      .join(', ');
    if (!location) throw new Error('No city or area was found for this map point.');
    form.location = location;
    locationStatus.value = `Area set to ${location}.`;
  } catch (error) {
    if (controller.signal.aborted) return;
    locationError.value = error instanceof Error ? error.message : 'Unable to find the city or area for this map point.';
    locationStatus.value = 'Your map pin is saved; you can still continue.';
  }
}
function useCurrentLocation() {
  if (!navigator.geolocation) {
    locationError.value = 'Location access is not available in this browser. Click the map to choose a point.';
    return;
  }
  isLocating.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      isLocating.value = false;
      const coordinates = L.latLng(position.coords.latitude, position.coords.longitude);
      locationMap?.setView(coordinates, 15);
      setLocationPin(coordinates, true);
    },
    () => {
      isLocating.value = false;
      if (hasSelectedLocation) return;
      locationError.value = 'Could not access your location. Click the map to choose a point.';
      locationStatus.value = 'Map centered on the Philippines.';
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
  );
}
function goToNextStep() {
  if (currentStep.value === 1 && !locationCoordinates.value) {
    locationError.value = 'Choose your space location on the map before continuing.';
    return;
  }
  if (!formElement.value?.reportValidity()) return;
  currentStep.value += 1;
}
function selectFloor(index: number) {
  if (index < 0 || index >= floorDrafts.value.length || index === activeFloorIndex.value) return;
  activeFloorIndex.value = index;
  activeRoomIndex.value = 0;
  syncActiveRoomEditor();
}
function selectRoom(index: number) {
  if (index < 0 || index >= activeFloor.value.rooms.length || index === activeRoomIndex.value) return;
  activeRoomIndex.value = index;
  syncActiveRoomEditor();
}
function syncActiveRoomEditor() {
  privateRoomRentText.value = formatRent(privateRoomSpace.value.price);
  setPhotoPreview(floorPhotoPreview, floorPhoto.value);
  setPhotoPreview(roomPhotoPreview, roomPhoto.value);
  resetBedspaceDraft();
  bedspaceError.value = '';
  showBedspaceForm.value = false;
  editingBedspaceId.value = null;
}
function addFloor() {
  const nextFloor = createFloorDraft(Date.now() + floorDrafts.value.length);
  nextFloor.name = `Floor ${floorDrafts.value.length + 1}`;
  floorDrafts.value.push(nextFloor);
  selectFloor(floorDrafts.value.length - 1);
}
function addRoom() {
  const nextRoom = createRoomDraft(Date.now() + activeFloor.value.rooms.length);
  activeFloor.value.rooms.push(nextRoom);
  selectRoom(activeFloor.value.rooms.length - 1);
}
function requestBedspace(row: number, column: number) {
  selectedCell.value = { row, column };
  showAddBedspaceConfirmation.value = true;
}
function requestListingTypeChange(type: string) {
  if (type === form.type) return;
  pendingListingType.value = type;
  if (isEditMode && existingListing.value) {
    showTypeSwitchConfirmation.value = true;
    return;
  }
  applyListingTypeChange(type);
}
function applyListingTypeChange(type: string) {
  form.type = type;
  floorDrafts.value = [createFloorDraft()];
  activeFloorIndex.value = 0;
  activeRoomIndex.value = 0;
  isPlacingDoor.value = false;
  setPhotoPreview(floorPhotoPreview, null);
  setPhotoPreview(roomPhotoPreview, null);
  privateRoomRentText.value = '';
  resetBedspaceDraft();
  if (isEditMode) resetExistingLayout.value = true;
}
function cancelTypeSwitch() {
  showTypeSwitchConfirmation.value = false;
  pendingListingType.value = null;
}
function confirmTypeSwitch() {
  if (!pendingListingType.value) return;
  applyListingTypeChange(pendingListingType.value);
  showTypeSwitchConfirmation.value = false;
  pendingListingType.value = null;
}
function selectGridCell(row: number, column: number) {
  if (isPlacingDoor.value) {
    doorPosition.value = { row, column };
    isPlacingDoor.value = false;
    return;
  }
  requestBedspace(row, column);
}
function editBedspace(space: (typeof roomSpaces.value)[number]) {
  selectedCell.value = { row: space.row, column: space.column };
  editingBedspaceId.value = space.id;
  bedspaceDraft.name = space.name;
  bedspaceDraft.price = space.price;
  bedspaceRentText.value = String(space.price);
  bedspaceDraft.image = null;
  bedspaceDraft.photoUrl = space.photoUrl ?? null;
  setPhotoPreview(bedspacePhotoPreview, space.image);
  bedspaceDraft.amenities = space.amenities.length ? [...space.amenities] : [''];
  bedspaceDraft.houseRules = space.houseRules.length ? [...space.houseRules] : [''];
  bedspaceDraft.maintenance = space.maintenance.length ? [...space.maintenance] : [''];
  showBedspaceForm.value = true;
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
  editingBedspaceId.value = null;
  bedspaceError.value = '';
  resetBedspaceDraft();
}
function createBedspace() {
  const cell = selectedCell.value;
  if (!cell) {
    throw new Error('Cannot create a bedspace without a selected grid cell.');
  }
  if (!Number.isFinite(Number(bedspaceDraft.price)) || Number(bedspaceDraft.price) < 1) {
    bedspaceError.value = 'Enter a monthly rent greater than zero.';
    return;
  }
  const updatedBedspace = {
    row: cell.row,
    column: cell.column,
    name: bedspaceDraft.name.trim() || `Bed ${roomSpaces.value.length + 1}`,
    price: Number(bedspaceDraft.price) || 0,
    image: bedspaceDraft.image,
    photoUrl: bedspaceDraft.photoUrl,
    amenities: bedspaceDraft.amenities.filter((item) => item.trim()),
    houseRules: bedspaceDraft.houseRules.filter((item) => item.trim()),
    maintenance: bedspaceDraft.maintenance.filter((item) => item.trim()),
  };
  const editingSpace = roomSpaces.value.find((space) => space.id === editingBedspaceId.value);
  if (editingSpace) Object.assign(editingSpace, updatedBedspace);
  else roomSpaces.value.push({ id: Date.now(), ...updatedBedspace });
  showBedspaceForm.value = false;
  selectedCell.value = null;
  editingBedspaceId.value = null;
  bedspaceError.value = '';
  resetBedspaceDraft();
}
function resetBedspaceDraft() {
  bedspaceDraft.name = '';
  bedspaceDraft.price = 0;
  bedspaceRentText.value = '';
  bedspaceDraft.image = null;
  bedspaceDraft.photoUrl = null;
  setPhotoPreview(bedspacePhotoPreview, null);
  bedspaceDraft.amenities = [''];
  bedspaceDraft.houseRules = [''];
  bedspaceDraft.maintenance = [''];
}
function openConfirmation() {
  normalizeWizardFields();
  if (isEditMode && !existingListing.value) {
    submitError.value = editLoadError.value || 'The listing could not be loaded for editing.';
    showConfirmation.value = true;
    return;
  }
  if (!locationCoordinates.value) {
    currentStep.value = 1;
    locationError.value = 'Choose your space location on the map before publishing.';
    return;
  }
  if (!formElement.value?.reportValidity()) return;
  if (!allFloorsReady.value) return;
  showConfirmation.value = true;
  submitError.value = '';
}
function closeConfirmation() {
  if (isSubmitting.value) return;
  showConfirmation.value = false;
}
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'An unexpected error occurred while publishing the listing.';
}
async function confirmPublish() {
  if (isSubmitting.value) return;
  normalizeWizardFields();
  isSubmitting.value = true;
  submitError.value = '';
  const uploadedPaths: string[] = [];
  let createdSpaceId: number | null = null;
  let supabaseClient: ReturnType<typeof getSupabaseClient> | null = null;

  try {
    const client = getSupabaseClient();
    supabaseClient = client;
    const { data: { user: host }, error: authError } = await client.auth.getUser();
    if (authError) throw authError;
    if (!host) throw new Error('Sign in again before saving your listing.');
    const selectedLocation = locationCoordinates.value;
    if (!selectedLocation) throw new Error('Choose your space location on the map before saving.');
    if (isEditMode && !existingListing.value) throw new Error('The listing could not be loaded for editing.');
    if (!floorDrafts.value.length) throw new Error('Add at least one floor before saving.');
    if (floorDrafts.value.some((floor) => floor.rooms.length === 0)) {
      throw new Error('Add at least one room to every floor.');
    }
    if (form.type === 'Bedspace' && floorDrafts.value.some((floor) =>
      floor.rooms.some((room) => room.bedspaces.length === 0 || room.bedspaces.some((space) => space.price < 1)))) {
      throw new Error('Add at least one bedspace with a valid monthly rent to every room.');
    }

    const floorRents = form.type === 'Private room'
      ? floorDrafts.value.flatMap((floor) => floor.rooms.map((room) => Number(room.privateRoomSpace.price)))
      : floorDrafts.value.flatMap((floor) => floor.rooms.flatMap((room) => room.bedspaces.map((space) => space.price)));
    const monthlyRent = Math.min(...floorRents);
    if (!Number.isFinite(monthlyRent) || monthlyRent < 1) {
      throw new Error('Enter a monthly rent greater than zero for every floor.');
    }

    if (isEditMode && editSpaceId !== null) {
      createdSpaceId = editSpaceId;
    } else {
      const { data: space, error: spaceError } = await client
        .from('spaces')
        .insert({
          host_id: host.id,
          name: form.name,
          location: form.location,
          type: form.type,
          description: form.description,
          monthly_rent: monthlyRent,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          status: 'published',
        })
        .select('id')
        .single();
      if (spaceError) throw spaceError;
      createdSpaceId = space.id;
    }

    const uploadPhoto = async (file: File | null, kind: string): Promise<string | null> => {
      if (!file) return null;
      if (file.size > 10 * 1024 * 1024) throw new Error(`${kind} photo must be 10 MB or smaller.`);
      const extensionByMimeType: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      };
      const extension = extensionByMimeType[file.type];
      if (!extension) throw new Error(`${kind} photo must be a PNG, JPG, WEBP, or GIF image.`);

      const path = `${host.id}/${createdSpaceId}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await client.storage
        .from('space-photos')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      uploadedPaths.push(path);
      return client.storage.from('space-photos').getPublicUrl(path).data.publicUrl;
    };

    const coverPhotoUrl = await uploadPhoto(coverPhoto.value, 'Cover');
    const savedCoverPhoto = coverPhotoUrl || existingListing.value?.coverPhotoUrl || null;
    const isPrivateRoom = form.type === 'Private room';
    for (const [index, floorDraft] of floorDrafts.value.entries()) {
      const floorPhotoUrl = await uploadPhoto(floorDraft.floorPhoto, 'Floor');
      const savedFloorPhoto = floorPhotoUrl || (resetExistingLayout.value ? null : floorDraft.floorPhotoUrl);
      if (isEditMode && !resetExistingLayout.value && floorDraft.floorId !== undefined) {
        const { error: floorError } = await client.from('floors').update({
          name: floorDraft.name || `Floor ${index + 1}`,
          photo_url: savedFloorPhoto,
        }).eq('id', floorDraft.floorId).eq('space_id', createdSpaceId);
        if (floorError) throw floorError;
      } else {
        const { data: floor, error: floorError } = await client.from('floors').insert({
          space_id: createdSpaceId,
          name: floorDraft.name || `Floor ${index + 1}`,
          photo_url: floorPhotoUrl,
        }).select('id').single();
        if (floorError) throw floorError;
        floorDraft.floorId = floor.id;
      }

      for (const [roomIndex, roomDraft] of floorDraft.rooms.entries()) {
        const roomPhotoUrl = await uploadPhoto(roomDraft.roomPhoto, 'Room');
        const roomDetails = {
          space_id: createdSpaceId,
          floor_id: floorDraft.floorId,
          name: roomDraft.name || `Room ${roomIndex + 1}`,
          photo_url: roomPhotoUrl || (resetExistingLayout.value ? null : roomDraft.roomPhotoUrl) || null,
          monthly_rent: isPrivateRoom ? Number(roomDraft.privateRoomSpace.price) : null,
          amenities: isPrivateRoom ? roomDraft.privateRoomSpace.amenities.filter((item) => item.trim()) : [],
          house_rules: isPrivateRoom ? roomDraft.privateRoomSpace.houseRules.filter((item) => item.trim()) : [],
          maintenance: isPrivateRoom ? roomDraft.privateRoomSpace.maintenance.filter((item) => item.trim()) : [],
          grid_rows: Math.max(1, Math.floor(Number(roomDraft.gridRows) || 1)),
          grid_columns: Math.max(1, Math.floor(Number(roomDraft.gridColumns) || 1)),
          door_row: roomDraft.doorPosition?.row ?? null,
          door_column: roomDraft.doorPosition?.column ?? null,
        };
        if (isEditMode && !resetExistingLayout.value && roomDraft.roomId !== undefined) {
          const { error: roomError } = await client.from('rooms').update(roomDetails)
            .eq('id', roomDraft.roomId).eq('space_id', createdSpaceId);
          if (roomError) throw roomError;
        } else {
          const { data: room, error: roomError } = await client.from('rooms').insert(roomDetails).select('id').single();
          if (roomError) throw roomError;
          roomDraft.roomId = room.id;
        }

        if (!isPrivateRoom) for (const bedspace of roomDraft.bedspaces) {
          const bedspaceDetails = {
            space_id: createdSpaceId,
            room_id: roomDraft.roomId,
            name: bedspace.name,
            price: bedspace.price,
            row: bedspace.row,
            column_index: bedspace.column,
            photo_url: await uploadPhoto(bedspace.image, 'Bedspace') || bedspace.photoUrl || null,
            amenities: bedspace.amenities,
            house_rules: bedspace.houseRules,
            maintenance: bedspace.maintenance,
          };
          if (!resetExistingLayout.value && roomDraft.bedspaceIds.includes(bedspace.id)) {
            const { error: bedspaceError } = await client.from('bedspaces').update(bedspaceDetails)
              .eq('id', bedspace.id).eq('room_id', roomDraft.roomId).eq('space_id', createdSpaceId);
            if (bedspaceError) throw bedspaceError;
          } else {
            const { error: bedspaceError } = await client.from('bedspaces').insert(bedspaceDetails);
            if (bedspaceError) throw bedspaceError;
          }
        }
      }
    }

    if (isEditMode) {
      const { error: updateError } = await client.from('spaces').update({
        name: form.name,
        location: form.location,
        type: form.type,
        description: form.description,
        monthly_rent: monthlyRent,
        cover_photo_url: savedCoverPhoto,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      }).eq('id', createdSpaceId).eq('host_id', host.id);
      if (updateError) throw updateError;
      if (resetExistingLayout.value && existingListing.value) {
        const { error: deleteOldLayoutError } = await client.from('floors').delete()
          .in('id', existingListing.value.floorIds).eq('space_id', createdSpaceId);
        if (deleteOldLayoutError) throw new Error(`The new listing details were saved, but the old room layout and its bookings could not be removed: ${deleteOldLayoutError.message}`);
      }
    } else if (coverPhotoUrl) {
      const { error: coverPhotoError } = await client.from('spaces').update({ cover_photo_url: coverPhotoUrl })
        .eq('id', createdSpaceId);
      if (coverPhotoError) throw coverPhotoError;
    }

    showConfirmation.value = false;
    submitted.value = true;
  } catch (error) {
    const cleanupErrors: string[] = [];
    if (createdSpaceId !== null && supabaseClient) {
      if (uploadedPaths.length > 0 && !isEditMode) {
        try {
          const { error: storageCleanupError } = await supabaseClient
            .storage.from('space-photos').remove(uploadedPaths);
          if (storageCleanupError) cleanupErrors.push(`Photo cleanup failed: ${storageCleanupError.message}`);
        } catch (cleanupError) {
          cleanupErrors.push(`Photo cleanup failed: ${getErrorMessage(cleanupError)}`);
        }
      }
      if (!isEditMode) {
        try {
          const { error: spaceCleanupError } = await supabaseClient
            .from('spaces').delete().eq('id', createdSpaceId);
          if (spaceCleanupError) cleanupErrors.push(`Listing cleanup failed: ${spaceCleanupError.message}`);
        } catch (cleanupError) {
          cleanupErrors.push(`Listing cleanup failed: ${getErrorMessage(cleanupError)}`);
        }
      }
    }
    const message = getErrorMessage(error);
    submitError.value = cleanupErrors.length ? `${message} ${cleanupErrors.join(' ')}` : message;
  } finally {
    isSubmitting.value = false;
  }
}
function addItem(items: string[]) {
  items.push('');
}
function removeItem(items: string[], index: number) {
  items.splice(index, 1);
}
function normalizeWizardFields() {
  form.name = formatTextField(form.name, true);
  form.location = formatTextField(form.location, true);
  form.description = formatTextField(form.description);
  floorDrafts.value.forEach((floor) => {
    floor.name = formatTextField(floor.name, true);
    floor.rooms.forEach((room) => {
      room.name = formatTextField(room.name, true);
      room.privateRoomSpace.amenities = room.privateRoomSpace.amenities.map((item) => formatTextField(item));
      room.privateRoomSpace.houseRules = room.privateRoomSpace.houseRules.map((item) => formatTextField(item));
      room.privateRoomSpace.maintenance = room.privateRoomSpace.maintenance.map((item) => formatTextField(item));
    });
  });
  bedspaceDraft.name = formatTextField(bedspaceDraft.name, true);
  bedspaceDraft.amenities = bedspaceDraft.amenities.map((item) => formatTextField(item));
  bedspaceDraft.houseRules = bedspaceDraft.houseRules.map((item) => formatTextField(item));
  bedspaceDraft.maintenance = bedspaceDraft.maintenance.map((item) => formatTextField(item));
  floorDrafts.value.forEach((floor) => {
    floor.rooms.forEach((room) => {
      room.bedspaces.forEach((space) => {
        space.name = formatTextField(space.name, true);
        space.amenities = space.amenities.map((item) => formatTextField(item));
        space.houseRules = space.houseRules.map((item) => formatTextField(item));
        space.maintenance = space.maintenance.map((item) => formatTextField(item));
      });
    });
  });
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

.location-picker {
  margin-top: 20px;
}

.location-picker-heading {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 10px;
}

.location-picker-heading strong {
  color: #174b35;
  font-size: 11px;
}

.location-picker-heading p,
.location-picker-status {
  color: #89968d;
  font-size: 10px;
  line-height: 1.5;
  margin: 4px 0 0;
}

.use-location-button {
  background: #edf5ed;
  border: 1px solid #d5e5d4;
  border-radius: 6px;
  color: #35744a;
  cursor: pointer;
  flex: 0 0 auto;
  font: inherit;
  font-size: 10px;
  font-weight: 700;
  padding: 9px 11px;
}

.use-location-button:disabled {
  cursor: wait;
  opacity: .65;
}

.location-map {
  border: 1px solid #dfe8de;
  border-radius: 9px;
  height: 320px;
  overflow: hidden;
  position: relative;
  z-index: 0;
}

.location-picker-status.location-picker-error {
  color: #b43e2d;
}

:deep(.space-location-marker) {
  align-items: center;
  display: flex;
  justify-content: center;
}

:deep(.space-location-marker span) {
  background: #e2743e;
  border: 3px solid #fff;
  border-radius: 50%;
  box-shadow: 0 1px 5px rgba(0, 0, 0, .35);
  height: 20px;
  width: 20px;
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

.floor-selector,
.room-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0;
}

.room-selector {
  margin-top: 0;
}

.floor-selector button,
.room-selector button {
  background: #f3f7f1;
  border: 1px solid #dce8da;
  border-radius: 999px;
  color: #42644e;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  padding: 9px 14px;
}

.floor-selector button.active,
.room-selector button.active {
  background: #174b35;
  border-color: #174b35;
  color: #fff;
}

.floor-selector .add-floor-button,
.room-selector .add-floor-button {
  align-items: center;
  background: #fff;
  border: 1px dashed #e2743e;
  color: #d46938;
  display: inline-flex;
  gap: 6px;
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

.photo-preview {
  border-radius: 9px;
  max-height: 210px;
  max-width: min(100%, 440px);
  object-fit: cover;
  width: 100%;
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

.type-switch-dialog {
  max-width: 470px;
}

.warning-icon {
  background: #fff0e8;
  color: #b85b32;
}

.destructive-confirm {
  background: #a4472a;
}

.dialog-enter-active,
.dialog-leave-active {
  transition: opacity .2s ease;
}

.dialog-enter-active .confirmation-dialog,
.dialog-enter-active .bedspace-dialog,
.dialog-leave-active .confirmation-dialog,
.dialog-leave-active .bedspace-dialog {
  transition: transform .2s ease, opacity .2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .confirmation-dialog,
.dialog-enter-from .bedspace-dialog,
.dialog-leave-to .confirmation-dialog,
.dialog-leave-to .bedspace-dialog {
  opacity: 0;
  transform: translateY(12px) scale(.98);
}

.form-card {
  animation: form-card-enter .3s ease both;
}

@keyframes form-card-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.bed-item-enter-active,
.bed-item-leave-active,
.bed-item-move {
  transition: opacity .2s ease, transform .2s ease;
}

.bed-item-enter-from,
.bed-item-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(.96);
}

.bed-item-leave-active {
  position: absolute;
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

.edit-bedspace-button {
  background: #e5f1e4;
  border: 0;
  border-radius: 3px;
  color: #35744a;
  cursor: pointer;
  font: inherit;
  font-size: 7px;
  font-weight: 700;
  padding: 3px 5px;
}

.form-status {
  background: #fff;
  border: 1px solid #e5ebe4;
  border-radius: 8px;
  color: #849087;
  margin-top: 24px;
  padding: 18px;
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

.submit-error {
  color: #b43e2d;
  font-size: 11px;
  line-height: 1.5;
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

@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active,
  .dialog-leave-active,
  .dialog-enter-active .confirmation-dialog,
  .dialog-enter-active .bedspace-dialog,
  .dialog-leave-active .confirmation-dialog,
  .dialog-leave-active .bedspace-dialog,
  .form-card,
  .bed-item-enter-active,
  .bed-item-leave-active,
  .bed-item-move,
  .host-bed-grid.is-adding-bedspace .host-grid-cell {
    animation: none !important;
    transition: none !important;
  }
}
</style>
