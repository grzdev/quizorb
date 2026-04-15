import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../config.ts'
import type { GeneratedQuestion, HostMode, RoomMode, SocialModeType, SocialPackId, Topic, TriviaDifficulty } from '../types.ts'
import styles from './CreatePage.module.css'

/** Safely reads a fetch Response as JSON. Throws a readable error if the
 *  response is not ok, preventing crashes when the server returns HTML. */
async function safeFetch<T>(res: Response, route: string): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    console.error(`[${route}] error response (${res.status}):`, text)
    let message: string
    try {
      const parsed = JSON.parse(text) as { error?: string; details?: string }
      message = parsed.details ?? parsed.error ?? `Server error (${res.status})`
    } catch {
      message = `Server error (${res.status})`
    }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}

// ── Constants ────────────────────────────────────────────────────────────────

const TOPIC_OPTIONS: { value: Topic; label: string; emoji: string }[] = [
  { value: 'science', label: 'Science', emoji: '🔬' },
  { value: 'history', label: 'History', emoji: '📜' },
  { value: 'technology', label: 'Technology', emoji: '💻' },
  { value: 'geography', label: 'Geography', emoji: '🌍' },
  { value: 'movies', label: 'Movies', emoji: '🎬' },
  { value: 'music', label: 'Music', emoji: '🎵' },
  { value: 'sports', label: 'Sports', emoji: '⚽' },
  { value: 'food', label: 'Food & Drink', emoji: '🍜' },
  { value: 'anime', label: 'Anime', emoji: '⛩️' },
  { value: 'gaming', label: 'Gaming', emoji: '🎮' },
  { value: 'pop-culture', label: 'Pop Culture', emoji: '🌟' },
  { value: 'nature', label: 'Nature', emoji: '🌿' },
]

const COUNT_OPTIONS = [5, 10, 15]
const DIFFICULTY_OPTIONS: { value: TriviaDifficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
]
const OPTION_LABELS = ['A', 'B', 'C', 'D']
const DEFAULT_TIME_LIMIT = 20

// ── Mode definitions ─────────────────────────────────────────────────────────

type Mode = 'trivia' | 'wkmb' | 'hotseat' | 'custom'

interface ModeMeta {
  label: string
  icon: string
  desc: string
}

const MODE_META: Record<Mode, ModeMeta> = {
  trivia: { label: 'Trivia', icon: '🧠', desc: 'AI-generated questions across science, history, technology and geography.' },
  wkmb: { label: 'Who Knows Me Best', icon: '👤', desc: 'Players guess your preferences. Whoever knows you best wins!' },
  hotseat: { label: 'Hot Seat', icon: '🔥', desc: 'Players take turns in the hot seat while everyone else guesses what they would choose.' },
  custom: { label: 'Custom', icon: '✏️', desc: 'Write your own questions with fully custom answers.' },
}

const MODES = Object.keys(MODE_META) as Mode[]
const SOCIAL_MODES: Mode[] = ['wkmb', 'hotseat']
const SOCIAL_MODES_WITH_SETUP: Mode[] = ['wkmb']
const SOCIAL_PACK_ID: Record<string, SocialPackId> = {
  wkmb: 'wkmb',
  hotseat: 'wkmb',
}
const ROOM_MODE: Record<Mode, RoomMode> = {
  trivia: 'trivia', wkmb: 'wkmb', hotseat: 'hotseat', custom: 'custom',
}

interface DraftQuestion {
  text: string
  options: [string, string, string, string]
  correctIndex: number
}
function emptyDraft(): DraftQuestion { return { text: '', options: ['', '', '', ''], correctIndex: 0 } }

export default function CreatePage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('trivia')
  const [hostName, setHostName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [committedHostMode, setCommittedHostMode] = useState<HostMode>('player')
  const [committedSocialModeType, setCommittedSocialModeType] = useState<SocialModeType | null>(null)
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [hostMode, setHostMode] = useState<HostMode>('player')
  const [topic, setTopic] = useState<Topic>('science')
  const [triviaCount, setTriviaCount] = useState(10)
  const [triviaDifficulty, setTriviaDifficulty] = useState<TriviaDifficulty>('medium')
  const [triviaLoading, setTriviaLoading] = useState(false)
  const [triviaQuestions, setTriviaQuestions] = useState<GeneratedQuestion[] | null>(null)
  const [topicSource, setTopicSource] = useState<'default' | 'ai' | 'file'>('default')
  const [aiTopic, setAiTopic] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [socialCount, setSocialCount] = useState(10)
  const [socialLoading, setSocialLoading] = useState(false)
  const [socialQuestions, setSocialQuestions] = useState<GeneratedQuestion[] | null>(null)
  const [socialModeType, setSocialModeType] = useState<SocialModeType>('quick-play')
  const [hostAnswers, setHostAnswers] = useState<Record<number, number>>({})
  const [customQuestions, setCustomQuestions] = useState<GeneratedQuestion[]>([])
  const [draft, setDraft] = useState<DraftQuestion>(emptyDraft())
  const [draftError, setDraftError] = useState<string | null>(null)

  const previewRef = useRef<HTMLDivElement>(null)

  const activeQuestions: GeneratedQuestion[] | null =
    mode === 'trivia' ? triviaQuestions
    : SOCIAL_MODES.includes(mode) ? socialQuestions
    : customQuestions.length > 0 ? customQuestions
    : null

  // Custom questions are always shown — the host wrote them, they already know them.
  // For generated modes, only show the full list if the host chose spectate role.
  const showFullPreview = mode === 'custom' || hostMode === 'spectate'

  function switchMode(next: Mode) {
    setMode(next); setError(null); setRoomCode(null)
    if (!SOCIAL_MODES.includes(next)) setSocialQuestions(null)
    if (!SOCIAL_MODES_WITH_SETUP.includes(next)) setSocialModeType('quick-play')
    if (SOCIAL_MODES_WITH_SETUP.includes(next)) setHostMode('spectate')
    setHostAnswers({})
  }

  function getModeDesc() {
    const name = hostName.trim()
    if (name && SOCIAL_MODES.includes(mode)) {
      if (mode === 'wkmb') return `Players guess ${name}'s preferences — whoever knows ${name} best wins!`
      if (mode === 'hotseat') return `Players take turns in the hot seat — everyone guesses what they would choose.`
    }
    return MODE_META[mode].desc
  }

  function getSocialTitle() {
    const name = hostName.trim()
    if (!name || !SOCIAL_MODES.includes(mode)) return null
    if (mode === 'wkmb') return `Who knows ${name} best?`
    return null
  }

  async function handleGenerateTrivia(e: React.FormEvent) {
    e.preventDefault()
    if (topicSource === 'ai' && !aiTopic.trim()) { setError('Enter a topic to generate questions.'); return }
    setTriviaLoading(true); setError(null); setTriviaQuestions(null); setRoomCode(null)
    try {
      const topicLabel = topicSource === 'ai'
        ? aiTopic.trim()
        : TOPIC_OPTIONS.find((o) => o.value === topic)?.label ?? topic
      const topicStr: string = String(topicLabel)
      const count: number = Number(triviaCount)
      console.log('groq payload', { topic: String(topicStr), count: Number(count), difficulty: triviaDifficulty })
      const response = await fetch(`${API_BASE}/api/quizzes/groq-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: String(topicStr),
          count: Number(count),
          difficulty: triviaDifficulty,
        }),
      })
      if (!response.ok) {
        const text = await response.text()
        console.error('[groq-generate] error response:', text)
        let message: string
        try {
          const parsed = JSON.parse(text) as { error?: string; details?: string }
          message = parsed.details ?? parsed.error ?? `Server error (${response.status})`
        } catch {
          message = text || `Server error (${response.status})`
        }
        throw new Error(message)
      }
      const data = await response.json() as { questions: GeneratedQuestion[] }
      setTriviaQuestions(data.questions)
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (err) { setError((err as Error).message) } finally { setTriviaLoading(false) }
  }

  async function handleGenerateFromFile() {
    if (!uploadedFile) return
    setFileLoading(true); setError(null); setTriviaQuestions(null); setRoomCode(null)
    try {
      const formData = new FormData()
      formData.append('file', uploadedFile)
      formData.append('count', String(triviaCount))
      formData.append('difficulty', triviaDifficulty)
      const res = await fetch(`${API_BASE}/api/quizzes/from-file`, { method: 'POST', body: formData })
      const data = await safeFetch<{ questions?: GeneratedQuestion[] }>(res, 'quizzes/from-file')
      if (!data.questions || data.questions.length === 0) throw new Error('No valid questions could be generated from this file. Try a different file or add more content.')
      setTriviaQuestions(data.questions)
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (err) {
      setTriviaQuestions(null)
      setError((err as Error).message)
    } finally { setFileLoading(false) }
  }

  async function handleGenerateSocial() {
    const packId = SOCIAL_PACK_ID[mode]; if (!packId) return
    setSocialLoading(true); setSocialQuestions(null); setError(null); setRoomCode(null); setHostAnswers({})
    try {
      const res = await fetch(`${API_BASE}/api/packs/${packId}?count=${socialCount}`)
      if (!res.ok) throw new Error('Could not load questions')
      const data = await res.json() as { questions: GeneratedQuestion[] }
      setSocialQuestions(data.questions)
      setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (err) { setError((err as Error).message) } finally { setSocialLoading(false) }
  }

  function handleDraftOption(index: number, value: string) {
    const next = [...draft.options] as [string, string, string, string]
    next[index] = value; setDraft((d) => ({ ...d, options: next }))
  }

  function handleAddQuestion() {
    setDraftError(null)
    if (!draft.text.trim()) { setDraftError('Question prompt is required.'); return }
    if (draft.options.some((o) => !o.trim())) { setDraftError('All 4 options are required.'); return }
    const question: GeneratedQuestion = {
      text: draft.text.trim(),
      options: draft.options.map((o) => o.trim()) as [string, string, string, string],
      correctIndex: draft.correctIndex, timeLimit: DEFAULT_TIME_LIMIT,
    }
    setCustomQuestions((prev) => [...prev, question]); setDraft(emptyDraft()); setRoomCode(null)
  }

  function handleRemoveQuestion(index: number) {
    setCustomQuestions((prev) => prev.filter((_, i) => i !== index)); setRoomCode(null)
  }

  async function handleCreateRoom() {
    if (!activeQuestions) return
    setCreatingRoom(true); setError(null)
    try {
      // Compute quiz source metadata so the server can regenerate fresh questions on Play Again
      const quizSource: { type: string; topic?: string; difficulty?: TriviaDifficulty; packId?: string; count: number } =
        mode === 'trivia' && topicSource === 'default'
          ? { type: 'default-topic', topic, difficulty: triviaDifficulty, count: triviaCount }
          : mode === 'trivia' && topicSource === 'ai'
            ? { type: 'groq-topic', topic: aiTopic.trim(), difficulty: triviaDifficulty, count: triviaCount }
            : mode === 'trivia' && topicSource === 'file'
              ? { type: 'file', difficulty: triviaDifficulty, count: triviaCount }
              : SOCIAL_MODES.includes(mode)
                ? { type: 'social-pack', packId: SOCIAL_PACK_ID[mode] ?? 'wkmb', count: socialCount }
                : { type: 'custom', count: activeQuestions.length }

      const res = await fetch(`${API_BASE}/api/rooms/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: activeQuestions,
          mode: ROOM_MODE[mode],
          hostMode,
          quizSource,
          ...(SOCIAL_MODES_WITH_SETUP.includes(mode) && { socialModeType }),
          ...(SOCIAL_MODES_WITH_SETUP.includes(mode) && socialModeType === 'set-answers-first' && { hostAnswers }),
        }),
      })
      const data = await safeFetch<{ roomCode: string }>(res, 'rooms/create')
      setRoomCode(data.roomCode)
      setCommittedHostMode(hostMode)
      setCommittedSocialModeType(SOCIAL_MODES_WITH_SETUP.includes(mode) ? socialModeType : null)
    } catch (err) { setError((err as Error).message) } finally { setCreatingRoom(false) }
  }

  function renderQuestionPreview(questions: GeneratedQuestion[]) {
    const showChips = SOCIAL_MODES.includes(mode)
    const removable = mode === 'custom'
    const name = hostName.trim()
    const modeLabel = `${MODE_META[mode].icon} ${MODE_META[mode].label}`
    return (
      <section className={styles.results}>
        <div className={styles.previewHead}>
          {showChips && (
            <div className={styles.previewSummary}>
              <span className="badge badge-brand">{modeLabel}</span>
              <span className="badge badge-brand">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
              {name && <span className="badge badge-brand">For {name}</span>}
            </div>
          )}
          <div className={styles.resultsHeader}>
            <span className={styles.resultsHeading}>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className={styles.questionListScrollable}>
          <ol className={styles.questionList}>
            {questions.map((q, i) => (
              <li key={i} className={styles.questionItem}>
                <div className={styles.questionTop}>
                  <span className={styles.questionNum}>Q{i + 1}</span>
                  {removable && (
                    <button type="button" className={styles.removeButton} onClick={() => handleRemoveQuestion(i)} aria-label="Remove question">✕</button>
                  )}
                </div>
                <p className={styles.questionText}>{q.text}</p>
                <ul className={styles.optionList}>
                  {q.options.map((opt, j) => (
                    <li key={j} className={styles.option}>
                      <span className={styles.optionBadge}>{OPTION_LABELS[j]}</span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  }

  function renderSummaryCard(questions: GeneratedQuestion[]) {
    const modeLabel = `${MODE_META[mode].icon} ${MODE_META[mode].label}`
    return (
      <div className={styles.summaryCard}>
        <span className="badge badge-brand" style={{ alignSelf: 'flex-start' }}>{modeLabel}</span>
        <dl className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <dt className={styles.summaryKey}>Host</dt>
            <dd className={styles.summaryVal}>{hostName.trim() || '—'}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt className={styles.summaryKey}>Questions</dt>
            <dd className={styles.summaryVal}>{questions.length}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt className={styles.summaryKey}>Your role</dt>
            <dd className={`${styles.summaryVal} ${styles.summaryValHighlight}`}>🎮 Playing as host</dd>
          </div>
        </dl>
        <p className={styles.summaryHint}>Questions are hidden. You'll compete alongside your players.</p>
      </div>
    )
  }

  function renderSetupFlow(questions: GeneratedQuestion[]) {
    const answered = Object.keys(hostAnswers).length
    return (
      <section className={styles.setupFlow}>
        <div className={styles.setupProgress}>
          <span className={styles.setupProgressText}>{answered} / {questions.length} answered</span>
          <div className={styles.setupProgressBar}>
            <div className={styles.setupProgressFill} style={{ width: `${(answered / questions.length) * 100}%` }} />
          </div>
        </div>
        <div className={styles.questionListScrollable}>
          {questions.map((q, i) => (
            <div key={i} className={styles.setupQuestion}>
              <p className={styles.setupQuestionText}>
                <span className={styles.questionNum}>Q{i + 1}</span> {q.text}
              </p>
              <div className={styles.setupOptions}>
                {q.options.map((opt, j) => (
                  <button
                    key={j}
                    type="button"
                    className={`${styles.setupOption} ${hostAnswers[i] === j ? styles.setupOptionSelected : ''}`}
                    onClick={() => setHostAnswers((prev) => ({ ...prev, [i]: j }))}
                  >
                    <span className={styles.optionBadge}>{OPTION_LABELS[j]}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const isGenerating = triviaLoading || socialLoading || fileLoading
  const allAnswered =
    !SOCIAL_MODES_WITH_SETUP.includes(mode) ||
    socialModeType !== 'set-answers-first' ||
    (socialQuestions !== null && Object.keys(hostAnswers).length === socialQuestions.length)
  const canCreate = !!activeQuestions && hostName.trim().length > 0 && allAnswered

  return (
    <div className={styles.container}>
      <div className={styles.layout}>

        <div className={styles.topRow}>

          {/* ── Left column: Basics + Mode stacked ── */}
          <div className={styles.leftCol}>

            {/* ① Basics */}
            <div className={styles.card}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldWrap}>
                  <span className="field-label">Host name</span>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="e.g. Alex"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                  />
                </label>
              </div>
            </div>

            {/* ② Mode */}
            <div className={styles.card}>
              <p className={styles.cardLabel}>Game mode</p>
              <div className={styles.modeGrid}>
                {MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.modeCard} ${mode === m ? styles.modeCardActive : ''}`}
                    onClick={() => switchMode(m)}
                  >
                    <span className={styles.modeIcon}>{MODE_META[m].icon}</span>
                    <span className={styles.modeLabel}>{MODE_META[m].label}</span>
                  </button>
                ))}
              </div>
              <p className={styles.modeDesc}>{getModeDesc()}</p>
            </div>

          </div>{/* end leftCol */}

          {/* ── Right column: source card + stacked preview ── */}
          <div className={`${styles.rightCol} ${mode === 'custom' ? styles.rightColStretch : ''}`}>

          {/* ③a Trivia source */}
          {mode === 'trivia' && (
            <div className={`${styles.card} ${styles.cardSource}`}>
              <p className={styles.cardLabel}>Topic &amp; source</p>
              <form onSubmit={handleGenerateTrivia} className={styles.sectionForm}>

                <div className="seg-control">
                  <button
                    type="button"
                    className={`seg-option ${topicSource === 'default' ? 'seg-active' : ''}`}
                    onClick={() => { setTopicSource('default'); setTriviaQuestions(null); setRoomCode(null) }}
                  >📚 Topics</button>
                  <button
                    type="button"
                    className={`seg-option ${topicSource === 'ai' ? 'seg-active' : ''}`}
                    onClick={() => { setTopicSource('ai'); setTriviaQuestions(null); setRoomCode(null) }}
                  >✨ AI</button>
                  <button
                    type="button"
                    className={`seg-option ${topicSource === 'file' ? 'seg-active' : ''}`}
                    onClick={() => { setTopicSource('file'); setTriviaQuestions(null); setRoomCode(null) }}
                  >📄 File</button>
                </div>

                {topicSource === 'default' && (
                  <div className={styles.topicGrid}>
                    {TOPIC_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        className={`${styles.topicChip} ${topic === o.value ? styles.topicChipActive : ''}`}
                        onClick={() => { setTopic(o.value as Topic); setTriviaQuestions(null); setRoomCode(null) }}
                      >
                        <span>{o.emoji}</span>
                        <span>{o.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {topicSource === 'ai' && (
                  <input
                    className="input-field"
                    type="text"
                    placeholder="e.g. Afrobeats artists, anime villains, Premier League…"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                  />
                )}

                {topicSource === 'file' && (
                  <label className={styles.fileDropZone}>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className={styles.fileInput}
                      onChange={(e) => { setUploadedFile(e.target.files?.[0] ?? null); setTriviaQuestions(null); setRoomCode(null) }}
                    />
                    {uploadedFile
                      ? <span className={styles.fileSelected}>📄 {uploadedFile.name}</span>
                      : <span className={styles.filePlaceholder}>Click or drag a PDF, DOCX, or TXT file</span>}
                  </label>
                )}

                <div className={styles.countRow}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Questions</span>
                  <div className={styles.countChips}>
                    {COUNT_OPTIONS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`${styles.countChip} ${triviaCount === n ? styles.countChipActive : ''}`}
                        onClick={() => setTriviaCount(n)}
                      >{n}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.countRow}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Difficulty</span>
                  <div className={styles.countChips}>
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.countChip} ${triviaDifficulty === option.value ? styles.countChipActive : ''}`}
                        onClick={() => { setTriviaDifficulty(option.value); setTriviaQuestions(null); setRoomCode(null) }}
                      >{option.label}</button>
                    ))}
                  </div>
                </div>

                <div className={styles.roleSection}>
                  <p className={styles.roleSectionLabel}>Your role</p>
                  <div className="seg-control">
                    <button
                      type="button"
                      className={`seg-option ${hostMode === 'player' ? 'seg-active' : ''}`}
                      disabled={!!activeQuestions}
                      onClick={() => { setHostMode('player'); setRoomCode(null) }}
                    >🎮 Play as host</button>
                    <button
                      type="button"
                      className={`seg-option ${hostMode === 'spectate' ? 'seg-active' : ''}`}
                      disabled={!!activeQuestions}
                      onClick={() => { setHostMode('spectate'); setRoomCode(null) }}
                    >👁 Spectate</button>
                  </div>
                  <p className={styles.roleHint}>
                    {activeQuestions
                      ? '🔒 Role is locked. Generate new questions to change it.'
                      : hostMode === 'player'
                        ? "Questions stay hidden. You'll compete with your players."
                        : "You'll see all questions and manage the game without competing."}
                  </p>
                </div>

                {topicSource === 'file' ? (
                  <button
                    type="button"
                    className={`btn-primary ${styles.genButton}`}
                    onClick={handleGenerateFromFile}
                    disabled={isGenerating || !uploadedFile}
                    data-loading={fileLoading || undefined}
                  >
                    {fileLoading ? 'Generating…' : triviaQuestions ? 'Regenerate from File' : 'Generate from File'}
                  </button>
                ) : (
                  <button
                    className={`btn-primary ${styles.genButton}`}
                    type="submit"
                    disabled={isGenerating || (topicSource === 'ai' && !aiTopic.trim())}
                    data-loading={triviaLoading || undefined}
                  >
                    {triviaLoading ? 'Generating…' : triviaQuestions ? 'Regenerate' : 'Generate Questions'}
                  </button>
                )}
              </form>
            </div>
          )}

          {/* ③b Social source */}
          {SOCIAL_MODES.includes(mode) && (
            <div className={`${styles.card} ${styles.cardSource}`}>
              <p className={styles.cardLabel}>Questions</p>
              <div className={styles.sectionForm}>
                {getSocialTitle() && <p className={styles.socialTitle}>{getSocialTitle()}</p>}

                {SOCIAL_MODES_WITH_SETUP.includes(mode) && (
                  <div className={styles.socialModeToggle}>
                    <button
                      type="button"
                      className={`${styles.socialModeOption} ${socialModeType === 'quick-play' ? styles.socialModeActive : ''}`}
                      onClick={() => { setSocialModeType('quick-play'); setHostAnswers({}) }}
                    >
                      <span className={styles.socialModeOptionTitle}>⚡ Quick Play</span>
                      <span className={styles.socialModeOptionDesc}>Answer live during the game</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.socialModeOption} ${socialModeType === 'set-answers-first' ? styles.socialModeActive : ''}`}
                      onClick={() => setSocialModeType('set-answers-first')}
                    >
                      <span className={styles.socialModeOptionTitle}>📝 Set answers first</span>
                      <span className={styles.socialModeOptionDesc}>Tell us about yourself before players join</span>
                    </button>
                  </div>
                )}

                <div className={styles.countRow}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Questions</span>
                  <div className={styles.countChips}>
                    {COUNT_OPTIONS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`${styles.countChip} ${socialCount === n ? styles.countChipActive : ''}`}
                        onClick={() => { setSocialCount(n); setSocialQuestions(null) }}
                      >{n}</button>
                    ))}
                  </div>
                </div>

                {mode !== 'wkmb' && (
                  <div className={styles.roleSection}>
                    <p className={styles.roleSectionLabel}>Your role</p>
                    <div className="seg-control">
                      <button
                        type="button"
                        className={`seg-option ${hostMode === 'player' ? 'seg-active' : ''}`}
                        disabled={!!activeQuestions}
                        onClick={() => { setHostMode('player'); setRoomCode(null) }}
                      >🎮 Play as host</button>
                      <button
                        type="button"
                        className={`seg-option ${hostMode === 'spectate' ? 'seg-active' : ''}`}
                        disabled={!!activeQuestions}
                        onClick={() => { setHostMode('spectate'); setRoomCode(null) }}
                      >👁 Spectate</button>
                    </div>
                    <p className={styles.roleHint}>
                      {activeQuestions
                        ? '🔒 Role is locked. Generate new questions to change it.'
                        : hostMode === 'player'
                          ? "Questions stay hidden. You'll compete with your players."
                          : "You'll see all questions and manage the game without competing."}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className={`btn-primary ${styles.genButton}`}
                  onClick={handleGenerateSocial}
                  disabled={isGenerating}
                  data-loading={socialLoading || undefined}
                >
                  {socialLoading ? 'Loading…' : socialQuestions ? 'Regenerate' : 'Generate Questions'}
                </button>
              </div>
            </div>
          )}

          {/* ③c Custom builder */}
          {mode === 'custom' && (
            <div className={`${styles.card} ${styles.cardSource}`}>
              <p className={styles.cardLabel}>Question builder</p>
              <div className={styles.sectionForm}>
                <label className={styles.fieldWrap}>
                  <span className="field-label">Question prompt</span>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="e.g. What is the capital of France?"
                    value={draft.text}
                    onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
                  />
                </label>
                <div className={styles.optionsGrid}>
                  {draft.options.map((opt, i) => (
                    <label key={i} className={styles.fieldWrap}>
                      <span className="field-label">Option {OPTION_LABELS[i]}</span>
                      <input
                        className="input-field"
                        type="text"
                        placeholder={`Option ${OPTION_LABELS[i]}`}
                        value={opt}
                        onChange={(e) => handleDraftOption(i, e.target.value)}
                      />
                    </label>
                  ))}
                </div>
                <div className={styles.countRow}>
                  <span className="field-label" style={{ marginBottom: 0 }}>Correct answer</span>
                  <select
                    className={`input-field ${styles.selectInline}`}
                    value={draft.correctIndex}
                    onChange={(e) => setDraft((d) => ({ ...d, correctIndex: Number(e.target.value) }))}
                  >
                    {OPTION_LABELS.map((lbl, i) => <option key={i} value={i}>Option {lbl}</option>)}
                  </select>
                </div>
                {draftError && <p className={styles.error}>{draftError}</p>}
                <div className={styles.roleSection}>
                  <p className={styles.roleSectionLabel}>Your role</p>
                  <div className="seg-control">
                    <button
                      type="button"
                      className={`seg-option ${hostMode === 'player' ? 'seg-active' : ''}`}
                      disabled={!!activeQuestions}
                      onClick={() => { setHostMode('player'); setRoomCode(null) }}
                    >🎮 Play as host</button>
                    <button
                      type="button"
                      className={`seg-option ${hostMode === 'spectate' ? 'seg-active' : ''}`}
                      disabled={!!activeQuestions}
                      onClick={() => { setHostMode('spectate'); setRoomCode(null) }}
                    >👁 Spectate</button>
                  </div>
                  <p className={styles.roleHint}>
                    {activeQuestions
                      ? '🔒 Role is locked. Generate new questions to change it.'
                      : hostMode === 'player'
                        ? "Questions stay hidden. You'll compete with your players."
                        : "You'll see all questions and manage the game without competing."}
                  </p>
                </div>
                <button type="button" className={`btn-secondary ${styles.genButton}`} onClick={handleAddQuestion}>
                  + Add Question
                </button>
              </div>
            </div>
          )}

          {/* Preview panel — stacked below source card for non-custom modes */}
          {mode !== 'custom' && (
            <div ref={previewRef}>
              {roomCode ? (
                <div className={styles.roomReadyPanel}>
                  <div className={styles.roomReadyTop}>
                    <span className="badge badge-success">Room created</span>
                    <div className="room-code-display">
                      <span className="room-code-label">Room code</span>
                      <span className="room-code-value">{roomCode}</span>
                    </div>
                    <p className={styles.roomReadyHint}>Share this code with your players so they can join.</p>
                  </div>
                  <button
                    className="btn-primary btn-full btn-lg"
                    onClick={() => navigate(`/host/${roomCode}`, { state: { hostName, hostMode: committedHostMode, socialModeType: committedSocialModeType } })}
                  >
                    Go to lobby →
                  </button>
                </div>
              ) : activeQuestions && SOCIAL_MODES_WITH_SETUP.includes(mode) && socialModeType === 'set-answers-first' ? (
                <div className={styles.previewPanel}>
                  {renderSetupFlow(activeQuestions)}
                  <div className={styles.createFooter}>
                    <button
                      className="btn-primary btn-full btn-lg"
                      onClick={handleCreateRoom}
                      disabled={creatingRoom || !canCreate}
                      data-loading={creatingRoom || undefined}
                    >
                      {creatingRoom ? 'Creating room…' : 'Create Room'}
                    </button>
                    {!hostName.trim() && (
                      <p className={styles.createHint}>Fill in host name to continue.</p>
                    )}
                    {!allAnswered && hostName.trim() && (
                      <p className={styles.createHint}>Answer all questions to continue.</p>
                    )}
                  </div>
                </div>
              ) : activeQuestions ? (
                <div className={styles.previewPanel}>
                  {showFullPreview ? renderQuestionPreview(activeQuestions) : renderSummaryCard(activeQuestions)}
                  <div className={styles.createFooter}>
                    <button
                      className="btn-primary btn-full btn-lg"
                      onClick={handleCreateRoom}
                      disabled={creatingRoom || !canCreate}
                      data-loading={creatingRoom || undefined}
                    >
                      {creatingRoom ? 'Creating room…' : 'Create Room'}
                    </button>
                    {!hostName.trim() && (
                      <p className={styles.createHint}>Fill in host name to continue.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          </div>{/* end rightCol */}

        </div>

        {error && <p className={styles.error}>{error}</p>}

        {/* Custom mode: full-width question list below the builder */}
        {mode === 'custom' && (
          <div ref={previewRef} className={styles.bottomSection}>
            {roomCode ? (
              <div className={styles.roomReadyPanel}>
                <div className={styles.roomReadyTop}>
                  <span className="badge badge-success">Room created</span>
                  <div className="room-code-display">
                    <span className="room-code-label">Room code</span>
                    <span className="room-code-value">{roomCode}</span>
                  </div>
                  <p className={styles.roomReadyHint}>Share this code with your players so they can join.</p>
                </div>
                <button
                  className="btn-primary btn-full btn-lg"
                  onClick={() => navigate(`/host/${roomCode}`, { state: { hostName, hostMode: committedHostMode, socialModeType: committedSocialModeType } })}
                >
                  Go to lobby →
                </button>
              </div>
            ) : activeQuestions ? (
              <div className={styles.previewPanel}>
                {renderQuestionPreview(activeQuestions)}
                <div className={styles.createFooter}>
                  <button
                    className="btn-primary btn-full btn-lg"
                    onClick={handleCreateRoom}
                    disabled={creatingRoom || !canCreate}
                    data-loading={creatingRoom || undefined}
                  >
                    {creatingRoom ? 'Creating room…' : 'Create Room'}
                  </button>
                  {!hostName.trim() && (
                    <p className={styles.createHint}>Fill in host name to continue.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

      </div>
    </div>
  )
}
