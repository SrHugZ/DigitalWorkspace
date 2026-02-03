import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const WorkspaceContext = createContext(null)

// Gera um ID único
function generateId() {
  return 'user-' + Math.random().toString(36).substr(2, 9)
}

function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
  return colors[Math.floor(Math.random() * colors.length)]
}

export function WorkspaceProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const clientIdRef = useRef(generateId())

  // WebSocket connection (opcional - tenta conectar, mas funciona sem)
  const wsRef = useRef(null)

  useEffect(() => {
    // Tentar conectar ao WebSocket, mas não bloquear se falhar
    try {
      const ws = new WebSocket('ws://localhost:8080')

      ws.onopen = () => {
        console.log('WebSocket conectado')
        wsRef.current = ws
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          handleServerMessage(msg)
        } catch (e) {
          // ignore
        }
      }

      ws.onerror = () => {
        console.log('Servidor não disponível - modo offline')
      }

      ws.onclose = () => {
        wsRef.current = null
      }
    } catch (e) {
      console.log('Modo offline')
    }
  }, [])

  const handleServerMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'user-joined':
        setUsers(prev => [...prev.filter(u => u.id !== msg.user.id), msg.user])
        break
      case 'user-left':
        setUsers(prev => prev.filter(u => u.id !== msg.userId))
        break
      case 'user-moved':
        setUsers(prev => prev.map(u =>
          u.id === msg.userId ? { ...u, x: msg.x, y: msg.y, status: msg.status } : u
        ))
        break
      case 'chat-message':
        setMessages(prev => [...prev.slice(-50), msg])
        break
    }
  }, [])

  // Login local - funciona com ou sem servidor
  const login = useCallback((name) => {
    const user = {
      id: clientIdRef.current,
      name,
      avatar: { color: getRandomColor(), emoji: '😊' },
      status: 'available',
      x: 12,
      y: 32
    }

    setCurrentUser(user)
    setUsers([user])
    setIsConnected(true)

    // Se tiver WebSocket, notificar servidor
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({
        type: 'join-room',
        roomId: 'main-office',
        name,
        avatar: user.avatar
      }))
    }
  }, [])

  const move = useCallback((x, y) => {
    // Atualizar localmente
    setCurrentUser(prev => prev ? { ...prev, x, y } : null)
    setUsers(prev => prev.map(u =>
      u.id === clientIdRef.current ? { ...u, x, y } : u
    ))

    // Enviar para servidor se conectado
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'move', x, y }))
    }
  }, [])

  const updateStatus = useCallback((status) => {
    setCurrentUser(prev => prev ? { ...prev, status } : null)
    setUsers(prev => prev.map(u =>
      u.id === clientIdRef.current ? { ...u, status } : u
    ))

    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'update-status', status }))
    }
  }, [])

  const sendChatMessage = useCallback((text) => {
    const msg = {
      type: 'chat-message',
      text,
      from: currentUser,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev.slice(-50), msg])

    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'chat-message', text }))
    }
  }, [currentUser])

  const value = {
    isConnected,
    clientId: clientIdRef.current,
    currentUser,
    currentRoom: { name: 'Escritório Principal', width: 50, height: 40 },
    users,
    proximityGroup: null,
    messages,
    login,
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
