//Amount Of Questions

import { useDispatch } from 'react-redux' 
import { changeAmountOfQuestions } from '../redux/slices/quizSlice'

const AoQ = () => {
  const dispatch = useDispatch()
  const handleChange = (e) =>{
    dispatch(changeAmountOfQuestions(e.target.value))
  }

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