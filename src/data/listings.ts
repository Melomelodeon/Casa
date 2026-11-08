export type Listing = {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: string;
  type: string;
  amenities: number;
  includedAmenities: string[];
  houseRules: string[];
  badge: string;
  description: string;
  image: string;
};

export type BookingBed = {
  id: string;
  name: string;
  status: 'available' | 'occupied';
  row: number;
  column: number;
  level?: number;
  image?: string;
  price?: number;
  maintenance?: string[];
};

export type BookingGridPosition = {
  row: number;
  column: number;
};

export type BookingRoom = {
  id: string;
  name: string;
  image?: string;
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

export const defaultListingImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85';
export const defaultFloorImage = 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85';
export const defaultRoomImage = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85';
export const defaultBedImage = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85';

export const listings: Listing[] = [
  { id: 1, name: 'The Greenhouse', location: 'Katipunan, Quezon City', price: 8500, rating: '4.9', type: 'Private room', amenities: 8, includedAmenities: ['Wi-Fi', 'Furnished room', 'Utilities included', 'Kitchen access'], houseRules: ['Quiet and respectful', 'No smoking indoors'], badge: 'Casa favorite', description: 'A sun-filled room near campus with a warm, creative community.', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85' },
  { id: 2, name: 'Sage House', location: 'Poblacion, Makati', price: 7200, rating: '4.8', type: 'Bedspace', amenities: 6, includedAmenities: ['Wi-Fi', 'Laundry area', 'Security / CCTV', 'Shared kitchen'], houseRules: ['Flexible household', 'Guests must be registered'], badge: 'New on Casa', description: 'Thoughtfully designed shared living in the heart of the city.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85' },
  { id: 3, name: 'Casa Amara', location: 'Cebu IT Park, Cebu', price: 9800, rating: '5.0', type: 'Private room', amenities: 10, includedAmenities: ['Wi-Fi', 'Furnished room', 'Utilities included', 'Study desk'], houseRules: ['No smoking indoors', 'Quiet hours after 10 PM'], badge: '', description: 'Your calm corner with everything you need close by.', image: 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85' },
  { id: 4, name: 'The Olive Room', location: 'Lahug, Cebu City', price: 6500, rating: '4.7', type: 'Bedspace', amenities: 7, includedAmenities: ['Wi-Fi', 'Laundry area', 'Kitchen access', 'Security / CCTV'], houseRules: ['Quiet and respectful', 'Shared areas kept clean'], badge: 'Great value', description: 'Easy, breezy living with a view and room to make it yours.', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85' },
  { id: 5, name: 'Moss & Morning', location: 'Diliman, Quezon City', price: 7900, rating: '4.9', type: 'Private room', amenities: 9, includedAmenities: ['Wi-Fi', 'Furnished room', 'Laundry area', 'Quiet study space'], houseRules: ['No smoking indoors', 'Pets by approval'], badge: '', description: 'A quiet, plant-filled home base for busy city days.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85' },
  { id: 6, name: 'The Nook', location: 'Taft, Manila', price: 5800, rating: '4.6', type: 'Bedspace', amenities: 5, includedAmenities: ['Wi-Fi', 'Furnished bed', 'Kitchen access', 'CCTV security'], houseRules: ['Flexible household', 'Shared areas kept clean'], badge: 'Budget pick', description: 'Simple, bright, and close to everything you need.', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=85' },
  { id: 7, name: 'Casa Verde Boarding House', location: 'Sampaloc, Manila', price: 42000, rating: '4.8', type: 'Boarding house', amenities: 12, includedAmenities: ['Wi-Fi', 'Fully furnished', 'Utilities included', 'Shared kitchen', 'Laundry area', 'Security / CCTV'], houseRules: ['No smoking indoors', 'Quiet hours after 10 PM', 'Guests must be registered'], badge: 'Whole property', description: 'A complete, move-in-ready boarding house with flexible shared spaces.', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=85' },
];

export function getBookingFloors(listing: Listing): BookingFloor[] {
  const floorCount = listing.type === 'Private room' ? 1 : 2;
  return Array.from({ length: floorCount }, (_, floorIndex): BookingFloor => {
    const roomCount = listing.type === 'Private room' ? 1 : 2;
    const maintenance = [
      'Room deep-cleaned and sanitized',
      'Mattress and bed frame inspected',
      'Electrical fixtures checked',
    ];
    const rooms = Array.from({ length: roomCount }, (_, roomIndex): BookingRoom => ({
      id: `${listing.id}-floor-${floorIndex + 1}-room-${roomIndex + 1}`,
      name: listing.type === 'Private room' ? 'Private room' : `Room ${floorIndex + 1}${roomIndex + 1}`,
      image: floorIndex === 0 && roomIndex === 0 ? listing.image : undefined,
      grid: {
        ...[
        { rows: 2, columns: 3 },
        { rows: 3, columns: 4 },
        { rows: 4, columns: 4 },
        { rows: 4, columns: 5 },
        ][(floorIndex * roomCount + roomIndex) % 4],
        door: { row: 1, column: 3 },
      },
      beds: listing.type === 'Private room'
        ? [{ id: `${listing.id}-bed-1`, name: 'Private bed', status: 'available', row: 1, column: 2, image: listing.image, maintenance }]
        : [
            { id: `${listing.id}-bed-${floorIndex + 1}-${roomIndex + 1}-1`, name: `Bed ${floorIndex + 1}${roomIndex + 1}01`, status: 'available', row: 1, column: 1, maintenance },
            { id: `${listing.id}-bed-${floorIndex + 1}-${roomIndex + 1}-2`, name: `Bed ${floorIndex + 1}${roomIndex + 1}02`, status: 'occupied', row: 1, column: Math.min(3, [3, 4, 4, 5][(floorIndex * roomCount + roomIndex) % 4]), maintenance },
            { id: `${listing.id}-bed-${floorIndex + 1}-${roomIndex + 1}-3`, name: `Bed ${floorIndex + 1}${roomIndex + 1}03`, status: 'available', row: 2, column: 2, maintenance },
            ...((floorIndex * roomCount + roomIndex) % 4 > 0 ? [{ id: `${listing.id}-bed-${floorIndex + 1}-${roomIndex + 1}-4`, name: `Bed ${floorIndex + 1}${roomIndex + 1}04`, status: 'available' as const, row: 2, column: 4, maintenance }] : []),
            ...((floorIndex * roomCount + roomIndex) % 4 > 1 ? [{ id: `${listing.id}-bed-${floorIndex + 1}-${roomIndex + 1}-5`, name: `Bed ${floorIndex + 1}${roomIndex + 1}05`, status: 'occupied' as const, row: 3, column: 1, maintenance }] : []),
            ...((floorIndex * roomCount + roomIndex) % 4 > 2 ? [{ id: `${listing.id}-bed-${floorIndex + 1}-${roomIndex + 1}-6`, name: `Bed ${floorIndex + 1}${roomIndex + 1}06`, status: 'available' as const, row: 4, column: 5, maintenance }] : []),
            ...((floorIndex * roomCount + roomIndex) % 4 === 0 ? [{ id: `${listing.id}-bed-${floorIndex + 1}-${roomIndex + 1}-upper`, name: `Upper bunk ${floorIndex + 1}${roomIndex + 1}`, status: 'available' as const, row: 1, column: 1, level: 2, maintenance }] : []),
          ],
    }));
    return {
      id: `${listing.id}-floor-${floorIndex + 1}`,
      name: floorIndex === 0 ? 'Ground floor' : `Floor ${floorIndex + 1}`,
      image: floorIndex === 0 ? listing.image || defaultFloorImage : undefined,
      rooms,
    };
  });
}
