import { GiCube } from 'react-icons/gi'
import Link from 'next/link'
import { Container , Box, Heading, Button ,Text} from '@chakra-ui/react'

const Home = () => {
  return (
    <Container maxW="auto" centerContent>
      <Box w="21rem" h="30rem" display="flex" flexDir="column" alignItems="center" bg="#662d91" mt="6rem" borderRadius="1.1rem" boxShadow= "rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px">
       
       <Box  mt="4rem">
          <GiCube color='#d6d6f7' fontSize="5rem"/>
       </Box>

        <Heading color="#d6d6f7" mt="1rem">
            QuizOrb
        </Heading>

        <Box mt="10rem">
          <Link href="/SettingsPage">
            <Button color="#d6d6f7" w="6rem">
              <Text as='i' color="#662d91">
                Play
              </Text>
            </Button>
          </Link>
        </Box>

        </Box>
    </Container>
  )
}


export default Home