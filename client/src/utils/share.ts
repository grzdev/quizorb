export function getJoinUrl(roomCode: string): string {
  const params = new URLSearchParams({ code: roomCode })
  return `${window.location.origin}/join?${params}`
}

export function getShareMessage(roomCode: string): string {
  return `Join my QuizOrb game. Room code: ${roomCode}. Play here: ${getJoinUrl(roomCode)}`
}

export function getWhatsAppShareUrl(roomCode: string): string {
  const params = new URLSearchParams({ text: getShareMessage(roomCode) })
  return `https://wa.me/?${params}`
}

export function getXShareUrl(roomCode: string): string {
  const params = new URLSearchParams({ text: getShareMessage(roomCode) })
  return `https://x.com/intent/post?${params}`
}
