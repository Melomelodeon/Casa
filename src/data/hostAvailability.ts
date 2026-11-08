export type HostAvailabilitySpace = {
  type: string;
  floors: Array<{
    rooms: Array<{
      id: number | string;
      bedspaces: Array<{ id: number | string }>;
    }>;
  }>;
};

export type HostReservation = {
  room_id: number | string;
  bedspace_id: number | string | null;
};

export function getHostSpaceAvailability(
  space: HostAvailabilitySpace,
  reservations: HostReservation[],
) {
  const rooms = space.floors.flatMap((floor) => floor.rooms);
  const isPrivateRoom = space.type === 'Private room';
  const capacityIds = new Set(
    (isPrivateRoom ? rooms.map((room) => room.id) : rooms.flatMap((room) => room.bedspaces.map((bed) => bed.id)))
      .map(String),
  );
  const reservedIds = new Set<string>();

  for (const reservation of reservations) {
    if (isPrivateRoom && reservation.bedspace_id === null && capacityIds.has(String(reservation.room_id))) {
      reservedIds.add(String(reservation.room_id));
    } else if (!isPrivateRoom && reservation.bedspace_id !== null && capacityIds.has(String(reservation.bedspace_id))) {
      reservedIds.add(String(reservation.bedspace_id));
    }
  }

  const total = capacityIds.size;
  const reserved = reservedIds.size;
  return { total, reserved, available: total - reserved };
}
