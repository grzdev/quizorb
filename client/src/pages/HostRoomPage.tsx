import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import HotSeatScreen from '../components/HotSeatScreen.tsx'
import Leaderboard from '../components/Leaderboard.tsx'
import Lobby from '../components/Lobby.tsx'
import QuestionScreen from '../components/QuestionScreen.tsx'
import SpectatorScreen from '../components/SpectatorScreen.tsx'
import { useSocket } from '../hooks/useSocket.ts'
import type { HostMode, Player, QuestionPayload, Room, SocialModeType } from '../types.ts'
import styles from './HostRoomPage.module.css'

type Screen = 'lobby' | 'question' | 'leaderboard' | 'finished'

export default function HostRoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const hostName = (location.state as { hostName?: string; hostMode?: HostMode; socialModeType?: SocialModeType } | null)?.hostName ?? 'Host'
  const hostMode: HostMode = (location.state as { hostName?: string; hostMode?: HostMode; socialModeType?: SocialModeType } | null)?.hostMode ?? 'spectate'
  const socialModeType = (location.state as { hostName?: string; hostMode?: HostMode; socialModeType?: SocialModeType } | null)?.socialModeType
  const socket = useSocket()
  const joinSentRef = useRef(false)
  const [room, setRoom] = useState<Room | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [joined, setJoined] = useState(false)
  const [screen, setScreen] = useState<Screen>('lobby')
  const [question, setQuestion] = useState<QuestionPayload | null>(null)
  const [players, setPlayers] = useState<Player[]>([])

  // ── Join / connect to room ───────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode) return

    function join() {
      // Guard against StrictMode double-invocation: the effect cleanup removes
      // socket.once('connect', join), so on the second mount pass this is
      // re-registered correctly. The ref only prevents join() itself firing twice
      // (e.g. if somehow both the connect event and a direct call race).
      if (joinSentRef.current) return
      joinSentRef.current = true
      // Social quiz modes: host always joins as spectator so hostSocketId is set on the server.
      // This enables quick-play live answer tracking and excludes host from leaderboard.
      if (hostMode === 'player' && !socialModeType) {
        socket.emit(
          'room:join',
          { roomCode, playerName: hostName },
          (res: { error?: string; room?: Room }) => {
            if (res.error) {
              setError(res.error)
              return
            }
            if (res.room) {
              setRoom(res.room)
              setPlayers(res.room.players)
            }
            setJoined(true)
          },
        )
      } else {
        socket.emit(
          'host:join',
          { roomCode },
          (res: { error?: string; room?: Room }) => {
            if (res.error) {
              setError(res.error)
              return
            }
            if (res.room) {
              setRoom(res.room)
              setPlayers(res.room.players)
            }
            setJoined(true)
          },
        )
      }
    }

    if (socket.connected) {
      join()
    } else {
      socket.once('connect', join)
    }

    return () => {
      socket.off('connect', join)
    }
  }, [roomCode, hostName, hostMode, socket])

  // ── Game event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    if (!joined) return

    function onRoomUpdated(updated: Room) {
      setRoom(updated)
      if (updated.status === 'lobby') {
        setScreen('lobby')
        setQuestion(null)
      }
    }

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

    socket.on('room:updated', onRoomUpdated)
    socket.on('question:started', onQuestionStarted)
    socket.on('leaderboard:updated', onLeaderboardUpdated)
    socket.on('game:finished', onGameFinished)

    return () => {
      socket.off('room:updated', onRoomUpdated)
      socket.off('question:started', onQuestionStarted)
      socket.off('leaderboard:updated', onLeaderboardUpdated)
      socket.off('game:finished', onGameFinished)
    }
  }, [socket, joined])

  function handlePlayAgain() {
    if (!roomCode) return
    socket.emit('room:reset', { roomCode })
  }

  function handleCreateNew() {
    navigate('/create')
  }

  function handleGoHome() {
    navigate('/')
  }

  if (error) {
    return <div className={styles.statusMsg}><p>{error}</p></div>
  }

  if (!room) {
    return <div className={styles.statusMsg}><p>Loading…</p></div>
  }

  if (screen === 'question' && question) {
    // Hot Seat: host playing → HotSeatScreen (they participate in the rotation)
    if (room.mode === 'hotseat' && hostMode === 'player') {
      return <HotSeatScreen question={question} roomCode={room.roomCode} myId={socket.id} />
    }
    // Social modes or spectate → always show spectator view
    if (socialModeType || hostMode === 'spectate') {
      return (
        <SpectatorScreen
          question={question}
          playerCount={players.length}
          isQuickPlay={socialModeType === 'quick-play'}
          isPrefilledHost={socialModeType === 'set-answers-first'}
          roomCode={room.roomCode}
          hotSeatTargetName={room.mode === 'hotseat' ? question.targetPlayerName : undefined}
        />
      )
    }
    return <QuestionScreen question={question} roomCode={room.roomCode} />
  }

  if (screen === 'leaderboard') {
    return <Leaderboard initialPlayers={players} myId={hostMode === 'player' && !socialModeType ? socket.id : undefined} />
  }

  if (screen === 'finished') {
    return (
      <div className={styles.finishedContainer}>
        <h1 className={styles.finishedHeading}>Game Over</h1>
        <Leaderboard initialPlayers={players} myId={hostMode === 'player' && !socialModeType ? socket.id : undefined} />
        <div className={styles.actions}>
          <button className={styles.playAgainButton} onClick={handlePlayAgain}>
            Play Again
          </button>
          <button className={styles.createNewButton} onClick={handleCreateNew}>
            Create New Game
          </button>
          <button className={styles.homeButton} onClick={handleGoHome}>
            🏠 Home
          </button>
        </div>
      </div>
    )
  }

  return <Lobby initialRoom={room} onGameStart={() => setScreen('question')} isHost />
}


