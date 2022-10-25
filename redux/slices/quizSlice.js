// import { createSlice } from "@reduxjs/toolkit";

import { CHANGE_AMOUNT, CHANGE_CATEGORY, CHANGE_DIFFICULTY, CHANGE_SCORE, CHANGE_TYPE } from "../actionTypes"

const initialState = {
    question_category: "",
    question_difficulty: "",
    question_types: "",
    amount_of_question: 50,
    score: 0
}

const reducer = (state = initialState, action) =>{
    switch(action.type){    
        case CHANGE_CATEGORY:
            return{
                ...state,
                question_category: action.payload
            }
        case CHANGE_DIFFICULTY:
            return{
                ...state,
                question_difficulty: action.payload
            }
        case CHANGE_TYPE:
            return{
                ...state,
                question_types: action.payload
            }
        case CHANGE_AMOUNT:
            return{
                ...state,
                amount_of_question: action.payload
            }
        case CHANGE_SCORE:
            return{
                ...state,
                score: action.payload
            }
        default:
            return state;
    }
}

export default reducer

// const initialState = {
//     question_category: "",
//     question_difficulty: "",
//     question_types: "",
//     amount_of_question: 50,
//     score: 0
// }

// const quizSlice = createSlice({
//     name: "quiz",
//     initialState,
//     reducers:{
//         changeCategory: (state, action ) =>{
//             state.question_category.push(action.payload)
//         },

//         changeDifficulty: (state, action ) =>{
//             state.question_difficulty.push(action.payload)
//         },

//         changeTypes: (state, action ) =>{
//             state.question_types.push(action.payload)
//         },

//         changeAmountOfQuestions: (state, action ) =>{
//             state.amount_of_question.push(action.payload)
//         },

//         changeScore: (state, action ) =>{
//             state.score.push(action.payload)
//         }
//     }
// })

// export const {
//     changeAmountOfQuestions,
//     changeCategory,
//     changeDifficulty,
//     changeScore,
//     changeTypes
// } = quizSlice.actions
// export const selectQuiz = state => state.quiz.initialState
// export default quizSlice.reducer

