export type BookingIntent = {
  receiptToken: string;
  spaceId: number;
  roomId: number;
  bedspaceId: number | null;
  moveIn: string;
  message: string;
  tenantName: string;
  tenantEmail: string;
};

export const bookingIntentStorageKey = 'casa:booking-intent';
export const paidReceiptStorageKey = 'casa:paid-receipt';

function isBookingIntent(value: unknown): value is BookingIntent {
  if (typeof value !== 'object' || value === null) return false;
  const intent = value as Record<string, unknown>;
  return typeof intent.receiptToken === 'string'
    && Number.isSafeInteger(intent.spaceId) && Number(intent.spaceId) > 0
    && Number.isSafeInteger(intent.roomId) && Number(intent.roomId) > 0
    && (intent.bedspaceId === null || (Number.isSafeInteger(intent.bedspaceId) && Number(intent.bedspaceId) > 0))
    && typeof intent.moveIn === 'string'
    && typeof intent.message === 'string'
    && typeof intent.tenantName === 'string'
    && typeof intent.tenantEmail === 'string';
}

export function parseBookingIntent(raw: string): BookingIntent {
  const parsed: unknown = JSON.parse(raw);
  if (!isBookingIntent(parsed)) {
    throw new Error('Booking details are incomplete. Return to the listing and start again.');
  }

  return parsed;
}
