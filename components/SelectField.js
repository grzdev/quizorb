import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { handleCatgoryChange, handleDifficultyChange, handleTypeChange } from '../redux/actions'

const SelectField = (props) => {
    const {label, options} = props
    const dispatch = useDispatch
    const [ value, setValue ] = useState("")

    const handleChange = (e) =>{
      setValue(e.target.value)
      switch(label){
        case 'Category':
          dispatch(handleCatgoryChange(e.target.value));
          break;
        case 'Difficulty':
          dispatch(handleDifficultyChange(e.target.value));
          break;
        case 'Types':
          dispatch(handleTypeChange(e.target.value));
          break;
        default:
          return;
      }
     }
  return (
    <div className='selectForm'>
        <label>{label}</label>
        <select value={value} label={label} onChange={handleChange}>
            {options.map(({id, name})=>(
              <option value={id} key={id}>{name}</option>
            ))}
        </select>
    </div>
  )
}

export default SelectField