import React from 'react'
import { Box, Button, Text } from "@chakra-ui/react"
import { useDispatch, useSelector } from 'react-redux'
import { changeAmountOfQuestions, changeScore, selectScore } from '../redux/slices/quizSlice'
import { useRouter } from 'next/router'


const FinalScreen = () => {

    const dispatch = useDispatch()
    const router = useRouter()
    const score = useSelector(selectScore)
    const handleSettingsClick = () =>{
        dispatch(changeScore(0))
        dispatch(changeAmountOfQuestions(50))
        router.push("./SettingsPage")
    }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" flexDir="column">
        <Text fontSize="3rem" fontWeight="700" color="#662d91" mt="9rem">Final Score: {score} </Text>
        <Button w="10rem" mt="2rem" h="3rem" bg="#662d91" color="white" onClick={handleSettingsClick}> Play Again! </Button>
    </Box>
  )
}

export default FinalScreen