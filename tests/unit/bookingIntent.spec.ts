import { describe, expect, test } from 'vitest';
import { parseBookingIntent } from '../../src/lib/bookingIntent';

describe('booking receipt intent', () => {
  test('accepts a complete bedspace booking intent', () => {
    expect(parseBookingIntent(JSON.stringify({
      receiptToken: 'receipt-token',
      spaceId: 10,
      roomId: 20,
      bedspaceId: 30,
      moveIn: '2026-12-01',
      message: '',
      tenantName: 'Alex Reyes',
      tenantEmail: 'alex@example.com',
    }))).toMatchObject({
      spaceId: 10,
      roomId: 20,
      bedspaceId: 30,
    });
  });

  test('rejects booking intent without database room identifiers', () => {
    expect(() => parseBookingIntent(JSON.stringify({
      receiptToken: 'receipt-token',
      spaceId: 10,
      roomId: 'mock-room-id',
      bedspaceId: null,
      moveIn: '2026-12-01',
      message: '',
      tenantName: 'Alex Reyes',
      tenantEmail: 'alex@example.com',
    }))).toThrow('Booking details are incomplete');
  });
});
