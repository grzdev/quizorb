import { GiCube } from 'react-icons/gi'


export default function Home() {
  return (
    <div className="app">
      <div className="home-div">
        <GiCube className='cube-icon'/>
        <h1 className='title'>QuizOrb</h1>
        <button type='submit' className='play-button'>Play</button>
      </div>
    </div>
  )
}
