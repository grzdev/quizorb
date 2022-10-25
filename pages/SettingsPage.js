import React, { useState } from 'react'
import SelectField from '../components/SelectField'
import { BsNutFill } from 'react-icons/bs'
import AoQ from '../components/AoQ'
import { Link } from '@chakra-ui/react'
import useAxios from '../components/useAxios'

const SettingsPage = () => {
  const {response, error, loading } = useAxios({url: "/api_category.php"})

  if(loading){
    return(
      <div className='loaderDiv'>
          <div className="loader"></div>
      </div>
    )
  }

  if(error){
    return(
      <p>Something went wrong...</p>
    )
  }

  const handleSubmit = (e) =>{
    e.preventDefault();
  }

  const difficultyOptions = [
    { id:"easy", name:"Easy" },
    { id:"medium", name:"Medium" },
    { id:"hard", name:"Hard" }
  ]

  const typeOptions = [
    { id:"multiple", name:"Multiple Choice" },
    { id:"boolean", name:"True/False" },
  ]


  return (
    <div className="app">
      <div className="home-div">
        <BsNutFill className='select-icon'/>
        <h1 className='select-title'>Select Mode</h1>
       <form onSubmit={handleSubmit}>
        <SelectField options={response.trivia_categories} label="Category"/>
        <SelectField options={difficultyOptions} label="Difficulty"/>
        <SelectField options={typeOptions} label="Type"/>
        <AoQ/>
       </form>

        <Link href='/QuizPage'>
          <button type='submit' className='getStarted'>
            Get started
          </button>
       </Link>
      </div>
    </div>
  )
}

export default SettingsPage