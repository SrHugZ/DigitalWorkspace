import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'

const WorkspaceContext = createContext(null)

export function WorkspaceProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentRoom, setCurrentRoom] = useState(null)
  const [users, setUsers] = useState([])
  const [proximityGroup, setProximityGroup] = useState(null)
  const [messages, setMessages] = useState([])
  const [availableRooms, setAvailableRooms] = useState([])

  const {
    isConnected,
    clientId,
    send,
    lastMessage
  } = useWebSocket('ws://localhost:8080')

  // Processar mensagens do servidor
  useEffect(() => {
    if (!lastMessage) return

    switch (lastMessage.type) {
      case 'connected':
        setAvailableRooms(lastMessage.rooms || [])
        break

      case 'room-joined':
        setCurrentRoom(lastMessage.room)
        setCurrentUser(lastMessage.user)
        setUsers(lastMessage.room.users)
        break

      case 'user-joined':
        setUsers(prev => [...prev.filter(u => u.id !== lastMessage.user.id), lastMessage.user])
        break

      case 'user-left':
        setUsers(prev => prev.filter(u => u.id !== lastMessage.userId))
        break

      case 'user-moved':
        setUsers(prev => prev.map(u =>
          u.id === lastMessage.userId
            ? { ...u, x: lastMessage.x, y: lastMessage.y, status: lastMessage.status, currentZone: lastMessage.currentZone }
            : u
        ))
        break

      case 'user-status-changed':
        setUsers(prev => prev.map(u =>
          u.id === lastMessage.userId
            ? { ...u, status: lastMessage.status }
            : u
        ))
        break

      case 'proximity-start':
        if (lastMessage.group.members.includes(clientId)) {
          setProximityGroup(lastMessage.group)
        }
        break

      case 'proximity-end':
        if (lastMessage.group.members.includes(clientId)) {
          setProximityGroup(null)
        }
        break

      case 'chat-message':
        setMessages(prev => [...prev.slice(-50), lastMessage])
        break

      default:
        break
    }
  }, [lastMessage, clientId])

  // Atualizar posição do usuário atual
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'user-moved') return
    if (lastMessage.userId === clientId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        x: lastMessage.x,
        y: lastMessage.y,
        status: lastMessage.status,
        currentZone: lastMessage.currentZone
      } : null)
    }
  }, [lastMessage, clientId])

  const joinRoom = useCallback((roomId, name) => {
    send({
      type: 'join-room',
      roomId,
      name,
      avatar: { color: getRandomColor(), emoji: '😊' }
    })
  }, [send])

  const move = useCallback((x, y) => {
    send({ type: 'move', x, y })
  }, [send])

  const updateStatus = useCallback((status) => {
    send({ type: 'update-status', status })
  }, [send])

  const sendChatMessage = useCallback((text) => {
    send({ type: 'chat-message', text })
  }, [send])

  const value = {
    isConnected,
    clientId,
    currentUser,
    currentRoom,
    users,
    proximityGroup,
    messages,
    availableRooms,
    joinRoom,
    move,
    updateStatus,
    sendChatMessage
  }

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}

function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
  return colors[Math.floor(Math.random() * colors.length)]
}
