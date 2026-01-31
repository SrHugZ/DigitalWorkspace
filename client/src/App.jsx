import React from 'react'
import { useWorkspace } from './contexts/WorkspaceContext'
import LoginScreen from './components/UI/LoginScreen'
import Office from './components/Office/Office'
import VideoOverlay from './components/VideoChat/VideoOverlay'
import StatusBar from './components/UI/StatusBar'

function App() {
  const { isConnected, currentUser, currentRoom } = useWorkspace()

  if (!isConnected || !currentUser) {
    return <LoginScreen />
  }

  return (
    <div className="app">
      <StatusBar />
      <Office />
      <VideoOverlay />
    </div>
  )
}

export default App
