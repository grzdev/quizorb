import React, { useState } from 'react'
import SelectField from '../components/SelectField'
import { BsNutFill } from 'react-icons/bs'
import { FaSadTear } from 'react-icons/fa'
import AoQ from '../components/AoQ'
import { CircularProgress, Button, Box, Text, Container, Heading, Select, FormControl } from '@chakra-ui/react'
import useAxios from '../components/useAxios'
import Link from 'next/link'

const SettingsPage = () => {
  const {response, error, loading } = useAxios({url: "/api_category.php"})

  if(loading){
    return(
      <Box display="flex" justifyContent="center" mt="20rem">
        <CircularProgress isIndeterminate value={40} color="#662d91"/>
      </Box>
    )
  }

  if(error){
    return(
      <Box display="flex" justifyContent="center" mt="20rem">
        <FaSadTear color='#662d91' fontSize="4rem"/>
        <Text fontSize="1.7rem" color="#662d91" ml="1rem" mt="0.5rem">
          Something went wrong...
        </Text>
      </Box>
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
    <Container maxW="auto" centerContent>
      <Box w="21rem" h="30rem" display="flex" flexDir="column" alignItems="center" bg="#662d91" mt="4rem" borderRadius="1.1rem" boxShadow= "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px">
        
        <Box  mt="1rem">
          <BsNutFill color='#d6d6f7' fontSize="4rem"/>
       </Box>

       <Heading color="#d6d6f7" mt="-0.4rem" mb="1rem">
         Select Mode
        </Heading>

        <FormControl>
         <SelectField options={response.trivia_categories} label="Category"/>
         <SelectField options={difficultyOptions} label="Difficulty"/>
         <SelectField options={typeOptions} label="Type"/>
         <AoQ/>
        </FormControl>

      </Box>

      <Box mt="2rem" >
        <Link href='/QuizPage'>
          <Button onSubmit={handleSubmit} color="#d6d6f7" w="6rem" h="3rem" bg="#662d91" borderRadius="0.4rem" boxShadow= "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px">
            Get started
          </Button>
        </Link>
      </Box>
    </Container>
  )
}

export default SettingsPage