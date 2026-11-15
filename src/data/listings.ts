export type Listing = {
  id: number;
  name: string;
  location: string;
  coordinates?: { latitude: number; longitude: number } | null;
  dateAdded?: string | null;
  price: number;
  rating: string;
  type: string;
  amenities: number;
  includedAmenities: string[];
  houseRules: string[];
  badge: string;
  description: string;
  image: string;
  floors: BookingFloor[];
};

export type BookingBed = {
  id: string;
  roomId?: string;
  name: string;
  status: 'available' | 'occupied';
  row: number;
  column: number;
  level?: number;
  image?: string;
  price?: number;
  amenities?: string[];
  houseRules?: string[];
  maintenance?: string[];
};

export type BookingGridPosition = {
  row: number;
  column: number;
};

export type BookingRoom = {
  id: string;
  name: string;
  status: 'available' | 'occupied';
  image?: string;
  price?: number;
  amenities?: string[];
  houseRules?: string[];
  maintenance?: string[];
  beds: BookingBed[];
  grid: { rows: number; columns: number; door?: BookingGridPosition };
};

export type BookingFloor = {
  id: string;
  name: string;
  image?: string;
  rooms: BookingRoom[];
};

export type BookingSelection =
  | { kind: 'bed'; value: BookingBed }
  | { kind: 'room'; value: BookingRoom };

export function isListingFullyBooked(listing: Listing): boolean {
  const rooms = listing.floors?.flatMap((floor) => floor.rooms) ?? [];
  if (rooms.length === 0) return false;
  if (listing.type === 'Private room') {
    return rooms.every((room) => room.status === 'occupied');
  }

  const beds = rooms.flatMap((room) => room.beds);
  return beds.length > 0 && beds.every((bed) => bed.status === 'occupied');
}

export function getRandomHighlyRatedListings(listings: Listing[], limit = 3): Listing[] {
  const candidates = listings.filter((listing) => Number(listing.rating) >= 4.8);
  for (let index = candidates.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [candidates[index], candidates[swapIndex]] = [candidates[swapIndex], candidates[index]];
  }
  return candidates.slice(0, Math.max(0, limit));
}

export const defaultListingImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85';
export const defaultFloorImage = 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85';
export const defaultRoomImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85';
export const defaultBedImage = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85';

type DatabaseBedspace = {
  id: number;
  name: string;
  price: number;
  row: number;
  column_index: number;
  photo_url: string | null;
  amenities: string[];
  house_rules: string[];
  maintenance: string[];
};

type DatabaseRoom = {
  id: number;
  name: string;
  photo_url: string | null;
  monthly_rent: number | null;
  amenities: string[];
  house_rules: string[];
  maintenance: string[];
  grid_rows: number;
  grid_columns: number;
  door_row: number | null;
  door_column: number | null;
  bedspaces: DatabaseBedspace[];
};

type DatabaseFloor = {
  id: number;
  name: string;
  photo_url: string | null;
  rooms: DatabaseRoom[];
};

type DatabaseSpace = {
  id: number;
  name: string;
  location: string;
  type: string;
  description: string;
  monthly_rent: number;
  cover_photo_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  floors: DatabaseFloor[];
};

export type SpaceRatingSummary = {
  listing_id: number;
  average_rating: number | string;
};

export function mapDatabaseSpaces(
  records: DatabaseSpace[],
  bookedSpaces: { room_id: number; bedspace_id: number | null }[] = [],
  ratingSummaries: SpaceRatingSummary[] = [],
): Listing[] {
  const bookedRoomIds = new Set(bookedSpaces.filter((space) => space.bedspace_id === null).map((space) => String(space.room_id)));
  const bookedBedspaceIds = new Set(bookedSpaces.flatMap((space) => space.bedspace_id === null ? [] : [String(space.bedspace_id)]));
  const ratingsByListingId = new Map(ratingSummaries.map(({ listing_id, average_rating }) => [
    listing_id,
    Number(average_rating).toFixed(1),
  ]));
  return records.map((space) => {
    const includedAmenities = new Set<string>();
    const houseRules = new Set<string>();
    const floors: BookingFloor[] = space.floors.map((floor) => ({
      id: String(floor.id),
      name: floor.name,
      image: floor.photo_url || defaultFloorImage,
      rooms: floor.rooms.map((room) => {
        room.amenities.forEach((amenity) => includedAmenities.add(amenity));
        room.house_rules.forEach((rule) => houseRules.add(rule));
        const beds: BookingBed[] = room.bedspaces.map((bedspace) => {
          bedspace.amenities.forEach((amenity) => includedAmenities.add(amenity));
          bedspace.house_rules.forEach((rule) => houseRules.add(rule));
          return {
            id: String(bedspace.id),
            roomId: String(room.id),
            name: bedspace.name,
            status: bookedBedspaceIds.has(String(bedspace.id)) ? 'occupied' : 'available',
            row: bedspace.row,
            column: bedspace.column_index,
            image: bedspace.photo_url || undefined,
            price: Number(bedspace.price),
            amenities: [...bedspace.amenities],
            houseRules: [...bedspace.house_rules],
            maintenance: bedspace.maintenance,
          };
        });

        return {
          id: String(room.id),
          name: room.name,
          status: bookedRoomIds.has(String(room.id)) ? 'occupied' : 'available',
          image: room.photo_url || defaultRoomImage,
          price: room.monthly_rent === null ? undefined : Number(room.monthly_rent),
          amenities: [...room.amenities],
          houseRules: [...room.house_rules],
          maintenance: [...room.maintenance],
          beds,
          grid: {
            rows: room.grid_rows,
            columns: room.grid_columns,
            door: room.door_row !== null && room.door_column !== null
              ? { row: room.door_row, column: room.door_column }
              : undefined,
          },
        };
      }),
    }));
    const bookablePrices = space.type === 'Private room'
      ? floors.flatMap((floor) => floor.rooms.map((room) => room.price ?? NaN))
      : floors.flatMap((floor) => floor.rooms.flatMap((room) => room.beds.map((bed) => bed.price ?? NaN)));
    const validBookablePrices = bookablePrices.filter((price) => Number.isFinite(price) && price > 0);

    return {
      id: space.id,
      name: space.name,
      location: space.location,
      coordinates: typeof space.latitude === 'number' && Number.isFinite(space.latitude)
        && typeof space.longitude === 'number' && Number.isFinite(space.longitude)
        ? { latitude: Number(space.latitude), longitude: Number(space.longitude) }
        : null,
      price: validBookablePrices.length > 0
        ? Math.min(...validBookablePrices)
        : Number(space.monthly_rent),
      rating: ratingsByListingId.get(space.id) ?? '—',
      type: space.type,
      amenities: includedAmenities.size,
      includedAmenities: [...includedAmenities],
      houseRules: [...houseRules],
      badge: '',
      description: space.description,
      image: space.cover_photo_url || defaultListingImage,
      dateAdded: space.created_at,
      floors,
    };
  });
}

export function getBookingFloors(listing: Listing): BookingFloor[] {
  return listing.floors;
}
