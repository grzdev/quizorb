import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import useAxios from "../components/useAxios"
import { Container, Box, Text, Button, CircularProgress } from '@chakra-ui/react'
import { changeScore, selectAmountOfQuestion, selectCategory, selectDifficulty, selectScore, selectType } from '../redux/slices/quizSlice'
import { useRouter } from 'next/router'
import {decode} from 'html-entities';

const getRandomInt = (max) =>{
  return Math.floor(Math.random() * Math.floor(max))
}

const QuizPage = () => {
  const amount_of_questions = useSelector(selectAmountOfQuestion)
  const questions_category = useSelector(selectCategory)
  const questions_difficulty = useSelector(selectDifficulty)
  const questions_type = useSelector(selectType)
  const score = useSelector(selectScore)

  const router = useRouter()
  const dispatch = useDispatch()

  let apiUrl = `/api.php?amount=${amount_of_questions}`

  if(questions_category){
    apiUrl = apiUrl.concat(`&category=${questions_category}`)
  }
  if(questions_difficulty){
    apiUrl = apiUrl.concat(`&difficulty=${questions_difficulty}`)
  }
  if(questions_type){
    apiUrl = apiUrl.concat(`&type=${questions_type}`)
  }

  const { response, loading } = useAxios({ url: apiUrl })
  const [ questionIndex, setQuestionIndex ] = useState(0)
  const [ options, setOptions ] = useState([])

  useEffect(()=>{
    if(response?.results.length){
      const question = response.results[questionIndex];
      let answers = [...question.incorrect_answers]
      answers.splice(
        getRandomInt(question.incorrect_answers.length),
        0,
        question.correct_answer
      );
      setOptions(answers)
    }
  },[response, questionIndex])

  if(loading){
    return( 
      <Box display="flex" justifyContent="center" mt="20rem">
        <CircularProgress isIndeterminate value={40} color="#662d91"/>
      </Box>
    )
  }

  const haandleAnswerClick = (e) =>{
    const question = response.results[questionIndex];
    if(e.target.textContent === question.correct_answer){
      dispatch(changeScore(score + 1))
    }

    if(questionIndex + 1 < response.results.length){
      setQuestionIndex(questionIndex + 1)
    }else{
      router.push("./FinalScreen")
    }
  }

  return (
    <Container maxW="auto" centerContent>
      <Box w="21rem" h="30rem" display="flex" flexDir="column" alignItems="center" bg="#662d91" mt="4rem" borderRadius="1.1rem" boxShadow= "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px">
        <Box>
          <Text color="white" mt="1.4rem" fontSize="1.1rem">
           Question {questionIndex + 1}
          </Text>
          <Text color="white" w="10rem" fontSize="1rem" mt="0.9rem">
            {decode(response.results[questionIndex].question)}
          </Text>
        </Box>
        
        <Box mt="1rem" display="flex" flexDir="column">
          {options.map((data, id)=>(
            <Button onClick={haandleAnswerClick} maW="auto" bg="#d6d6f7" color="#662d91" mt="0.5rem" key={id}>
              {decode(data)}
            </Button>
          ))} 
        </Box>
      </Box>

      <Box mt="2rem" w="8rem" h="3rem" borderRadius="0.4rem" bg="#662d91" display="flex" alignItems="center" justifyContent="center"> 
          <Text fontWeight="600" color="white">
            Score: {score} / {response.results.length}
          </Text>
      </Box>
    </Container>
  )
}

export default QuizPage