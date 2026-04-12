import { Link, Outlet, useLocation } from 'react-router-dom'
import quizorbLogo from '../assets/quizorbLogo.png'
import styles from './PageShell.module.css'

const BACK_MAP: Record<string, string> = {
  '/create': '/',
  '/join':   '/',
}

export default function PageShell() {
  const { pathname } = useLocation()

  // Find the longest matching prefix that has a back destination
  const backTo = Object.keys(BACK_MAP)
    .filter((k) => pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link to="/" className={styles.logo}>
          <img src={quizorbLogo} alt="QuizOrb" className={styles.logoImg} />
        </Link>
        {backTo && (
          <Link to={BACK_MAP[backTo]} className={styles.back}>
            ← 
          </Link>
        )}
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
