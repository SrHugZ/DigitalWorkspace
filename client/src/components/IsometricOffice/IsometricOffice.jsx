import React, { useRef, useEffect, useState, useCallback } from 'react'
import { IsometricEngine } from '../../engine/IsometricEngine.js'
import { Pathfinder } from '../../engine/Pathfinding.js'
import { Avatar, SKIN_COLORS, HAIR_COLORS, HAIR_STYLES, SHIRT_COLORS } from '../../engine/Avatar.js'
import { createOfficeLayout, getZoneAt, getFurnitureObstacles, getZoneLabels } from '../../engine/OfficeLayout.js'
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

  const [hoveredTile, setHoveredTile] = useState(null)
  const [currentZone, setCurrentZone] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const { currentUser, users, clientId, move, updateStatus } = useWorkspace()

  // Inicializar engine e layout (apenas uma vez)
  useEffect(() => {
    if (!canvasRef.current || initializedRef.current) return

    const canvas = canvasRef.current
    const container = canvas.parentElement

    // Ajustar tamanho do canvas
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

    // Se já tem avatar, não criar novamente
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

  // Sincronizar outros avatares
  useEffect(() => {
    if (!engineRef.current || !layoutRef.current) return

    const engine = engineRef.current
    const otherAvatars = otherAvatarsRef.current

    for (const user of users) {
      // Pular o usuário atual
      if (user.id === clientId) continue

      if (!otherAvatars.has(user.id)) {
        // Criar novo avatar para outro usuário
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
        otherAvatars.set(user.id, avatar)
        engine.addEntity(avatar)
      } else {
        // Atualizar posição do avatar
        const avatar = otherAvatars.get(user.id)
        if (user.x !== undefined && user.y !== undefined) {
          if (Math.abs(avatar.gridX - user.x) > 0.5 || Math.abs(avatar.gridY - user.y) > 0.5) {
            avatar.moveTo(user.x, user.y)
          }
        }
        avatar.status = user.status || 'available'
        avatar.name = user.name
      }
    }

    // Remover avatares de usuários que saíram
    for (const [id, avatar] of otherAvatars) {
      if (!users.find(u => u.id === id)) {
        engine.removeEntity(avatar)
        otherAvatars.delete(id)
      }
    }
  }, [users, clientId])

  // Handler de clique para mover avatar
  const handleClick = useCallback((e) => {
    if (!engineRef.current || !pathfinderRef.current || !myAvatarRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    // Converter para coordenadas do grid
    const gridPos = engineRef.current.screenToGrid(screenX, screenY)

    // Verificar se o destino é válido
    if (!pathfinderRef.current.isWalkable(gridPos.x, gridPos.y)) {
      // Tentar encontrar tile walkable mais próximo
      const closest = pathfinderRef.current.findClosestWalkable(gridPos.x, gridPos.y, 3)
      if (closest) {
        gridPos.x = closest.x
        gridPos.y = closest.y
      } else {
        return
      }
    }

    const avatar = myAvatarRef.current

    // Calcular caminho
    const path = pathfinderRef.current.findPath(
      Math.floor(avatar.gridX),
      Math.floor(avatar.gridY),
      gridPos.x,
      gridPos.y
    )

    if (path.length > 0) {
      // Definir caminho no avatar
      avatar.setPath(path)

      // Enviar posição final para o servidor
      const finalPos = path[path.length - 1]
      move(finalPos.x, finalPos.y)

      // Verificar zona de destino e atualizar status
      const zone = getZoneAt(layoutRef.current.zones, finalPos.x, finalPos.y)
      if (zone) {
        updateStatus(zone.status)
        setCurrentZone(zone)
      } else {
        updateStatus('available')
        setCurrentZone(null)
      }
    }
  }, [move, updateStatus])

  // Handler de movimento do mouse
  const handleMouseMove = useCallback((e) => {
    if (!engineRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    const gridPos = engineRef.current.screenToGrid(screenX, screenY)
    setHoveredTile(gridPos)

    // Highlight tile
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

      // Renderizar
      engine.render()

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
  }, [hoveredTile, isLoading])

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

      {/* Minimap */}
      <Minimap
        tileMap={layoutRef.current?.tileMap}
        zones={layoutRef.current?.zones}
        myAvatar={myAvatarRef.current}
        otherAvatars={otherAvatarsRef.current}
      />

      {/* Lista de Usuários */}
      {users.length > 0 && <UserList users={users} clientId={clientId} />}

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

    // Fundo do label
    ctx.font = `bold ${10 * zoom}px Arial`
    const textWidth = ctx.measureText(label.text).width

    ctx.fillStyle = label.color + 'CC'
    ctx.beginPath()
    ctx.roundRect(x - textWidth / 2 - 8 * zoom, y - 10 * zoom, textWidth + 16 * zoom, 20 * zoom, 4 * zoom)
    ctx.fill()

    // Texto
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
      // Fundo
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Desenhar zonas primeiro
      if (zones) {
        for (const zone of zones) {
          ctx.fillStyle = zone.color + '60'
          ctx.fillRect(zone.x * scale, zone.y * scale, zone.width * scale, zone.height * scale)
        }
      }

      // Desenhar tiles
      for (const tile of tileMap.getAllTiles()) {
        ctx.fillStyle = tile.walkable ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'
        ctx.fillRect(tile.gridX * scale, tile.gridY * scale, scale - 0.5, scale - 0.5)
      }

      // Desenhar outros avatares
      if (otherAvatars) {
        ctx.fillStyle = '#ef4444'
        for (const avatar of otherAvatars.values()) {
          ctx.beginPath()
          ctx.arc(avatar.visualX * scale, avatar.visualY * scale, scale * 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Desenhar meu avatar
      if (myAvatar) {
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

// Lista de usuários online
function UserList({ users, clientId }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#22c55e'
      case 'focused': return '#f59e0b'
      case 'in-meeting': return '#ef4444'
      case 'busy': return '#ef4444'
      case 'collaborating': return '#8b5cf6'
      case 'away': return '#64748b'
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
            {user.avatar?.emoji || '😊'}
          </div>
          <div className="user-list-item-info">
            <div className="user-list-item-name">
              {user.name} {user.id === clientId && '(você)'}
            </div>
            <div className="user-list-item-status">
              <span className="status-dot" style={{ backgroundColor: getStatusColor(user.status) }}></span>
              {getStatusText(user.status)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default IsometricOffice
