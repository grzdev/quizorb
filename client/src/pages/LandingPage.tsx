import { Link } from 'react-router-dom'
import hero2 from '../assets/hero2.png'
import hero5 from '../assets/hero5.png'
import hero6 from '../assets/hero6.png'
import styles from './LandingPage.module.css'

const SCENARIOS = [
  {
    icon: '🎉',
    title: 'Game Night Energy',
    desc: 'Friends, snacks, loud debates. Perfect chaos.',
    color: 'var(--brand)',
  },
  {
    icon: '🏖️',
    title: 'Beach & Hangouts',
    desc: 'Pass the phone, challenge your crew anywhere.',
    color: 'var(--clr-success)',
  },
  {
    icon: '🎓',
    title: 'Study Groups',
    desc: 'Turn boring revision into competition.',
    color: 'var(--clr-warning)',
  },
  {
    icon: '💼',
    title: 'Team Bonding',
    desc: 'Icebreakers that don’t feel forced.',
    color: 'var(--accent)',
  },
  {
    icon: '🎮',
    title: 'Casual Gaming',
    desc: 'Quick rounds when you\'re bored.',
    color: 'var(--clr-danger)',
  },
  {
    icon: '🚀',
    title: 'Instant Fun',
    desc: 'No sign-up, just play in seconds.',
    color: '#0ea5e9',
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
            Real-time trivia for friends, teams, and parties.<br />
            AI writes the questions. You bring the energy.
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

      {/* ── Product screenshot ── */}
      <section className={styles.screenshotSection}>
        <div className={styles.screenshotWrap}>
          <div className={styles.screenshotGlow} aria-hidden="true" />
          <img src={hero5} alt="QuizOrb gameplay screenshot" className={`${styles.screenshotImg} ${styles.desktopImg}`} />
          <img src={hero6} alt="QuizOrb gameplay screenshot mobile" className={`${styles.screenshotImg} ${styles.mobileImg}`} />
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

      {/* ── Scenarios ── */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionLabel}>Made for moments like these</h2>
        <div className={styles.features}>
          {SCENARIOS.map((s) => (
            <div key={s.title} className={styles.featureCard}>
              <div className={styles.featureGlow} style={{ '--glow-color': s.color } as React.CSSProperties} aria-hidden="true" />
              <div className={styles.featureIconWrap}>
                <span className={styles.featureIcon}>{s.icon}</span>
              </div>
              <h3 className={styles.featureTitle}>{s.title}</h3>
              <p className={styles.featureDesc}>{s.desc}</p>
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
