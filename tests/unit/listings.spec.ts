import { describe, expect, test } from 'vitest';
import { getBookingFloors, mapDatabaseSpaces } from '../../src/data/listings';

describe('database listings', () => {
  test('maps published spaces and their nested booking details', () => {
    const [listing] = mapDatabaseSpaces([{
      id: 21,
      name: 'Sage House',
      location: 'Makati',
      type: 'Bedspace',
      description: 'Shared student housing.',
      monthly_rent: 7200,
      cover_photo_url: null,
      latitude: 14.5653,
      longitude: 121.0326,
      created_at: '2026-11-08T10:00:00Z',
      floors: [{
        id: 31,
        name: 'Second floor',
        photo_url: null,
        rooms: [{
          id: 41,
          name: 'Garden Room',
          photo_url: null,
          monthly_rent: null,
          amenities: ['Wi-Fi'],
          house_rules: ['Quiet hours'],
          maintenance: [],
          grid_rows: 2,
          grid_columns: 3,
          door_row: 1,
          door_column: 3,
          bedspaces: [
            {
              id: 51,
              name: 'Bed A',
              price: 7200,
              row: 2,
              column_index: 1,
              photo_url: null,
              amenities: ['Wi-Fi'],
              house_rules: ['Quiet hours'],
              maintenance: ['Bed frame checked'],
            },
            {
              id: 52,
              name: 'Bed B',
              price: 8500,
              row: 1,
              column_index: 2,
              photo_url: null,
              amenities: ['Desk'],
              house_rules: [],
              maintenance: [],
            },
          ],
        }],
      }],
    }]);

    expect(listing).toMatchObject({
      id: 21,
      name: 'Sage House',
      price: 7200,
      coordinates: { latitude: 14.5653, longitude: 121.0326 },
      amenities: 2,
      includedAmenities: ['Wi-Fi', 'Desk'],
      houseRules: ['Quiet hours'],
    });
    expect(getBookingFloors(listing)[0].rooms[0]).toMatchObject({
      id: '41',
      name: 'Garden Room',
      grid: { rows: 2, columns: 3, door: { row: 1, column: 3 } },
      beds: [
        {
          id: '51',
          name: 'Bed A',
          row: 2,
          column: 1,
          price: 7200,
          maintenance: ['Bed frame checked'],
        },
        {
          id: '52',
          name: 'Bed B',
          row: 1,
          column: 2,
          price: 8500,
        },
      ],
    });
  });
});
