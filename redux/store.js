import { configureStore } from "@reduxjs/toolkit";
import reducer from "./slices/quizSlice";
// import quizReducer from "./slices/quizSlice";

export const store = configureStore({
    reducer: reducer
})
// export const store = configureStore({
//     reducer: reducer
// })