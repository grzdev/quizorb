import { useEffect, useRef, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import type { QuestionPayload } from "../types";
import styles from "./QuestionScreen.module.css";

interface Props {
  question: QuestionPayload;
  roomCode: string;
}

export default function QuestionScreen({ question, roomCode }: Props) {
  const socket = useSocket();

  const [trackedId, setTrackedId] = useState(question.questionId);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(question.timeLimit);

  // Tracks whether an answer has been submitted for the current question
  // to prevent double-submission (manual click + timeout race).
  const submittedRef = useRef(false);

  if (trackedId !== question.questionId) {
    setTrackedId(question.questionId);
    setSelected(null);
    setTimeLeft(question.timeLimit);
  }

  // Reset the submission guard whenever the question changes.
  // Declared before the auto-submit effect so React runs it first.
  useEffect(() => {
    submittedRef.current = false;
  }, [question.questionId]);

  // Countdown timer — restarted on each new question.
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [question.questionId]);

  // Auto-submit on timeout so the server always receives an answer from
  // every player and the question can advance.
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

  return (
    <div className={styles.container}>
      {/* Timer */}
      <div className={styles.timerSection}>
        <span className={`${styles.timerCount} ${timerWarning ? styles.timerWarning : ""}`}>
          {timeLeft}
        </span>
        <div className={styles.timerBar}>
          <div
            className={`${styles.timerFill} ${timerWarning ? styles.timerWarning : ""}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Question card — keyed so it re-animates on each new question */}
      <div key={question.questionId} className={styles.questionCard}>
        <p className={styles.questionText}>{question.text}</p>
      </div>

      {/* Options — keyed to re-stagger on each new question */}
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

      {answerLocked && (
        <p className={styles.waiting}>
          {timeLeft === 0 ? "⏰ Time's up!" : "✓ Answer submitted — waiting for others…"}
        </p>
      )}
    </div>
  );
}

