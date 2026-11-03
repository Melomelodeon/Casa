import type { BookingSpace } from '../components/BookingPanel.vue';

export type Listing = {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: string;
  type: string;
  amenities: number;
  badge: string;
  description: string;
  image: string;
};

export const defaultListingImage = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85';

export const listings: Listing[] = [
  { id: 1, name: 'The Greenhouse', location: 'Katipunan, Quezon City', price: 8500, rating: '4.9', type: 'Private room', amenities: 8, badge: 'Casa favorite', description: 'A sun-filled room near campus with a warm, creative community.', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85' },
  { id: 2, name: 'Sage House', location: 'Poblacion, Makati', price: 7200, rating: '4.8', type: 'Bedspace', amenities: 6, badge: 'New on Casa', description: 'Thoughtfully designed shared living in the heart of the city.', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85' },
  { id: 3, name: 'Casa Amara', location: 'Cebu IT Park, Cebu', price: 9800, rating: '5.0', type: 'Private room', amenities: 10, badge: '', description: 'Your calm corner with everything you need close by.', image: 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85' },
  { id: 4, name: 'The Olive Room', location: 'Lahug, Cebu City', price: 6500, rating: '4.7', type: 'Bedspace', amenities: 7, badge: 'Great value', description: 'Easy, breezy living with a view and room to make it yours.', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85' },
  { id: 5, name: 'Moss & Morning', location: 'Diliman, Quezon City', price: 7900, rating: '4.9', type: 'Private room', amenities: 9, badge: '', description: 'A quiet, plant-filled home base for busy city days.', image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85' },
  { id: 6, name: 'The Nook', location: 'Taft, Manila', price: 5800, rating: '4.6', type: 'Bedspace', amenities: 5, badge: 'Budget pick', description: 'Simple, bright, and close to everything you need.', image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=85' },
];

export function getBookingSpaces(listing: Listing): BookingSpace[] {
  return listing.type === 'Private room'
    ? [{ name: 'Private bed', status: 'available', image: listing.image }]
    : [
        { name: 'Bed 01', status: 'available' },
        { name: 'Bed 02', status: 'occupied' },
        { name: 'Bed 03', status: 'available' },
      ];
}
