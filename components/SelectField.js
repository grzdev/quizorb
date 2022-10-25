import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

const SelectField = (props) => {
    const {label, options} = props
    const [ value, setValue ] = useState("")

    const handleChange = (e) =>{
      setValue(e.target.value)
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