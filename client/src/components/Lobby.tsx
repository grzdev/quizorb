import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import type { Room } from "../types";
import { getJoinUrl, getWhatsAppShareUrl, getXShareUrl } from "../utils/share";
import styles from "./Lobby.module.css";

interface Props {
  initialRoom: Room;
  onGameStart: () => void;
  isHost?: boolean;
}

export default function Lobby({ initialRoom, onGameStart, isHost = false }: Props) {
  const socket = useSocket();
  const [room, setRoom] = useState<Room>(initialRoom);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(room.roomCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  function copyLink() {
    navigator.clipboard.writeText(getJoinUrl(room.roomCode));
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }

  useEffect(() => {
    function onRoomUpdated(updated: Room) {
      setRoom(updated);
    }

    socket.on("room:updated", onRoomUpdated);

    return () => {
      socket.off("room:updated", onRoomUpdated);
    };
  }, [socket]);

  useEffect(() => {
    function onQuestionStarted() {
      onGameStart();
    }

    socket.on("question:started", onQuestionStarted);

    return () => {
      socket.off("question:started", onQuestionStarted);
    };
  }, [socket, onGameStart]);

  function handleStart() {
    socket.emit("game:start", { roomCode: room.roomCode });
  }

  return (
    <div className={styles.container}>
      <div className={styles.panel}>

        {/* ── Invite players ── */}
        <div className={styles.inviteCard}>
          <span className={styles.inviteCardLabel}>
            {isHost ? 'Invite players' : 'Room code'}
          </span>
          <span className={styles.codeValue}>{room.roomCode}</span>
          {isHost ? (
            <>
              <div className={styles.copyRow}>
                <button className={styles.copyBtn} onClick={copyCode}>
                  {codeCopied ? 'Copied!' : 'Copy code'}
                </button>
                <button className={styles.copyBtn} onClick={copyLink}>
                  {linkCopied ? 'Link copied!' : 'Copy link'}
                </button>
              </div>
              <div className={styles.shareRow}>
                <a
                  className={`${styles.shareBtn} ${styles.shareBtnWa}`}
                  href={getWhatsAppShareUrl(room.roomCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
                <a
                  className={`${styles.shareBtn} ${styles.shareBtnX}`}
                  href={getXShareUrl(room.roomCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  𝕏
                </a>
              </div>
            </>
          ) : (
            <span className={styles.codeHint}>Waiting for the host to start…</span>
          )}
        </div>

        {room.mode === "wkmb" && (
          <div className={styles.modeBadge}>👤 Who Knows Me Best</div>
        )}

        <div className={styles.roomInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Mode:</span>
            <span className={styles.infoValue}>{room.mode}</span>
          </div>
          {room.quizSource?.topic && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Topic:</span>
              <span className={styles.infoValue}>{room.quizSource.topic}</span>
            </div>
          )}
          {room.quizSource?.type === 'social-pack' && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Pack:</span>
              <span className={styles.infoValue}>{room.quizSource.packId}</span>
            </div>
          )}
          {room.quizSource && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Questions:</span>
              <span className={styles.infoValue}>{room.quizSource.count}</span>
            </div>
          )}
        </div>

        {/* ── Players ── */}
        <section className={styles.players}>
          <div className={styles.playersHeading}>
            <span className={styles.playersLabel}>Players</span>
            <span className={styles.playerCount}>{room.players.length}</span>
          </div>

          <ul className={styles.playerList}>
            {room.players.map((player) => (
              <li key={player.id} className={styles.playerItem}>
                <span className={styles.playerAvatar}>
                  {player.name.charAt(0).toUpperCase()}
                </span>
                <span className={styles.playerName}>{player.name}</span>
              </li>
            ))}
          </ul>

          {room.players.length === 0 && (
            <p className={styles.emptyHint}>No players yet. Share the code above!</p>
          )}
        </section>

        {/* ── CTA ── */}
        <div className={styles.panelFooter}>
          {isHost && room.status === "lobby" ? (
            <button
              className={styles.startButton}
              onClick={handleStart}
              disabled={room.players.length < 1}
            >
              {room.players.length < 1 ? 'Waiting for players…' : 'Start game'}
            </button>
          ) : (
            <p className={styles.waitingText}>Waiting for the host to start the game…</p>
          )}
        </div>

      </div>
    </div>
  );
}
