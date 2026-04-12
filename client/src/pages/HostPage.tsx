import { useParams } from 'react-router-dom'

export default function HostPage() {
  const { roomCode } = useParams<{ roomCode: string }>()

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Host Lobby</h1>
      <p>Room: <strong>{roomCode}</strong></p>
    </main>
  )
}
