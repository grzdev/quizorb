import { Link } from 'react-router-dom'
import hero2 from '../assets/hero2.png'
import styles from './LandingPage.module.css'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time multiplayer',
    desc: 'Everyone answers at once, and results update live as answers roll in.',
  },
  {
    icon: '🤖',
    title: 'AI-generated quizzes',
    desc: 'Pick any topic and get 10 polished questions in seconds. Completely free.',
  },
  {
    icon: '🏆',
    title: 'Speed-based scoring',
    desc: 'Answer quickly to earn bonus points. Speed and accuracy both count.',
  },
  {
    icon: '👥',
    title: 'Social game modes',
    desc: 'Who Knows Me Best, Hot Seat, and more, all made for groups.',
  },
  {
    icon: '✏️',
    title: 'Custom questions',
    desc: 'Write your own questions with fully custom answers and correct choices.',
  },
  {
    icon: '🚀',
    title: 'Zero sign-up',
    desc: 'No account needed. Share a room code and you\'re all playing in seconds.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Create a game',
    desc: 'Choose a mode, pick a topic or write your own questions, and give your quiz a title.',
  },
  {
    num: '02',
    title: 'Share the room code',
    desc: 'Send the 6-character code to your players. They join with one tap, no app needed.',
  },
  {
    num: '03',
    title: 'Play together',
    desc: 'Countdown, answer, see scores. Repeat. The leaderboard updates after every question.',
  },
]

export default function LandingPage() {
  return (
    <div className={styles.container}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* Left: text content */}
        <div className={styles.heroText}>
          <div className={styles.badge}>Free · No sign-up · Live multiplayer</div>

          <h1 className={styles.headline}>
            Host quiz nights<br />
            <span className={styles.headlineAccent}>anyone can join</span>
          </h1>

          <p className={styles.subheading}>
            Real-time trivia for friends, teams, and parties. AI writes the questions.
            You bring the energy.
          </p>

          <div className={styles.actions}>
            <Link to="/create" className={styles.primaryButton}>
              Create Game
              <svg className={styles.btnArrow} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/join" className={styles.secondaryButton}>Join Game</Link>
          </div>

          <p className={styles.social}>
            Also try: <span className={styles.socialChip}>👤 Who Knows Me Best</span>
            <span className={styles.socialChip}>🔥 Hot Seat</span>
          </p>
        </div>

        {/* Right: product visual */}
        <div className={styles.heroVisual}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroImageWrap}>
            <img src={hero2} alt="QuizOrb in action" className={styles.heroImage} />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={styles.howSection}>
        <h2 className={styles.sectionLabel}>How it works</h2>
        <div className={styles.steps}>
          {STEPS.map((step) => (
            <div key={step.num} className={styles.step}>
              <span className={styles.stepNum}>{step.num}</span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionLabel}>Everything you need</h2>
        <div className={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <span className={styles.featureIcon}>{f.icon}</span>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className={styles.cta}>
        <h2 className={styles.ctaHeadline}>Ready to play?</h2>
        <p className={styles.ctaSub}>Create a room in under 30 seconds.</p>
        <Link to="/create" className={styles.primaryButton}>
          Create Game
          <svg className={styles.btnArrow} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </section>

    </div>
  )
}
