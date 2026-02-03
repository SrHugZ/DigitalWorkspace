import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

const WorkspaceContext = createContext(null)

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
  const [presenceEvents, setPresenceEvents] = useState([]) // Eventos de entrada/saída
  const [roomOccupancy, setRoomOccupancy] = useState({})  // Quantos em cada sala
  const clientIdRef = useRef(generateId())
  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)

  // WebSocket connection com reconexão automática
  const connectWebSocket = useCallback(() => {
    try {
      // Detecta automaticamente o host: funciona local e remoto
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = window.location.hostname
      const wsPort = 8080
      const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}`
      console.log('Conectando WebSocket:', wsUrl)
      const ws = new WebSocket(wsUrl)

      ws.onopen = () => {
        console.log('WebSocket conectado ao servidor')
        wsRef.current = ws

        // Se já logou, re-enviar join
        if (currentUser) {
          ws.send(JSON.stringify({
            type: 'join-room',
            roomId: 'main-office',
            name: currentUser.name,
            avatar: currentUser.avatar
          }))
        }
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
        // Tentar reconectar em 5 segundos
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = setTimeout(connectWebSocket, 5000)
      }
    } catch (e) {
      console.log('Modo offline')
    }
  }, [currentUser])

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const handleServerMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'connected':
        // Servidor enviou nosso ID
        break

      case 'room-joined':
        // Atualizar com estado da sala do servidor
        if (msg.room && msg.room.users) {
          setUsers(msg.room.users)
        }
        break

      case 'user-joined':
        // PRESENÇA DINÂMICA: alguém entrou
        setUsers(prev => [...prev.filter(u => u.id !== msg.user.id), msg.user])
        addPresenceEvent('join', msg.user)
        break

      case 'user-left':
        // PRESENÇA DINÂMICA: alguém saiu
        setUsers(prev => {
          const user = prev.find(u => u.id === msg.userId)
          if (user) addPresenceEvent('leave', user)
          return prev.filter(u => u.id !== msg.userId)
        })
        break

      case 'user-moved':
        setUsers(prev => prev.map(u =>
          u.id === msg.userId ? { ...u, x: msg.x, y: msg.y, status: msg.status, currentZone: msg.currentZone } : u
        ))
        break

      case 'user-status-changed':
        setUsers(prev => prev.map(u =>
          u.id === msg.userId ? { ...u, status: msg.status } : u
        ))
        break

      case 'user-camera-toggled':
        setUsers(prev => prev.map(u =>
          u.id === msg.userId ? { ...u, cameraEnabled: msg.cameraEnabled } : u
        ))
        break

      case 'proximity-start':
        // Alguém chegou perto
        addPresenceEvent('proximity', { group: msg.group })
        break

      case 'proximity-end':
        break

      case 'chat-message':
        setMessages(prev => [...prev.slice(-50), msg])
        break
    }
  }, [])

  const addPresenceEvent = useCallback((type, data) => {
    const event = {
      id: Date.now() + Math.random(),
      type,
      data,
      timestamp: Date.now()
    }
    setPresenceEvents(prev => [...prev.slice(-10), event])

    // Auto-remover após 5 segundos
    setTimeout(() => {
      setPresenceEvents(prev => prev.filter(e => e.id !== event.id))
    }, 5000)
  }, [])

  // Login local - funciona com ou sem servidor
  const login = useCallback((name) => {
    const user = {
      id: clientIdRef.current,
      name,
      avatar: { color: getRandomColor(), emoji: '😊' },
      status: 'available',
      cameraEnabled: false,
      x: 12,
      y: 32,
      currentZone: null
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
    setCurrentUser(prev => prev ? { ...prev, x, y } : null)
    setUsers(prev => prev.map(u =>
      u.id === clientIdRef.current ? { ...u, x, y } : u
    ))

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

  const updateCurrentZone = useCallback((zone) => {
    const zoneName = zone ? zone.name : null
    setCurrentUser(prev => prev ? { ...prev, currentZone: zoneName } : null)
    setUsers(prev => prev.map(u =>
      u.id === clientIdRef.current ? { ...u, currentZone: zoneName } : u
    ))

    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'update-zone', zone: zoneName }))
    }
  }, [])

  const toggleCamera = useCallback(() => {
    setCurrentUser(prev => {
      if (!prev) return null
      const newState = !prev.cameraEnabled
      // Notificar servidor
      if (wsRef.current && wsRef.current.readyState === 1) {
        wsRef.current.send(JSON.stringify({ type: 'toggle-camera', cameraEnabled: newState }))
      }
      return { ...prev, cameraEnabled: newState }
    })
    setUsers(prev => prev.map(u =>
      u.id === clientIdRef.current ? { ...u, cameraEnabled: !u.cameraEnabled } : u
    ))
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

  // Calcular ocupação por sala
  useEffect(() => {
    const occupancy = {}
    for (const user of users) {
      const zone = user.currentZone || 'unknown'
      occupancy[zone] = (occupancy[zone] || 0) + 1
    }
    setRoomOccupancy(occupancy)
  }, [users])

  const value = {
    isConnected,
    clientId: clientIdRef.current,
    currentUser,
    currentRoom: { name: 'Escritório Principal', width: 50, height: 40 },
    users,
    presenceEvents,
    roomOccupancy,
    proximityGroup: null,
    messages,
    login,
    move,
    updateStatus,
    updateCurrentZone,
    toggleCamera,
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
