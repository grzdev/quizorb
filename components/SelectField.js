import { FormControl, FormLabel, Box, Select } from '@chakra-ui/react'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { changeCategory, changeDifficulty, changeType } from '../redux/slices/quizSlice'

const SelectField = (props) => {
    const {label, options} = props
    const [ value, setValue ] = useState("")
    const dispatch = useDispatch()

    const handleChange = (e) =>{
      setValue(e.target.value)
      
      if(label === "Category"){
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
    <Box mt="0.8rem">
      <FormControl display="flex" flexDir="column" justifyContent="center" alignItems="center">
        <FormLabel color="white" mb="-0.001rem">{label}</FormLabel>
        <Select w='12rem' bg="#d6d6f7" value={value} label={label} onChange={handleChange}>
          {options.map(({id, name})=>(
            <option value={id} key={id}>{name}</option>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default SelectField