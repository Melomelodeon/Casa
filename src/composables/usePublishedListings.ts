import { onMounted, onUnmounted, ref } from 'vue';
import { mapDatabaseSpaces, type Listing } from '../data/listings';
import { getSupabaseClient } from '../lib/supabase';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'An unexpected error occurred while loading listings.';
}

export function usePublishedListings() {
  const listings = ref<Listing[]>([]);
  const isLoading = ref(false);
  const error = ref('');
  const refreshAfterBooking = () => { void loadListings(); };

  async function loadListings() {
    isLoading.value = true;
    error.value = '';

    try {
      const client = getSupabaseClient();
      const [{ data, error: queryError }, { data: bookedSpaces, error: availabilityError }] = await Promise.all([
        client
        .from('spaces')
        .select(`
          id, name, location, type, description, monthly_rent, cover_photo_url, latitude, longitude, created_at,
          floors (
            id, name, photo_url,
            rooms (
              id, name, photo_url, monthly_rent, amenities, house_rules, maintenance,
              grid_rows, grid_columns, door_row, door_column,
              bedspaces (
                id, name, price, row, column_index, photo_url, amenities, house_rules, maintenance
              )
            )
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false }),
        client.rpc('get_booked_listing_spaces'),
      ]);

      if (queryError) throw queryError;
      if (availabilityError) throw availabilityError;
      listings.value = mapDatabaseSpaces(data ?? [], bookedSpaces ?? []);
    } catch (loadError) {
      error.value = getErrorMessage(loadError);
    } finally {
      isLoading.value = false;
    }
  }

  onMounted(() => window.addEventListener('casa:booking-completed', refreshAfterBooking));
  onUnmounted(() => window.removeEventListener('casa:booking-completed', refreshAfterBooking));

  return { listings, isLoading, error, loadListings };
}
