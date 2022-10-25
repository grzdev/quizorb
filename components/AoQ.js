
import { useDispatch } from 'react-redux' 

const AoQ = () => {
  const handleChange = (e) =>{}

  return (
    <input 
        className='aoq'
        onChange={handleChange}
        type="number"
        placeholder='Amount of Questions'
    />
  )
}

export default AoQ