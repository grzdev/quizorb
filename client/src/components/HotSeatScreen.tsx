import { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import type { QuestionPayload } from "../types";
import styles from "./HotSeatScreen.module.css";

interface Props {
  question: QuestionPayload;
  roomCode: string;
  myId?: string;
}

export default function HotSeatScreen({ question, roomCode, myId }: Props) {
  const socket = useSocket();

  const isTarget = myId != null && myId === question.targetPlayerId;
  const targetName = question.targetPlayerName ?? "the hot seat player";

  const [trackedId, setTrackedId] = useState(question.questionId);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);

  const submittedRef = useRef(false);

  if (trackedId !== question.questionId) {
    setTrackedId(question.questionId);
    setSelected(null);
    setTimeLeft(question.timeLimit);
  }

  useEffect(() => {
    submittedRef.current = false;
  }, [question.questionId]);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [question.questionId]);

  useEffect(() => {
    if (timeLeft === 0 && !submittedRef.current) {
      submittedRef.current = true;
      socket.emit("answer:submit", {
        roomCode,
        questionId: question.questionId,
        selectedIndex: -1,
      });
    }
  }, [timeLeft, socket, roomCode, question.questionId]);

  const answerLocked = selected !== null || timeLeft === 0;

  function handleSelect(index: number) {
    if (answerLocked) return;
    submittedRef.current = true;
    setSelected(index);
    socket.emit("answer:submit", {
      roomCode,
      questionId: question.questionId,
      selectedIndex: index,
    });
  }

  const progress = timeLeft / question.timeLimit;
  const timerWarning = timeLeft <= 5;

  const waitingMessage = answerLocked
    ? timeLeft === 0
      ? "⏰ Time's up!"
      : isTarget
        ? "🔒 Locked in. Let's see if they know you!"
        : `✓ Locked in, waiting for ${targetName} and others…`
    : null;

  return (
    <div className={styles.container}>
      {/* Hot seat banner */}
      <div className={`${styles.banner} ${isTarget ? styles.bannerTarget : styles.bannerGuesser}`}>
        <span className={styles.bannerIcon}>🔥</span>
        <div className={styles.bannerText}>
          {isTarget ? (
            <>
              <strong>You're in the Hot Seat!</strong>
              <span>Your friends are guessing what you'll choose</span>
            </>
          ) : (
            <>
              <strong>Hot Seat</strong>
              <span>Guess what <strong className={styles.targetName}>{targetName}</strong> will choose</span>
            </>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className={styles.timerSection}>
        <div className={styles.timerBar}>
          <div
            className={`${styles.timerFill} ${timerWarning ? styles.timerWarning : ""}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className={`${styles.timerCount} ${timerWarning ? styles.timerWarning : ""}`}>
          {timeLeft}
        </span>
      </div>

      {/* Question card */}
      <div key={question.questionId} className={styles.questionCard}>
        <p className={styles.questionText}>{question.text}</p>
      </div>

      {/* Options */}
      <ul key={`opts-${question.questionId}`} className={styles.options}>
        {question.options.map((option, i) => (
          <li key={i}>
            <button
              className={`${styles.option} ${selected === i ? styles.optionSelected : ""}`}
              onClick={() => handleSelect(i)}
              disabled={answerLocked}
            >
              <span className={styles.optionBadge}>
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          </li>
        ))}
      </ul>

      {waitingMessage && (
        <p className={styles.waiting}>{waitingMessage}</p>
      )}
    </div>
  );
}
