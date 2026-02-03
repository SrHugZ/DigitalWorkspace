import React, { useState } from 'react'
import { useWorkspace } from './contexts/WorkspaceContext'
import IsometricOffice from './components/IsometricOffice/IsometricOffice'
import './components/IsometricOffice/IsometricOffice.css'
import './styles/global.css'

function App() {
  const { currentUser, login, users } = useWorkspace()

  // Se não logou ainda, mostrar tela de login
  if (!currentUser) {
    return <LoginScreen onLogin={login} />
  }

  return (
    <div className="app">
      {/* Status Bar simples */}
      <div className="status-bar">
        <div className="status-bar-left">
          <span className="status-bar-logo">Digital Workspace</span>
          <span className="status-bar-room">Escritório Principal</span>
        </div>
        <div className="status-bar-right">
          <div className="user-count">
            <span>{users.length} online</span>
          </div>
          <div className="current-user">
            <div
              className="user-avatar-small"
              style={{ background: currentUser.avatar?.color || '#667eea' }}
            >
              {currentUser.avatar?.emoji || '😊'}
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-status">
                <span className={`status-indicator ${currentUser.status}`}></span>
                {getStatusText(currentUser.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Escritório Isométrico */}
      <IsometricOffice />
    </div>
  )
}

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onLogin(name.trim())
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Digital Workspace</h1>
        <p>Escritório Virtual Colaborativo</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!name.trim()}>
            Entrar no Escritório
          </button>
        </form>
      </div>
    </div>
  )
}

function getStatusText(status) {
  switch (status) {
    case 'available': return 'Disponível'
    case 'focused': return 'Focado'
    case 'in-meeting': return 'Em reunião'
    case 'busy': return 'Ocupado'
    case 'collaborating': return 'Colaborando'
    case 'away': return 'Ausente'
    default: return 'Disponível'
  }
}

export default App
