import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PageShell from './components/PageShell.tsx'
import CreatePage from './pages/CreatePage.tsx'
import HostRoomPage from './pages/HostRoomPage.tsx'
import JoinPage from './pages/JoinPage.tsx'
import LandingPage from './pages/LandingPage.tsx'
import PlayRoomPage from './pages/PlayRoomPage.tsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageShell />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/host/:roomCode" element={<HostRoomPage />} />
          <Route path="/play/:roomCode" element={<PlayRoomPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
