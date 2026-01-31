import React, { useRef, useEffect } from 'react'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useWebRTC } from '../../hooks/useWebRTC'

function VideoOverlay() {
  const { proximityGroup, users, clientId } = useWorkspace()

  // Por enquanto, implementação simplificada sem WebRTC real
  // Em produção, você integraria o useWebRTC hook aqui

  if (!proximityGroup || proximityGroup.members.length < 2) {
    return null
  }

  const otherMembers = proximityGroup.members
    .filter(id => id !== clientId)
    .map(id => users.find(u => u.id === id))
    .filter(Boolean)

  return (
    <div className="video-overlay">
      <ProximityNotification members={otherMembers} />
      <MiniChat />
    </div>
  )
}

function ProximityNotification({ members }) {
  if (!members.length) return null

  const names = members.map(m => m.name).join(', ')

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(102, 126, 234, 0.9)',
      padding: '12px 24px',
      borderRadius: 30,
      fontSize: 14,
      zIndex: 100,
      animation: 'slideUp 0.3s ease'
    }}>
      Você está próximo de: <strong>{names}</strong>
    </div>
  )
}

function MiniChat() {
  const { messages, sendChatMessage, proximityGroup, users, clientId } = useWorkspace()
  const [text, setText] = React.useState('')
  const messagesEndRef = useRef(null)

  const groupMessages = messages.filter(m =>
    proximityGroup?.members.includes(m.from?.id)
  ).slice(-20)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [groupMessages])

  const handleSend = (e) => {
    e.preventDefault()
    if (text.trim()) {
      sendChatMessage(text.trim())
      setText('')
    }
  }

  const otherMembers = proximityGroup?.members
    .filter(id => id !== clientId)
    .map(id => users.find(u => u.id === id))
    .filter(Boolean) || []

  return (
    <div className="mini-chat">
      <div className="mini-chat-header">
        Chat com {otherMembers.map(m => m.name).join(', ')}
      </div>

      <div className="mini-chat-messages">
        {groupMessages.length === 0 && (
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', padding: 20 }}>
            Diga olá! 👋
          </div>
        )}
        {groupMessages.map((msg, i) => (
          <div key={i} className="mini-chat-message">
            <span className="sender" style={{ color: '#667eea' }}>
              {msg.from?.name}:
            </span>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="mini-chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Digite uma mensagem..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}

// Componente de vídeo para uso futuro com WebRTC completo
function VideoPlayer({ stream, muted = false, label }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
      />
      {label && <div className="video-label">{label}</div>}
    </div>
  )
}

export default VideoOverlay
