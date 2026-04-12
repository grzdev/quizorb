import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import HotSeatScreen from '../components/HotSeatScreen.tsx'
import Leaderboard from '../components/Leaderboard.tsx'
import Lobby from '../components/Lobby.tsx'
import QuestionScreen from '../components/QuestionScreen.tsx'
import { API_BASE } from '../config.ts'
import { useSocket } from '../hooks/useSocket.ts'
import type { Player, QuestionPayload, Room } from '../types.ts'
import styles from './PlayRoomPage.module.css'

type Screen = 'lobby' | 'question' | 'leaderboard' | 'finished'

export default function PlayRoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const socket = useSocket()
  const navigate = useNavigate()

  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>('lobby')
  const [question, setQuestion] = useState<QuestionPayload | null>(null)
  const [players, setPlayers] = useState<Player[]>([])

  // Fetch initial room state
  useEffect(() => {
    if (!roomCode) return

    fetch(`${API_BASE}/api/rooms/${roomCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('Room not found')
        return res.json() as Promise<Room>
      })
      .then((r) => {
        setRoom(r)
        setPlayers(r.players)
      })
      .catch((err: Error) => setError(err.message))
  }, [roomCode])

  // Socket event listeners for game progression
  useEffect(() => {
    function onQuestionStarted(q: QuestionPayload) {
      setQuestion(q)
      setScreen('question')
    }

    function onLeaderboardUpdated(updated: Player[]) {
      setPlayers(updated)
      setScreen('leaderboard')
    }

    function onGameFinished(final: Player[]) {
      setPlayers(final)
      setScreen('finished')
    }

    socket.on('question:started', onQuestionStarted)
    socket.on('leaderboard:updated', onLeaderboardUpdated)
    socket.on('game:finished', onGameFinished)

    return () => {
      socket.off('question:started', onQuestionStarted)
      socket.off('leaderboard:updated', onLeaderboardUpdated)
      socket.off('game:finished', onGameFinished)
    }
  }, [socket])

  const handleGameStart = useCallback(() => setScreen('question'), [])

  if (error) {
    return <div className={styles.statusMsg}><p>{error}</p></div>
  }

  if (!room) {
    return <div className={styles.statusMsg}><p>Loading…</p></div>
  }

  if (screen === 'question' && question) {
    if (room.mode === 'hotseat') {
      return <HotSeatScreen question={question} roomCode={room.roomCode} myId={socket.id} />
    }
    return <QuestionScreen question={question} roomCode={room.roomCode} />
  }

  if (screen === 'leaderboard') {
    return <Leaderboard initialPlayers={players} myId={socket.id} />
  }

  if (screen === 'finished') {
    return (
      <div className={styles.finishedContainer}>
        <Leaderboard initialPlayers={players} myId={socket.id} />
        <button className={styles.homeButton} onClick={() => navigate('/')}>
          🏠 Back to Home
        </button>
      </div>
    )
  }

  return <Lobby initialRoom={room} onGameStart={handleGameStart} />
}
