//Amount Of Questions

import { useDispatch } from 'react-redux' 
import { changeAmountOfQuestions } from '../redux/slices/quizSlice'
import { Text, Box, Input } from '@chakra-ui/react'

const AoQ = () => {
  const dispatch = useDispatch()
  const handleChange = (e) =>{
    dispatch(changeAmountOfQuestions(e.target.value))
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDir="column" mt="1.1rem">
      <Text color="white" fontWeight="600" >
        Amount of Questions
      </Text>
      <Input w="4.3rem" bg="#d6d6f7" className='aoq'onChange={handleChange} type="number" placeholder='123...'/>
    </Box>
  )
}

export default AoQ