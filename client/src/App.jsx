import React, { useState } from 'react'
import { useWorkspace } from './contexts/WorkspaceContext'
import LoginScreen from './components/UI/LoginScreen'
import Office from './components/Office/Office'
import IsometricOffice from './components/IsometricOffice/IsometricOffice'
import VideoOverlay from './components/VideoChat/VideoOverlay'
import StatusBar from './components/UI/StatusBar'
import './components/IsometricOffice/IsometricOffice.css'

function App() {
  const { isConnected, currentUser, currentRoom } = useWorkspace()
  const [useIsometric, setUseIsometric] = useState(true) // Default to isometric view

  if (!isConnected || !currentUser) {
    return <LoginScreen />
  }

  return (
    <div className="app">
      <StatusBar />

      {/* Toggle between views */}
      <div className="view-toggle">
        <button
          className={!useIsometric ? 'active' : ''}
          onClick={() => setUseIsometric(false)}
        >
          2D Simples
        </button>
        <button
          className={useIsometric ? 'active' : ''}
          onClick={() => setUseIsometric(true)}
        >
          Isométrico
        </button>
      </div>

      {/* Render selected view */}
      {useIsometric ? <IsometricOffice /> : <Office />}

      <VideoOverlay />
    </div>
  )
}

export default App
