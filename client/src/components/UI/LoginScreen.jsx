import React, { useState } from 'react'
import { useWorkspace } from '../../contexts/WorkspaceContext'

function LoginScreen() {
  const { isConnected, joinRoom, availableRooms } = useWorkspace()
  const [name, setName] = useState('')
  const [isJoining, setIsJoining] = useState(false)

  const handleJoin = (e) => {
    e.preventDefault()
    if (!name.trim() || !isConnected) return

    setIsJoining(true)
    joinRoom('main-office', name.trim())
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Digital Workspace</h1>
        <p>Escritório Virtual Colaborativo</p>

        <form onSubmit={handleJoin}>
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={30}
          />

          <button type="submit" disabled={!name.trim() || !isConnected || isJoining}>
            {!isConnected ? 'Conectando...' : isJoining ? 'Entrando...' : 'Entrar no Escritório'}
          </button>
        </form>

        {availableRooms.length > 0 && (
          <div style={{ marginTop: 20, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            {availableRooms[0].userCount} pessoa(s) online
          </div>
        )}
      </div>

      <div style={{ marginTop: 40, textAlign: 'center', maxWidth: 500 }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.6 }}>
          "Trabalhe remotamente como se estivesse no mesmo escritório."
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 10 }}>
          Mova seu avatar pelo escritório, aproxime-se de colegas para conversar automaticamente.
        </p>
      </div>
    </div>
  )
}

export default LoginScreen
