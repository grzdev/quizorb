import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import type { AnswersProgress, QuestionPayload } from "../types";
import styles from "./SpectatorScreen.module.css";

interface Props {
  question: QuestionPayload;
  playerCount: number;
  isQuickPlay?: boolean;
  isPrefilledHost?: boolean;
  roomCode?: string;
  hotSeatTargetName?: string;
}

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function SpectatorScreen({ question, playerCount, isQuickPlay, isPrefilledHost, roomCode, hotSeatTargetName }: Props) {
  const socket = useSocket();

  const [timeLeft, setTimeLeft] = useState(question.timeLimit);
  const [trackedId, setTrackedId] = useState(question.questionId);
  const [hostSelectedIndex, setHostSelectedIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<AnswersProgress>({
    questionId: question.questionId,
    answered: 0,
    total: playerCount,
    optionCounts: new Array<number>(question.options.length).fill(0),
    optionVoters: question.options.map(() => []),
  });

  if (trackedId !== question.questionId) {
    setTrackedId(question.questionId);
    setTimeLeft(question.timeLimit);
    setHostSelectedIndex(null);
    setProgress({
      questionId: question.questionId,
      answered: 0,
      total: playerCount,
      optionCounts: new Array<number>(question.options.length).fill(0),
      optionVoters: question.options.map(() => []),
    });
  }

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

  // Listen for live answer progress from the server.
  useEffect(() => {
    function onAnswersProgress(data: AnswersProgress) {
      if (data.questionId === question.questionId) {
        setProgress(data);
      }
    }

    socket.on("answers:progress", onAnswersProgress);
    return () => {
      socket.off("answers:progress", onAnswersProgress);
    };
  }, [socket, question.questionId]);

  function handleHostAnswer(index: number) {
    if (hostSelectedIndex !== null || !roomCode) return;
    setHostSelectedIndex(index);
    socket.emit("answer:submit", {
      roomCode,
      questionId: question.questionId,
      selectedIndex: index,
    });
  }

  const timerWarning = timeLeft <= 5;
  const timerProgress = timeLeft / question.timeLimit;

  return (
    <div className={styles.container}>
      {hotSeatTargetName && (
        <div className={styles.hotSeatBanner}>
          🔥 Hot Seat: <strong>{hotSeatTargetName}</strong>
        </div>
      )}
      <div className={styles.timerBar}>
        <div
          className={`${styles.timerFill} ${timerWarning ? styles.timerWarning : ""}`}
          style={{ width: `${timerProgress * 100}%` }}
        />
      </div>
      <span className={`${styles.timerLabel} ${timerWarning ? styles.timerWarning : ""}`}>
        {timeLeft}s
      </span>

      <p className={styles.questionText}>{question.text}</p>

      <ul className={styles.options}>
        {question.options.map((option, i) => {
          const votes = progress.optionCounts[i] ?? 0;
          const pct = progress.total > 0 ? (votes / progress.total) * 100 : 0;
          const isSelected = hostSelectedIndex === i;
          const answered = hostSelectedIndex !== null;
          return (
            <li
              key={i}
              className={[
                styles.option,
                isQuickPlay ? styles.optionInteractive : '',
                isQuickPlay && isSelected ? styles.optionSelected : '',
                isQuickPlay && answered && !isSelected ? styles.optionDimmed : '',
              ].filter(Boolean).join(' ')}
              style={{ "--vote-pct": `${pct}%` } as React.CSSProperties}
              {...(isQuickPlay && !answered && {
                onClick: () => handleHostAnswer(i),
                role: 'button' as const,
                tabIndex: 0,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') handleHostAnswer(i);
                },
              })}
            >
              <span className={styles.optionBadge}>{OPTION_LABELS[i]}</span>
              <span className={styles.optionText}>{option}</span>
              {(progress.optionVoters[i]?.length ?? 0) > 0 && (
                <span className={styles.voterChips}>
                  {progress.optionVoters[i]!.map((name, vi) => (
                    <span key={vi} className={styles.voterChip}>
                      {name[0]!.toUpperCase()}{name.length > 1 ? name[1]!.toLowerCase() : ''}
                    </span>
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>

      {isQuickPlay && (
        <p className={styles.hostAnswerLabel}>
          {hostSelectedIndex !== null
            ? `✓ Your answer: ${OPTION_LABELS[hostSelectedIndex]}`
            : 'Pick your answer. Players will be scored against it.'}
        </p>
      )}

      {isPrefilledHost && (
        <p className={styles.hostAnswerLabel}>👁 Your answers are locked in. Watch your players.</p>
      )}

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: progress.total > 0
              ? `${(progress.answered / progress.total) * 100}%`
              : "0%",
          }}
        />
      </div>
      <p className={styles.progressLabel}>
        {progress.answered} / {progress.total} answered
      </p>
    </div>
  );
}
