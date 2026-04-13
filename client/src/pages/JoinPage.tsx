import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket.ts'
import type { Room, RoomInfo } from '../types.ts'
import { getFriendlyRoomErrorMessage } from '../utils/roomErrors.ts'
import styles from './JoinPage.module.css'

export default function JoinPage() {
  const socket = useSocket()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCode = searchParams.get('code') ?? ''
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState(() => initialCode.toUpperCase())
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)

  useEffect(() => {
    if (roomCode.length === 6) {
      socket.emit('room:info', { roomCode }, (res: { error?: string; info?: RoomInfo }) => {
        if (res.info) {
          setRoomInfo(res.info)
        } else {
          setRoomInfo(null)
        }
      })
    } else {
      setRoomInfo(null)
    }
  }, [roomCode, socket])

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
          setError(getFriendlyRoomErrorMessage(res.error))
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
              autoFocus={!initialCode}
            />
          </label>

          {roomInfo && (
            <div className={styles.roomInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Mode:</span>
                <span className={styles.infoValue}>{roomInfo.mode}</span>
              </div>
              {roomInfo.quizSource?.topic && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Topic:</span>
                  <span className={styles.infoValue}>{roomInfo.quizSource.topic}</span>
                </div>
              )}
              {roomInfo.quizSource?.type === 'social-pack' && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Pack:</span>
                  <span className={styles.infoValue}>{roomInfo.quizSource.packId}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Questions:</span>
                <span className={styles.infoValue}>{roomInfo.questionCount}</span>
              </div>
            </div>
          )}

          <label className={styles.field}>
            <span className={styles.label}>Your name</span>
            <input
              className={styles.input}
              type="text"
              placeholder="e.g. Alice"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              autoFocus={!!initialCode}
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
