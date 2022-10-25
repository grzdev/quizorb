import React from 'react'
import { useDispatch } from 'react-redux'
import { handleAmountChange } from '../redux/actions'

const AoQ = () => {
  const dispatch = useDispatch
    const handleChange = (e) =>{
      dispatch(handleAmountChange(e.target.value))
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