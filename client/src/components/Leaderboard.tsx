import { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import type { Player } from "../types";
import styles from "./Leaderboard.module.css";

const MEDALS = ["🥇", "🥈", "🥉"];
const MEDAL_LABELS = ["1st Place", "2nd Place", "3rd Place"];
const RANK_CLASSES = ["rank1", "rank2", "rank3"] as const;

interface Props {
  initialPlayers: Player[];
  myId?: string;
}

export default function Leaderboard({ initialPlayers, myId }: Props) {
  const socket = useSocket();
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [deltas, setDeltas] = useState<Map<string, number>>(new Map());
  const [updateKey, setUpdateKey] = useState(0);

  const prevScoresRef = useRef<Map<string, number>>(
    new Map(initialPlayers.map((p) => [p.id, p.score]))
  );
  const deltaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onLeaderboardUpdated(updated: Player[]) {
      const newDeltas = new Map<string, number>();
      for (const p of updated) {
        const prev = prevScoresRef.current.get(p.id) ?? 0;
        const diff = p.score - prev;
        if (diff > 0) newDeltas.set(p.id, diff);
      }
      prevScoresRef.current = new Map(updated.map((p) => [p.id, p.score]));

      setPlayers(updated);
      setDeltas(newDeltas);
      setUpdateKey((k) => k + 1);

      if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
      deltaTimerRef.current = setTimeout(() => setDeltas(new Map()), 2500);
    }

    function onGameFinished(final: Player[]) {
      prevScoresRef.current = new Map(final.map((p) => [p.id, p.score]));
      setPlayers(final);
      setUpdateKey((k) => k + 1);
    }

    socket.on("leaderboard:updated", onLeaderboardUpdated);
    socket.on("game:finished", onGameFinished);

    return () => {
      socket.off("leaderboard:updated", onLeaderboardUpdated);
      socket.off("game:finished", onGameFinished);
      if (deltaTimerRef.current) clearTimeout(deltaTimerRef.current);
    };
  }, [socket]);

  const podium = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p className={styles.headingEyebrow}>Final standings</p>
        <h2 className={styles.heading}>🏆 Leaderboard</h2>
      </div>

      <div className={styles.panel}>
        {/* Top 3 — podium cards */}
        {podium.length > 0 && (
          <div key={`podium-${updateKey}`} className={styles.podium}>
            {podium.map((player, index) => {
              const delta = deltas.get(player.id);
              const isMe = player.id === myId;
              return (
                <div
                  key={player.id}
                  className={[
                    styles.podiumCard,
                    styles[RANK_CLASSES[index]],
                    isMe ? styles.isMe : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span className={styles.podiumMedal}>{MEDALS[index]}</span>
                  <span className={styles.podiumAvatar}>
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                  <div className={styles.podiumInfo}>
                    <span className={styles.podiumName}>
                      {player.name}
                      {isMe && <span className={styles.meTag}>you</span>}
                    </span>
                    <span className={styles.podiumLabel}>{MEDAL_LABELS[index]}</span>
                  </div>
                  <div className={styles.podiumScoreWrap}>
                    <span className={styles.podiumScore}>
                      {player.score.toLocaleString()}
                    </span>
                    {delta !== undefined && (
                      <span className={styles.delta}>+{delta}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4th+ — compact rows */}
        {rest.length > 0 && (
          <ol key={`rest-${updateKey}`} className={styles.list} start={4}>
            {rest.map((player, i) => {
              const delta = deltas.get(player.id);
              const isMe = player.id === myId;
              return (
                <li
                  key={player.id}
                  className={`${styles.row} ${isMe ? styles.isMe : ""}`}
                  style={{ animationDelay: `${(i + podium.length) * 55}ms` }}
                >
                  <span className={styles.rank}>#{i + 4}</span>
                  <span className={styles.avatar}>
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.name}>
                    {player.name}
                    {isMe && <span className={styles.meTag}>you</span>}
                  </span>
                  <div className={styles.scoreWrap}>
                    <span className={styles.score}>
                      {player.score.toLocaleString()}
                    </span>
                    {delta !== undefined && (
                      <span className={styles.delta}>+{delta}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {players.length === 0 && (
          <p className={styles.empty}>No players yet.</p>
        )}
      </div>
    </div>
  );
}
