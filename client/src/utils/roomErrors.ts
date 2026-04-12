const FRIENDLY_ROOM_NOT_FOUND = "That room doesn't exist or may have already ended. Check the code and try again."

export function getFriendlyRoomErrorMessage(error?: string): string {
  if (!error) return FRIENDLY_ROOM_NOT_FOUND

  const normalized = error.toLowerCase()
  if (normalized.includes('not found')) {
    return FRIENDLY_ROOM_NOT_FOUND
  }

  return error
}
