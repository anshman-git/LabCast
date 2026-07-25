export class RoomNotFoundError extends Error {
  constructor() { super('No room was found with that code.') }
}

export class RoomCodeGenerationError extends Error {
  constructor() { super('Unable to reserve a room code. Please try again.') }
}

export function toRoomErrorMessage(error: unknown) {
  if (error instanceof RoomNotFoundError || error instanceof RoomCodeGenerationError) return error.message
  if (typeof error === 'object' && error && 'code' in error && String(error.code) === 'permission-denied') return 'You do not have permission to complete this action.'
  if (typeof error === 'object' && error && 'code' in error && String(error.code) === 'unavailable') return 'Room service is temporarily unavailable. Please try again.'
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
