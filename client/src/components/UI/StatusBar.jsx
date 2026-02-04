import React from 'react'
import { useWorkspace } from '../../contexts/WorkspaceContext'

function StatusBar() {
  const { currentUser, currentRoom, users, proximityGroup } = useWorkspace()

  if (!currentUser || !currentRoom) return null

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Disponível'
      case 'focused': return 'Focado'
      case 'in-meeting': return 'Em reunião'
      default: return status
    }
  }

  const getZoneName = () => {
    if (currentUser.currentZone) {
      return currentUser.currentZone.name
    }
    return 'Área Livre'
  }

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <span className="status-bar-logo">Digital Workspace</span>
        <span className="status-bar-room">{currentRoom.name}</span>
        {currentUser.currentZone && (
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
            • {getZoneName()}
          </span>
        )}
      </div>

      <div className="status-bar-right">
        <div className="user-count">
          <span>{users.length} online</span>
        </div>

        {proximityGroup && (
          <div style={{
            background: 'rgba(102, 126, 234, 0.3)',
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12
          }}>
            Em conversa ({proximityGroup.members.length} pessoas)
          </div>
        )}

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
  )
}

export default StatusBar
