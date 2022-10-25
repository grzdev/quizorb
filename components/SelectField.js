import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { changeCategory, changeDifficulty, changeType } from '../redux/slices/quizSlice'

const SelectField = (props) => {
    const {label, options} = props
    const [ value, setValue ] = useState("")
    const dispatch = useDispatch()

    const handleChange = (e) =>{
      setValue(e.target.value)
      // switch(label){
      //   case "Category":
      //     dispatch(changeCategory(e.target.value));
      //     break;
      //   case "Difficulty":
      //     dispatch(changeDifficulty(e.target.value));
      //     break;
      //   case "Type":
      //     dispatch(changeType(e.target.value));
      //     break;
      //   default:
      //     return;
      if(label === "Catergory"){
        dispatch(changeCategory(e.target.value))
      }
      if(label === "Difficulty"){
        dispatch(changeDifficulty(e.target.value))
      }
      if(label === "Type"){
        dispatch(changeType(e.target.value))
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