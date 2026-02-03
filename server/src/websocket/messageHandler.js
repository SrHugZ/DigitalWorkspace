export function handleMessage(ws, message, roomManager, broadcast) {
  const { type, ...data } = message

  switch (type) {
    case 'join-room':
      handleJoinRoom(ws, data, roomManager, broadcast)
      break

    case 'move':
      handleMove(ws, data, roomManager, broadcast)
      break

    case 'update-status':
      handleUpdateStatus(ws, data, roomManager, broadcast)
      break

    case 'update-zone':
      handleUpdateZone(ws, data, roomManager, broadcast)
      break

    case 'toggle-camera':
      handleToggleCamera(ws, data, roomManager, broadcast)
      break

    case 'chat-message':
      handleChatMessage(ws, data, roomManager, broadcast)
      break

    // WebRTC Signaling
    case 'offer':
    case 'answer':
    case 'ice-candidate':
      handleWebRTCSignaling(ws, message, roomManager, broadcast)
      break

    case 'leave-room':
      handleLeaveRoom(ws, roomManager, broadcast)
      break

    default:
      console.log('Mensagem desconhecida:', type)
  }
}

function handleJoinRoom(ws, data, roomManager, broadcast) {
  const { roomId, name, avatar } = data
  const clientId = ws.clientId

  const user = roomManager.joinRoom(roomId, clientId, { name, avatar })
  if (!user) {
    ws.send(JSON.stringify({ type: 'error', message: 'Sala não encontrada' }))
    return
  }

  const room = roomManager.getRoom(roomId)

  // Enviar estado da sala para o novo usuário
  ws.send(JSON.stringify({
    type: 'room-joined',
    room: room.getState(),
    user
  }))

  // PRESENÇA DINÂMICA: Notificar outros usuários que alguém entrou
  broadcast(roomId, {
    type: 'user-joined',
    user
  }, clientId)

  console.log(`👤 ${name} entrou no escritório (${room.getUserCount()} online)`)
}

function handleMove(ws, data, roomManager, broadcast) {
  const { x, y } = data
  const clientId = ws.clientId
  const room = roomManager.getRoomByClient(clientId)

  if (!room) return

  const result = room.updateUserPosition(clientId, x, y)
  if (!result) return

  // Broadcast posição atualizada para todos
  broadcast(room.id, {
    type: 'user-moved',
    userId: clientId,
    x: result.user.x,
    y: result.user.y,
    status: result.user.status,
    currentZone: result.user.currentZone?.name || null
  })

  // Notificar mudanças de proximidade
  if (result.proximityChanges.newConnections.length > 0) {
    result.proximityChanges.newConnections.forEach(group => {
      broadcast(room.id, {
        type: 'proximity-start',
        group
      })
    })
  }

  if (result.proximityChanges.disconnections.length > 0) {
    result.proximityChanges.disconnections.forEach(group => {
      broadcast(room.id, {
        type: 'proximity-end',
        group
      })
    })
  }
}

function handleUpdateStatus(ws, data, roomManager, broadcast) {
  const { status } = data
  const clientId = ws.clientId
  const room = roomManager.getRoomByClient(clientId)

  if (!room) return

  const user = room.getUser(clientId)
  if (user) {
    user.status = status
    broadcast(room.id, {
      type: 'user-status-changed',
      userId: clientId,
      status
    })
  }
}

function handleUpdateZone(ws, data, roomManager, broadcast) {
  const { zone } = data
  const clientId = ws.clientId
  const room = roomManager.getRoomByClient(clientId)

  if (!room) return

  const user = room.getUser(clientId)
  if (user) {
    user.currentZoneName = zone
    broadcast(room.id, {
      type: 'user-zone-changed',
      userId: clientId,
      zone
    })
  }
}

function handleToggleCamera(ws, data, roomManager, broadcast) {
  const { cameraEnabled } = data
  const clientId = ws.clientId
  const room = roomManager.getRoomByClient(clientId)

  if (!room) return

  const user = room.getUser(clientId)
  if (user) {
    user.cameraEnabled = cameraEnabled
    // Notificar todos sobre mudança de câmera
    broadcast(room.id, {
      type: 'user-camera-toggled',
      userId: clientId,
      cameraEnabled
    })
    console.log(`📹 ${user.name} ${cameraEnabled ? 'ligou' : 'desligou'} a câmera`)
  }
}

function handleChatMessage(ws, data, roomManager, broadcast) {
  const { text, targetUserId } = data
  const clientId = ws.clientId
  const room = roomManager.getRoomByClient(clientId)

  if (!room) return

  const user = room.getUser(clientId)
  if (!user) return

  const message = {
    type: 'chat-message',
    from: {
      id: clientId,
      name: user.name
    },
    text,
    timestamp: Date.now()
  }

  if (targetUserId) {
    message.isDirect = true
    broadcast(room.id, message)
  } else {
    const group = room.getProximityGroup(clientId)
    if (group) {
      message.groupId = group.id
      broadcast(room.id, message)
    }
  }
}

function handleWebRTCSignaling(ws, message, roomManager, broadcast) {
  const { type, targetUserId, ...signalData } = message
  const clientId = ws.clientId
  const room = roomManager.getRoomByClient(clientId)

  if (!room) return

  broadcast(room.id, {
    type,
    fromUserId: clientId,
    targetUserId,
    ...signalData
  })
}

function handleLeaveRoom(ws, roomManager, broadcast) {
  const clientId = ws.clientId
  const result = roomManager.leaveRoom(clientId)

  if (result && result.user) {
    // PRESENÇA DINÂMICA: Notificar que alguém saiu
    broadcast(result.room.id, {
      type: 'user-left',
      userId: clientId,
      userName: result.user.name
    }, clientId)

    console.log(`👤 ${result.user.name} saiu do escritório`)
  }
}
