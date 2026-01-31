import React, { useRef, useEffect, useState, useCallback } from 'react'
import { IsometricEngine } from '../../engine/IsometricEngine.js'
import { Pathfinder, visualizePath } from '../../engine/Pathfinding.js'
import { Avatar, SKIN_COLORS, HAIR_COLORS, HAIR_STYLES, SHIRT_COLORS } from '../../engine/Avatar.js'
import { createOfficeLayout, getZoneAt, getFurnitureObstacles } from '../../engine/OfficeLayout.js'
import { useWorkspace } from '../../contexts/WorkspaceContext.jsx'

function IsometricOffice() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const pathfinderRef = useRef(null)
  const avatarsRef = useRef(new Map())
  const layoutRef = useRef(null)
  const lastTimeRef = useRef(0)

  const [hoveredTile, setHoveredTile] = useState(null)
  const [currentZone, setCurrentZone] = useState(null)
  const [debugPath, setDebugPath] = useState([])

  const { currentUser, users, clientId, move, updateStatus } = useWorkspace()

  // Inicializar engine e layout
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const container = canvas.parentElement

    // Ajustar tamanho do canvas
    const resize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      if (engineRef.current) {
        // Centralizar no spawn point
        engineRef.current.centerOn(layoutRef.current.spawnPoint.x, layoutRef.current.spawnPoint.y)
      }
    }

    resize()
    window.addEventListener('resize', resize)

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

    // Centralizar vista
    engine.centerOn(layout.spawnPoint.x, layout.spawnPoint.y)

    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Sincronizar avatares com usuários
  useEffect(() => {
    if (!engineRef.current || !layoutRef.current) return

    const engine = engineRef.current
    const avatars = avatarsRef.current

    // Atualizar/criar avatares para cada usuário
    for (const user of users) {
      if (!avatars.has(user.id)) {
        // Criar novo avatar
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

        avatars.set(user.id, avatar)
        engine.addEntity(avatar)
      } else {
        // Atualizar avatar existente
        const avatar = avatars.get(user.id)

        // Se a posição mudou (de outro usuário), mover suavemente
        if (user.id !== clientId) {
          if (avatar.gridX !== user.x || avatar.gridY !== user.y) {
            avatar.moveTo(user.x, user.y)
          }
        }

        avatar.status = user.status || 'available'
        avatar.name = user.name
      }
    }

    // Remover avatares de usuários que saíram
    for (const [id, avatar] of avatars) {
      if (!users.find(u => u.id === id)) {
        engine.removeEntity(avatar)
        avatars.delete(id)
      }
    }
  }, [users, clientId])

  // Handler de clique para mover avatar
  const handleClick = useCallback((e) => {
    if (!engineRef.current || !pathfinderRef.current || !clientId) return

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
        return // Não pode ir para lá
      }
    }

    // Obter avatar do usuário atual
    const avatar = avatarsRef.current.get(clientId)
    if (!avatar) return

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
      setDebugPath(path)

      // Enviar posição final para o servidor
      const finalPos = path[path.length - 1]
      move(finalPos.x, finalPos.y)

      // Verificar zona de destino
      const zone = getZoneAt(layoutRef.current.zones, finalPos.x, finalPos.y)
      if (zone) {
        updateStatus(zone.status)
        setCurrentZone(zone)
      } else {
        updateStatus('available')
        setCurrentZone(null)
      }
    }
  }, [clientId, move, updateStatus])

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
    if (!engineRef.current) return

    let animationId

    const animate = (time) => {
      const deltaTime = time - lastTimeRef.current
      lastTimeRef.current = time

      const engine = engineRef.current

      // Atualizar avatares
      for (const avatar of avatarsRef.current.values()) {
        avatar.update(deltaTime)
      }

      // Renderizar
      engine.render()

      // Desenhar path de debug (opcional)
      if (debugPath.length > 0) {
        visualizePath(engine.ctx, engine, debugPath)
      }

      // Desenhar highlight do tile sob o mouse
      if (hoveredTile && layoutRef.current) {
        const tile = layoutRef.current.tileMap.getTile(hoveredTile.x, hoveredTile.y)
        if (tile && tile.walkable) {
          const { x, y } = engine.gridToScreen(hoveredTile.x, hoveredTile.y)
          const zoom = engine.zoom

          engine.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
          engine.ctx.lineWidth = 2 * zoom
          engine.ctx.beginPath()
          engine.ctx.moveTo(x, y - 16 * zoom)
          engine.ctx.lineTo(x + 32 * zoom, y)
          engine.ctx.lineTo(x, y + 16 * zoom)
          engine.ctx.lineTo(x - 32 * zoom, y)
          engine.ctx.closePath()
          engine.ctx.stroke()
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [hoveredTile, debugPath])

  return (
    <div className="isometric-office-container">
      <canvas
        ref={canvasRef}
        className="isometric-canvas"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      />

      {/* Indicador de zona atual */}
      {currentZone && (
        <div className="zone-indicator" style={{ backgroundColor: currentZone.color }}>
          {currentZone.name}
        </div>
      )}

      {/* Minimap (opcional) */}
      <Minimap
        tileMap={layoutRef.current?.tileMap}
        zones={layoutRef.current?.zones}
        avatars={avatarsRef.current}
        clientId={clientId}
      />

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
      </div>

      {/* Instruções */}
      <div className="instructions">
        <p>Clique para mover • Scroll para zoom • Arraste com botão direito para pan</p>
      </div>
    </div>
  )
}

// Componente de Minimap
function Minimap({ tileMap, zones, avatars, clientId }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current || !tileMap) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const scale = 4

    canvas.width = tileMap.width * scale
    canvas.height = tileMap.height * scale

    // Fundo
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Desenhar tiles
    for (const tile of tileMap.getAllTiles()) {
      ctx.fillStyle = tile.walkable ? '#3f3f5a' : '#2a2a3e'
      ctx.fillRect(tile.gridX * scale, tile.gridY * scale, scale - 1, scale - 1)
    }

    // Desenhar zonas
    if (zones) {
      for (const zone of zones) {
        ctx.fillStyle = zone.color + '40' // Semi-transparente
        ctx.fillRect(zone.x * scale, zone.y * scale, zone.width * scale, zone.height * scale)
      }
    }

    // Desenhar avatares
    if (avatars) {
      for (const [id, avatar] of avatars) {
        ctx.fillStyle = id === clientId ? '#fbbf24' : '#ef4444'
        ctx.beginPath()
        ctx.arc(avatar.visualX * scale, avatar.visualY * scale, scale, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }, [tileMap, zones, avatars, clientId])

  return (
    <div className="minimap">
      <canvas ref={canvasRef} />
    </div>
  )
}

export default IsometricOffice
