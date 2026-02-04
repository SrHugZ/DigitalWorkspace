import React, { useRef, useEffect, useState, useCallback } from 'react'
import { IsometricEngine } from '../../engine/IsometricEngine.js'
import { Pathfinder } from '../../engine/Pathfinding.js'
import { Avatar, SKIN_COLORS, HAIR_COLORS, HAIR_STYLES, SHIRT_COLORS } from '../../engine/Avatar.js'
import { createOfficeLayout, getZoneAt, getFurnitureObstacles, getZoneLabels } from '../../engine/OfficeLayout.js'
import { updateWaterAnimation } from '../../engine/TileMap.js'
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx'

function IsometricOffice() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const pathfinderRef = useRef(null)
  const myAvatarRef = useRef(null)
  const otherAvatarsRef = useRef(new Map())
  const layoutRef = useRef(null)
  const lastTimeRef = useRef(0)
  const initializedRef = useRef(false)
  const ambientRef = useRef({ brightness: 0.3, targetBrightness: 0.3, particles: [] })

  const [hoveredTile, setHoveredTile] = useState(null)
  const [currentZone, setCurrentZone] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const {
    currentUser, users, clientId, move, updateStatus,
    updateCurrentZone, toggleCamera, presenceEvents
  } = useWorkspace()

  // Inicializar engine e layout (apenas uma vez)
  useEffect(() => {
    if (!canvasRef.current || initializedRef.current) return

    const canvas = canvasRef.current
    const container = canvas.parentElement

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    const handleResize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
    window.addEventListener('resize', handleResize)

    // Criar layout do escritório
    const layout = createOfficeLayout()
    layoutRef.current = layout

    // Criar engine
    const engine = new IsometricEngine(canvas, {
      offsetX: canvas.width / 2,
      offsetY: canvas.height / 3
    })
    engineRef.current = engine

    // Adicionar tiles à engine
    engine.tiles = layout.tileMap.getAllTiles()
    engine.walls = layout.walls

    // Criar pathfinder
    const obstacles = getFurnitureObstacles(layout.furniture)
    const pathfinder = new Pathfinder(layout.tileMap, obstacles)
    pathfinderRef.current = pathfinder

    // Adicionar móveis como entidades
    for (const item of layout.furniture) {
      engine.addEntity(item)
    }

    // Centralizar na recepção
    engine.centerOn(layout.spawnPoint.x, layout.spawnPoint.y)

    initializedRef.current = true
    setIsLoading(false)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Criar/atualizar avatar do usuário atual quando ele conectar
  useEffect(() => {
    if (!engineRef.current || !layoutRef.current || !currentUser || !clientId) return

    if (myAvatarRef.current) return

    const layout = layoutRef.current
    const engine = engineRef.current

    const myAvatar = new Avatar(
      layout.spawnPoint.x,
      layout.spawnPoint.y,
      {
        id: clientId,
        name: currentUser.name,
        skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
        hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
        hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
        shirtColor: currentUser.avatar?.color || SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)],
        status: 'available'
      }
    )
    myAvatarRef.current = myAvatar
    engine.addEntity(myAvatar)

    // Centralizar no avatar
    engine.centerOn(layout.spawnPoint.x, layout.spawnPoint.y)
  }, [currentUser, clientId])

  // Sincronizar outros avatares - PRESENÇA DINÂMICA
  useEffect(() => {
    if (!engineRef.current || !layoutRef.current) return

    const engine = engineRef.current
    const otherAvatars = otherAvatarsRef.current

    for (const user of users) {
      if (user.id === clientId) continue

      if (!otherAvatars.has(user.id)) {
        // PRESENÇA: Novo usuário entrou - criar avatar com animação de spawn
        const avatar = new Avatar(
          user.x || layoutRef.current.spawnPoint.x,
          user.y || layoutRef.current.spawnPoint.y,
          {
            id: user.id,
            name: user.name,
            skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
            hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
            hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
            shirtColor: user.avatar?.color || SHIRT_COLORS[Math.floor(Math.random() * SHIRT_COLORS.length)],
            status: user.status || 'available'
          }
        )
        // Camera state
        avatar.cameraEnabled = user.cameraEnabled || false
        otherAvatars.set(user.id, avatar)
        engine.addEntity(avatar)
      } else {
        // Atualizar posição e estado do avatar existente
        const avatar = otherAvatars.get(user.id)
        if (user.x !== undefined && user.y !== undefined) {
          if (Math.abs(avatar.gridX - user.x) > 0.5 || Math.abs(avatar.gridY - user.y) > 0.5) {
            avatar.moveTo(user.x, user.y)
          }
        }
        avatar.status = user.status || 'available'
        avatar.name = user.name
        avatar.cameraEnabled = user.cameraEnabled || false
      }
    }

    // PRESENÇA: Remover avatares de usuários que saíram - com animação de despawn
    for (const [id, avatar] of otherAvatars) {
      if (!users.find(u => u.id === id)) {
        avatar.despawn(() => {
          engine.removeEntity(avatar)
        })
        otherAvatars.delete(id)
      }
    }

    // Atualizar brilho ambiente baseado em ocupação
    const totalUsers = users.length
    ambientRef.current.targetBrightness = Math.min(1, 0.3 + totalUsers * 0.15)
  }, [users, clientId])

  // Sincronizar estado da câmera do avatar local
  useEffect(() => {
    if (myAvatarRef.current && currentUser) {
      myAvatarRef.current.cameraEnabled = currentUser.cameraEnabled || false
    }
  }, [currentUser?.cameraEnabled])

  // Handler de clique para mover avatar
  const handleClick = useCallback((e) => {
    if (!engineRef.current || !pathfinderRef.current || !myAvatarRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    const gridPos = engineRef.current.screenToGrid(screenX, screenY)

    if (!pathfinderRef.current.isWalkable(gridPos.x, gridPos.y)) {
      const closest = pathfinderRef.current.findClosestWalkable(gridPos.x, gridPos.y, 3)
      if (closest) {
        gridPos.x = closest.x
        gridPos.y = closest.y
      } else {
        return
      }
    }

    const avatar = myAvatarRef.current

    const path = pathfinderRef.current.findPath(
      Math.floor(avatar.gridX),
      Math.floor(avatar.gridY),
      gridPos.x,
      gridPos.y
    )

    if (path.length > 0) {
      avatar.setPath(path)

      const finalPos = path[path.length - 1]
      move(finalPos.x, finalPos.y)

      // PRESENÇA CONTEXTUAL: zona define status
      const zone = getZoneAt(layoutRef.current.zones, finalPos.x, finalPos.y)
      if (zone) {
        updateStatus(zone.status)
        updateCurrentZone(zone)
        setCurrentZone(zone)
      } else {
        updateStatus('available')
        updateCurrentZone(null)
        setCurrentZone(null)
      }
    }
  }, [move, updateStatus, updateCurrentZone])

  // Handler de movimento do mouse
  const handleMouseMove = useCallback((e) => {
    if (!engineRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    const gridPos = engineRef.current.screenToGrid(screenX, screenY)
    setHoveredTile(gridPos)

    if (layoutRef.current) {
      layoutRef.current.tileMap.highlightTile(gridPos.x, gridPos.y)
    }
  }, [])

  // Loop de animação
  useEffect(() => {
    if (isLoading) return

    let animationId

    const animate = (time) => {
      const deltaTime = time - lastTimeRef.current
      lastTimeRef.current = time

      const engine = engineRef.current
      if (!engine) {
        animationId = requestAnimationFrame(animate)
        return
      }

      // Atualizar avatar do usuário
      if (myAvatarRef.current) {
        myAvatarRef.current.update(deltaTime)
      }

      // Atualizar outros avatares
      for (const avatar of otherAvatarsRef.current.values()) {
        avatar.update(deltaTime)
      }

      // === EFEITO AMBIENTE: brilho baseado em ocupação ===
      const ambient = ambientRef.current
      ambient.brightness += (ambient.targetBrightness - ambient.brightness) * 0.02

      // Atualizar animação da água
      updateWaterAnimation()

      // Renderizar
      engine.render()

      // Overlay de brilho ambiente (escritório "adormecido" vs "vivo")
      renderAmbientOverlay(engine.ctx, engine.canvas, ambient.brightness, users.length)

      // Desenhar labels das zonas
      if (layoutRef.current) {
        const labels = getZoneLabels(layoutRef.current.zones)
        drawZoneLabels(engine.ctx, engine, labels)
      }

      // Desenhar highlight do tile sob o mouse
      if (hoveredTile && layoutRef.current) {
        const tile = layoutRef.current.tileMap.getTile(hoveredTile.x, hoveredTile.y)
        if (tile && tile.walkable) {
          drawTileHighlight(engine.ctx, engine, hoveredTile.x, hoveredTile.y, 'rgba(255, 255, 255, 0.3)')
        } else if (tile) {
          drawTileHighlight(engine.ctx, engine, hoveredTile.x, hoveredTile.y, 'rgba(255, 0, 0, 0.3)')
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [hoveredTile, isLoading, users.length])

  return (
    <div className="isometric-office-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner-large"></div>
          <div className="loading-text">Carregando escritório...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="isometric-canvas"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      />

      {/* Indicador de zona atual */}
      {currentZone && (
        <div className="zone-indicator" style={{ backgroundColor: currentZone.color }}>
          {currentZone.icon} {currentZone.name}
        </div>
      )}

      {/* Notificações de presença */}
      <PresenceNotifications events={presenceEvents} />

      {/* Indicador de escritório vazio */}
      {users.length <= 1 && !isLoading && (
        <div className="empty-office-indicator">
          <div className="empty-office-icon">🏢</div>
          <div className="empty-office-text">Escritório tranquilo</div>
          <div className="empty-office-sub">Você é a única pessoa online</div>
        </div>
      )}

      {/* Minimap */}
      <Minimap
        tileMap={layoutRef.current?.tileMap}
        zones={layoutRef.current?.zones}
        myAvatar={myAvatarRef.current}
        otherAvatars={otherAvatarsRef.current}
      />

      {/* Lista de Usuários com presença contextual */}
      {users.length > 0 && <UserList users={users} clientId={clientId} />}

      {/* Controles */}
      <div className="office-controls">
        <button
          className={`control-btn ${currentUser?.cameraEnabled ? 'active' : ''}`}
          onClick={toggleCamera}
          title={currentUser?.cameraEnabled ? 'Desligar câmera' : 'Ligar câmera'}
        >
          {currentUser?.cameraEnabled ? '📹' : '📷'}
        </button>
        <button
          className="control-btn"
          onClick={() => {
            if (myAvatarRef.current) myAvatarRef.current.wave()
          }}
          title="Acenar"
        >
          👋
        </button>
      </div>

      {/* Controles de zoom */}
      <div className="zoom-controls">
        <button onClick={() => {
          if (engineRef.current) {
            engineRef.current.zoom = Math.min(2, engineRef.current.zoom * 1.2)
          }
        }}>+</button>
        <button onClick={() => {
          if (engineRef.current) {
            engineRef.current.zoom = Math.max(0.5, engineRef.current.zoom / 1.2)
          }
        }}>-</button>
        <button onClick={() => {
          if (engineRef.current && myAvatarRef.current) {
            engineRef.current.centerOn(myAvatarRef.current.visualX, myAvatarRef.current.visualY)
          }
        }} title="Centralizar no avatar">⌖</button>
      </div>

      {/* Instruções */}
      <div className="instructions">
        <p>Clique para mover | Scroll para zoom | Arraste com botão direito para pan</p>
      </div>
    </div>
  )
}

// === EFEITO AMBIENTE: escritório adormecido vs vivo ===
function renderAmbientOverlay(ctx, canvas, brightness, userCount) {
  if (userCount === 0) {
    // Escritório completamente vazio - escuro e com névoa
    ctx.fillStyle = `rgba(10, 10, 30, 0.4)`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Texto "Escritório vazio"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Aguardando pessoas...', canvas.width / 2, canvas.height / 2)
  } else if (userCount === 1) {
    // Uma pessoa - levemente escuro
    ctx.fillStyle = `rgba(10, 10, 30, ${0.15 * (1 - brightness)})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  // Mais pessoas = escritório mais "vivo" (sem overlay escuro)
}

// Notificações de presença
function PresenceNotifications({ events }) {
  if (!events || events.length === 0) return null

  return (
    <div className="presence-notifications">
      {events.map(event => (
        <div key={event.id} className={`presence-notification ${event.type}`}>
          {event.type === 'join' && (
            <>
              <span className="presence-icon">🟢</span>
              <span>{event.data.name} entrou no escritório</span>
            </>
          )}
          {event.type === 'leave' && (
            <>
              <span className="presence-icon">🔴</span>
              <span>{event.data.name} saiu do escritório</span>
            </>
          )}
          {event.type === 'proximity' && (
            <>
              <span className="presence-icon">💬</span>
              <span>Alguém está por perto</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

// Desenhar highlight do tile
function drawTileHighlight(ctx, engine, gridX, gridY, color) {
  const { x, y } = engine.gridToScreen(gridX, gridY)
  const zoom = engine.zoom
  const halfW = 32 * zoom
  const halfH = 16 * zoom

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - halfH)
  ctx.lineTo(x + halfW, y)
  ctx.lineTo(x, y + halfH)
  ctx.lineTo(x - halfW, y)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.lineWidth = 2 * zoom
  ctx.stroke()
}

// Desenhar labels das zonas
function drawZoneLabels(ctx, engine, labels) {
  for (const label of labels) {
    const { x, y } = engine.gridToScreen(label.x, label.y)
    const zoom = engine.zoom

    ctx.font = `bold ${10 * zoom}px Arial`
    const textWidth = ctx.measureText(label.text).width

    ctx.fillStyle = label.color + 'CC'
    ctx.beginPath()
    ctx.roundRect(x - textWidth / 2 - 8 * zoom, y - 10 * zoom, textWidth + 16 * zoom, 20 * zoom, 4 * zoom)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label.text, x, y)
  }
}

// Componente de Minimap
function Minimap({ tileMap, zones, myAvatar, otherAvatars }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !tileMap) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const scale = 3

    canvas.width = tileMap.width * scale
    canvas.height = tileMap.height * scale

    const draw = () => {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (zones) {
        for (const zone of zones) {
          ctx.fillStyle = zone.color + '60'
          ctx.fillRect(zone.x * scale, zone.y * scale, zone.width * scale, zone.height * scale)
        }
      }

      for (const tile of tileMap.getAllTiles()) {
        if (tile.type === 9) { // WATER
          ctx.fillStyle = 'rgba(59,143,212,0.5)'
        } else if (tile.type === 14) { // SAND
          ctx.fillStyle = 'rgba(232,216,168,0.4)'
        } else if (tile.type === 11) { // GARDEN
          ctx.fillStyle = 'rgba(72,176,104,0.5)'
        } else if (tile.type === 10) { // DECK
          ctx.fillStyle = 'rgba(160,120,72,0.5)'
        } else {
          ctx.fillStyle = tile.walkable ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'
        }
        ctx.fillRect(tile.gridX * scale, tile.gridY * scale, scale - 0.5, scale - 0.5)
      }

      // Outros avatares (só os que estão visíveis/conectados)
      if (otherAvatars) {
        ctx.fillStyle = '#ef4444'
        for (const avatar of otherAvatars.values()) {
          if (avatar.opacity <= 0) continue
          ctx.globalAlpha = avatar.opacity
          ctx.beginPath()
          ctx.arc(avatar.visualX * scale, avatar.visualY * scale, scale * 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      // Meu avatar
      if (myAvatar && myAvatar.opacity > 0) {
        ctx.fillStyle = '#fbbf24'
        ctx.beginPath()
        ctx.arc(myAvatar.visualX * scale, myAvatar.visualY * scale, scale * 2, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [tileMap, zones, myAvatar, otherAvatars])

  return (
    <div className="minimap">
      <canvas ref={canvasRef} />
    </div>
  )
}

// Lista de usuários online - PRESENÇA DINÂMICA
function UserList({ users, clientId }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#22c55e'
      case 'focused': return '#f59e0b'
      case 'in-meeting': return '#ef4444'
      case 'busy': return '#ef4444'
      case 'collaborating': return '#8b5cf6'
      case 'away': return '#64748b'
      case 'private': return '#ec4899'
      case 'urgent': return '#dc2626'
      default: return '#22c55e'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Disponível'
      case 'focused': return 'Focado'
      case 'in-meeting': return 'Em reunião'
      case 'busy': return 'Ocupado'
      case 'collaborating': return 'Colaborando'
      case 'away': return 'Ausente'
      case 'private': return 'Privado'
      case 'urgent': return 'Urgente'
      default: return 'Disponível'
    }
  }

  return (
    <div className="user-list-panel">
      <h3>Online ({users.length})</h3>
      {users.map(user => (
        <div key={user.id} className="user-list-item">
          <div
            className="user-list-item-avatar"
            style={{ backgroundColor: user.avatar?.color || '#667eea' }}
          >
            {user.cameraEnabled ? '📹' : (user.avatar?.emoji || '😊')}
          </div>
          <div className="user-list-item-info">
            <div className="user-list-item-name">
              {user.name} {user.id === clientId && '(você)'}
            </div>
            <div className="user-list-item-status">
              <span className="status-dot" style={{ backgroundColor: getStatusColor(user.status) }}></span>
              {getStatusText(user.status)}
            </div>
            {user.currentZone && (
              <div className="user-list-item-zone">
                📍 {user.currentZone}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default IsometricOffice
