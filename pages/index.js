import { GiCube } from 'react-icons/gi'
import Link from 'next/link'

const Home = () => {
  return (
    <div className="app">
      <div className="home-div">
        <GiCube className='cube-icon'/>
        <h1 className='title'>QuizOrb</h1>
        
        <Link href="/SettingsPage">
        <button type='submit' className='play-button'>Play</button>
        </Link>
      </div>
    </div>
  )
}


export default Home