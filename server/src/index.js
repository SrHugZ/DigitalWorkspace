import { WebSocketServer } from 'ws'
import { v4 as uuidv4 } from 'uuid'
import { RoomManager } from './rooms/RoomManager.js'
import { handleMessage } from './websocket/messageHandler.js'

const PORT = process.env.PORT || 8080

const wss = new WebSocketServer({ port: PORT })
const roomManager = new RoomManager()

// Criar escritório padrão
roomManager.createRoom('main-office', {
  name: 'Escritório Principal',
  width: 1600,
  height: 900,
  zones: [
    { id: 'workstation-1', type: 'workstation', x: 100, y: 100, width: 300, height: 200, name: 'Área de Trabalho 1' },
    { id: 'workstation-2', type: 'workstation', x: 100, y: 350, width: 300, height: 200, name: 'Área de Trabalho 2' },
    { id: 'workstation-3', type: 'workstation', x: 100, y: 600, width: 300, height: 200, name: 'Área de Trabalho 3' },
    { id: 'meeting-room-1', type: 'meeting', x: 500, y: 100, width: 250, height: 200, name: 'Sala de Reunião 1' },
    { id: 'meeting-room-2', type: 'meeting', x: 500, y: 350, width: 250, height: 200, name: 'Sala de Reunião 2' },
    { id: 'lounge', type: 'lounge', x: 850, y: 100, width: 350, height: 300, name: 'Lounge / Café' },
    { id: 'open-space', type: 'open', x: 850, y: 450, width: 350, height: 350, name: 'Área Aberta' }
  ]
})

wss.on('connection', (ws) => {
  const clientId = uuidv4()
  ws.clientId = clientId
  ws.isAlive = true

  console.log(`Cliente conectado: ${clientId}`)

  ws.on('pong', () => {
    ws.isAlive = true
  })

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString())
      handleMessage(ws, message, roomManager, broadcast)
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
    }
  })

  ws.on('close', () => {
    const room = roomManager.getRoomByClient(clientId)
    if (room) {
      const user = room.removeUser(clientId)
      if (user) {
        // PRESENÇA DINÂMICA: avatar desaparece do mapa para todos
        broadcast(room.id, {
          type: 'user-left',
          userId: clientId,
          userName: user.name
        }, clientId)
        console.log(`👤 ${user.name} saiu do escritório (${room.getUserCount()} online)`)
      }
    } else {
      console.log(`Cliente desconectado: ${clientId}`)
    }
  })

  // Enviar ID do cliente
  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    rooms: roomManager.getRoomsList()
  }))
})

function broadcast(roomId, message, excludeClientId = null) {
  const room = roomManager.getRoom(roomId)
  if (!room) return

  const messageStr = JSON.stringify(message)

  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.clientId !== excludeClientId) {
      const user = room.getUser(client.clientId)
      if (user) {
        client.send(messageStr)
      }
    }
  })
}

// Heartbeat para detectar conexões mortas
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate()
    ws.isAlive = false
    ws.ping()
  })
}, 30000)

wss.on('close', () => {
  clearInterval(interval)
})

console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🏢 Digital Workspace Server                              ║
║   Servidor rodando na porta ${PORT}                          ║
║                                                            ║
║   Escritório Virtual Colaborativo                          ║
║   "Trabalhe remotamente como se estivesse no escritório"   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`)
