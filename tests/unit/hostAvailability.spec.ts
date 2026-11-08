import { describe, expect, test } from 'vitest';
import { getHostSpaceAvailability } from '../../src/data/hostAvailability';

describe('host listing availability', () => {
  test('counts only unique bedspace reservations and normalizes database IDs', () => {
    const space = {
      type: 'Bedspace',
      floors: [{
        rooms: [{
          id: 10,
          bedspaces: [{ id: 101 }, { id: 102 }, { id: 103 }],
        }],
      }],
    };

    expect(getHostSpaceAvailability(space, [
      { room_id: 10, bedspace_id: '101' },
      { room_id: '10', bedspace_id: 101 },
      { room_id: 10, bedspace_id: null },
      { room_id: 99, bedspace_id: 999 },
    ])).toEqual({ total: 3, reserved: 1, available: 2 });
  });

  test('counts private rooms by room reservations, not bedspace reservations', () => {
    const space = {
      type: 'Private room',
      floors: [{
        rooms: [
          { id: 10, bedspaces: [] },
          { id: '11', bedspaces: [] },
        ],
      }],
    };

    expect(getHostSpaceAvailability(space, [
      { room_id: 10, bedspace_id: null },
      { room_id: '10', bedspace_id: null },
      { room_id: 11, bedspace_id: 999 },
    ])).toEqual({ total: 2, reserved: 1, available: 1 });
  });
});
