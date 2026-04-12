import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket.ts'
import type { Room } from '../types.ts'
import styles from './JoinPage.module.css'

export default function JoinPage() {
  const socket = useSocket()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState(() => (searchParams.get('code') ?? '').toUpperCase())
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const name = playerName.trim()
    const code = roomCode.trim().toUpperCase()

    if (!name) { setError('Please enter your name.'); return }
    if (!code) { setError('Please enter a room code.'); return }

    setJoining(true)

    socket.emit(
      'room:join',
      { roomCode: code, playerName: name },
      (res: { error?: string; room?: Room }) => {
        setJoining(false)
        if (res.error) {
          setError(res.error)
          return
        }
        navigate(`/play/${code}`)
      },
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Join Game</h1>
          <p className={styles.subheading}>Enter the room code to jump straight in.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Room code</span>
            <input
              className={`${styles.input} ${styles.codeInput}`}
              type="text"
              placeholder="ABC123"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              spellCheck={false}
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Your name</span>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. Alice"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={joining}>
            {joining ? 'Joining…' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  )
}
