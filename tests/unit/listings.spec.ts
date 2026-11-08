import { describe, expect, test } from 'vitest';
import { getBookingFloors, isListingFullyBooked, mapDatabaseSpaces } from '../../src/data/listings';

describe('database listings', () => {
  test('maps published spaces and their nested booking details', () => {
    const records = [{
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
    }];
    const [listing] = mapDatabaseSpaces(records, [{ room_id: 41, bedspace_id: 52 }]);

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
      status: 'available',
      amenities: ['Wi-Fi'],
      houseRules: ['Quiet hours'],
      grid: { rows: 2, columns: 3, door: { row: 1, column: 3 } },
      beds: [
        {
          id: '51',
          roomId: '41',
          name: 'Bed A',
          row: 2,
          column: 1,
          price: 7200,
          amenities: ['Wi-Fi'],
          houseRules: ['Quiet hours'],
          maintenance: ['Bed frame checked'],
        },
        {
          id: '52',
          roomId: '41',
          name: 'Bed B',
          status: 'occupied',
          row: 1,
          column: 2,
          price: 8500,
          amenities: ['Desk'],
          houseRules: [],
          maintenance: [],
        },
      ],
    });
    const [mappedRoom] = getBookingFloors(listing)[0].rooms;
    expect(mappedRoom.beds[0].amenities).not.toEqual(mappedRoom.beds[1].amenities);
    expect(mappedRoom.beds[0].maintenance).not.toEqual(mappedRoom.beds[1].maintenance);
    expect(getBookingFloors(listing)[0].rooms[0].beds.map(({ id, row, column }) => ({ id, row, column }))).toEqual([
      { id: '51', row: 2, column: 1 },
      { id: '52', row: 1, column: 2 },
    ]);
    expect(isListingFullyBooked(listing)).toBe(false);

    const [fullyBookedListing] = mapDatabaseSpaces(records, [
      { room_id: 41, bedspace_id: 51 },
      { room_id: 41, bedspace_id: 52 },
    ]);
    expect(isListingFullyBooked(fullyBookedListing)).toBe(true);
  });

  test('marks a private room booked from active booking records', () => {
    const [listing] = mapDatabaseSpaces([{
      id: 21,
      name: 'Private Casa',
      location: 'Makati',
      type: 'Private room',
      description: 'Private room.',
      monthly_rent: 9000,
      cover_photo_url: null,
      latitude: null,
      longitude: null,
      created_at: '2026-11-08T10:00:00Z',
      floors: [{
        id: 31,
        name: 'Ground floor',
        photo_url: null,
        rooms: [{
          id: 41,
          name: 'Room 1',
          photo_url: null,
          monthly_rent: 9000,
          amenities: ['Room A Wi-Fi'],
          house_rules: ['Room A quiet hours'],
          maintenance: ['Room A serviced'],
          grid_rows: 1,
          grid_columns: 1,
          door_row: null,
          door_column: null,
          bedspaces: [],
        }, {
          id: 42,
          name: 'Room 2',
          photo_url: null,
          monthly_rent: 9500,
          amenities: ['Room B desk'],
          house_rules: ['Room B visitors by approval'],
          maintenance: ['Room B cleaned'],
          grid_rows: 1,
          grid_columns: 1,
          door_row: null,
          door_column: null,
          bedspaces: [],
        }],
      }],
    }], [{ room_id: 41, bedspace_id: null }]);

    expect(getBookingFloors(listing)[0].rooms[0]).toMatchObject({
      status: 'occupied',
      amenities: ['Room A Wi-Fi'],
      houseRules: ['Room A quiet hours'],
      maintenance: ['Room A serviced'],
    });
    expect(getBookingFloors(listing)[0].rooms[1]).toMatchObject({
      status: 'available',
      amenities: ['Room B desk'],
      houseRules: ['Room B visitors by approval'],
      maintenance: ['Room B cleaned'],
    });
    expect(isListingFullyBooked(listing)).toBe(false);
  });

  test('uses the lowest bookable price across every room and floor', () => {
    const [bedspaceListing, privateRoomListing] = mapDatabaseSpaces([
      {
        id: 1,
        name: 'Bedspace listing',
        location: 'Makati',
        type: 'Bedspace',
        description: '',
        monthly_rent: 12000,
        cover_photo_url: null,
        latitude: null,
        longitude: null,
        created_at: '2026-11-08T10:00:00Z',
        floors: [
          {
            id: 2,
            name: 'First floor',
            photo_url: null,
            rooms: [{
              id: 3,
              name: 'Room A',
              photo_url: null,
              monthly_rent: null,
              amenities: [],
              house_rules: [],
              maintenance: [],
              grid_rows: 1,
              grid_columns: 1,
              door_row: null,
              door_column: null,
              bedspaces: [{
                id: 4, name: 'Bed A', price: 8500, row: 1, column_index: 1,
                photo_url: null, amenities: [], house_rules: [], maintenance: [],
              }],
            }],
          },
          {
            id: 5,
            name: 'Second floor',
            photo_url: null,
            rooms: [{
              id: 6,
              name: 'Room B',
              photo_url: null,
              monthly_rent: null,
              amenities: [],
              house_rules: [],
              maintenance: [],
              grid_rows: 1,
              grid_columns: 1,
              door_row: null,
              door_column: null,
              bedspaces: [{
                id: 7, name: 'Bed B', price: 7200, row: 1, column_index: 1,
                photo_url: null, amenities: [], house_rules: [], maintenance: [],
              }],
            }],
          },
        ],
      },
      {
        id: 8,
        name: 'Private room listing',
        location: 'Makati',
        type: 'Private room',
        description: '',
        monthly_rent: 12000,
        cover_photo_url: null,
        latitude: null,
        longitude: null,
        created_at: '2026-11-08T10:00:00Z',
        floors: [{
          id: 9,
          name: 'Ground floor',
          photo_url: null,
          rooms: [
            {
              id: 10,
              name: 'Room A',
              photo_url: null,
              monthly_rent: 9500,
              amenities: [],
              house_rules: [],
              maintenance: [],
              grid_rows: 1,
              grid_columns: 1,
              door_row: null,
              door_column: null,
              bedspaces: [],
            },
            {
              id: 11,
              name: 'Room B',
              photo_url: null,
              monthly_rent: 7800,
              amenities: [],
              house_rules: [],
              maintenance: [],
              grid_rows: 1,
              grid_columns: 1,
              door_row: null,
              door_column: null,
              bedspaces: [],
            },
          ],
        }],
      },
    ]);

    expect(bedspaceListing.price).toBe(7200);
    expect(privateRoomListing.price).toBe(7800);
  });
});
