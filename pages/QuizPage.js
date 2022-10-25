import React from 'react'
import { useSelector } from 'react-redux'
import useAxios from "../components/useAxios"
import { selectAmountOfQuestion, selectCategory, selectDifficulty, selectScore, selectType } from '../redux/slices/quizSlice'


const QuizPage = () => {
  const amount_of_questions = useSelector((selectAmountOfQuestion))
  const questions_category = useSelector(selectCategory)
  const questions_difficulty = useSelector(selectDifficulty)
  const questions_type = useSelector(selectType)
  const score = useSelector(selectScore)

  console.log(amount_of_questions, questions_category, questions_difficulty, questions_type)

  let apiUrl = `/api.php?amount=10`

  const { response, loading } = useAxios({ url: apiUrl })
  return (
    <div className="app">
      <div className="home-div">
        <h1 className='question-title'>Question 1</h1>
        <h1 className='question'>Whats the answer to this question that i just asked you</h1>

        <div className='options-container'>
        <button className='options'>Option 1</button>
        <button className='options'>Option 2</button>
        <button className='options'>Option 3</button>
        <button className='options'>Option 4</button>
        </div>

        <div>
          <p className='score'>
            Score: 2/6
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuizPage