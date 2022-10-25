import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    questions_category: "",
    questions_difficulty: "",
    questions_type: "",
    amount_of_questions: 50,
    score: 0
}

const quizSlice = createSlice({
    name: "quiz",
    initialState,
    reducers:{
        changeCategory: (state, action) =>{
            state.questions_category = action.payload
        },
        changeDifficulty: (state, action) =>{
            state.questions_difficulty = action.payload
        },
        changeType: (state, action) =>{
            state.questions_type = action.payload
        },
        changeAmountOfQuestions: (state, action) =>{
            state.amount_of_questions = action.payload
        },
        changeScore: (state, action) =>{
            state.score = action.payload
        }
    }
})

//Actions
export const {
    changeCategory,
    changeDifficulty,
    changeType,
    changeAmountOfQuestions,
    changeScore
} = quizSlice.actions


//Select
export const selectAmountOfQuestion = state => state.quiz.amount_of_questions
export const selectCategory = state => state.quiz.questions_category
export const selectDifficulty = state => state.quiz.questions_difficulty
export const selectType = state => state.quiz.questions_type
export const selectScore = state => state.quiz.score


//Reducer
export default quizSlice.reducer