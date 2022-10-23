import { GiCube } from 'react-icons/gi'
import Link from 'next/link'


export default function Home() {
  return (
    <div className="app">
      <div className="home-div">
        <GiCube className='cube-icon'/>
        <h1 className='title'>QuizOrb</h1>
        
        <Link href="/Quiz">
        <button type='submit' className='play-button'>Play</button>
        </Link>
      </div>
    </div>
  )
}
