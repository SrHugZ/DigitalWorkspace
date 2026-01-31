import React, { useRef, useEffect, useState, useCallback } from 'react'
import { useWorkspace } from '../../contexts/WorkspaceContext'

const AVATAR_SIZE = 40
const PROXIMITY_RADIUS = 150

function Office() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const targetPositionRef = useRef(null)

  const { currentUser, currentRoom, users, clientId, move, proximityGroup } = useWorkspace()

  const [hoveredUser, setHoveredUser] = useState(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  // Calcular escala e offset para centralizar
  useEffect(() => {
    if (!currentRoom || !containerRef.current) return

    const container = containerRef.current
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect()

    const scaleX = containerWidth / currentRoom.width
    const scaleY = containerHeight / currentRoom.height
    const newScale = Math.min(scaleX, scaleY, 1)

    const offsetX = (containerWidth - currentRoom.width * newScale) / 2
    const offsetY = (containerHeight - currentRoom.height * newScale) / 2

    setScale(newScale)
    setOffset({ x: offsetX, y: offsetY })
  }, [currentRoom])

  // Converter coordenadas do mouse para coordenadas do mundo
  const screenToWorld = useCallback((screenX, screenY) => {
    return {
      x: (screenX - offset.x) / scale,
      y: (screenY - offset.y) / scale
    }
  }, [scale, offset])

  // Handler de clique para mover avatar
  const handleClick = useCallback((e) => {
    if (!currentRoom) return

    const rect = canvasRef.current.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    const { x, y } = screenToWorld(screenX, screenY)

    // Limitar às bordas do escritório
    const clampedX = Math.max(AVATAR_SIZE / 2, Math.min(currentRoom.width - AVATAR_SIZE / 2, x))
    const clampedY = Math.max(AVATAR_SIZE / 2, Math.min(currentRoom.height - AVATAR_SIZE / 2, y))

    targetPositionRef.current = { x: clampedX, y: clampedY }
  }, [currentRoom, screenToWorld])

  // Handler de movimento do mouse para hover
  const handleMouseMove = useCallback((e) => {
    if (!users.length) return

    const rect = canvasRef.current.getBoundingClientRect()
    const screenX = e.clientX - rect.left
    const screenY = e.clientY - rect.top

    const { x, y } = screenToWorld(screenX, screenY)

    // Verificar se está sobre algum avatar
    const hovered = users.find(user => {
      const dx = user.x - x
      const dy = user.y - y
      return Math.sqrt(dx * dx + dy * dy) < AVATAR_SIZE / 2
    })

    setHoveredUser(hovered || null)
  }, [users, screenToWorld])

  // Loop de animação principal
  useEffect(() => {
    if (!canvasRef.current || !currentRoom) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const animate = () => {
      // Ajustar tamanho do canvas
      const container = containerRef.current
      if (container) {
        const { width, height } = container.getBoundingClientRect()
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width
          canvas.height = height
        }
      }

      // Limpar canvas
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Aplicar transformação
      ctx.save()
      ctx.translate(offset.x, offset.y)
      ctx.scale(scale, scale)

      // Desenhar grid de fundo
      drawGrid(ctx, currentRoom.width, currentRoom.height)

      // Desenhar zonas
      currentRoom.zones.forEach(zone => {
        drawZone(ctx, zone)
      })

      // Desenhar linhas de proximidade
      if (proximityGroup) {
        drawProximityLines(ctx, proximityGroup, users)
      }

      // Desenhar avatares
      users.forEach(user => {
        const isCurrentUser = user.id === clientId
        const isInProximity = proximityGroup?.members.includes(user.id)
        drawAvatar(ctx, user, isCurrentUser, isInProximity, hoveredUser?.id === user.id)
      })

      ctx.restore()

      // Mover avatar atual em direção ao destino
      if (targetPositionRef.current && currentUser) {
        const dx = targetPositionRef.current.x - currentUser.x
        const dy = targetPositionRef.current.y - currentUser.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance > 5) {
          const speed = 8
          const moveX = (dx / distance) * Math.min(speed, distance)
          const moveY = (dy / distance) * Math.min(speed, distance)

          move(currentUser.x + moveX, currentUser.y + moveY)
        } else {
          targetPositionRef.current = null
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentRoom, users, clientId, currentUser, scale, offset, move, proximityGroup, hoveredUser])

  return (
    <div ref={containerRef} className="office-container">
      <canvas
        ref={canvasRef}
        className="office-canvas"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
      />

      {/* Tooltip do usuário em hover */}
      {hoveredUser && (
        <div
          className="tooltip"
          style={{
            left: hoveredUser.x * scale + offset.x + 30,
            top: hoveredUser.y * scale + offset.y - 10
          }}
        >
          <strong>{hoveredUser.name}</strong>
          <br />
          <span style={{ fontSize: 11, opacity: 0.7 }}>
            {getStatusText(hoveredUser.status)}
            {hoveredUser.currentZone && ` • ${hoveredUser.currentZone.name}`}
          </span>
        </div>
      )}
    </div>
  )
}

function drawGrid(ctx, width, height) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
  ctx.lineWidth = 1

  const gridSize = 50
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}

function drawZone(ctx, zone) {
  const colors = {
    workstation: { fill: 'rgba(69, 183, 209, 0.1)', stroke: 'rgba(69, 183, 209, 0.3)' },
    meeting: { fill: 'rgba(255, 107, 107, 0.1)', stroke: 'rgba(255, 107, 107, 0.3)' },
    lounge: { fill: 'rgba(150, 206, 180, 0.1)', stroke: 'rgba(150, 206, 180, 0.3)' },
    open: { fill: 'rgba(255, 234, 167, 0.05)', stroke: 'rgba(255, 234, 167, 0.2)' }
  }

  const color = colors[zone.type] || colors.open

  // Fundo da zona
  ctx.fillStyle = color.fill
  ctx.fillRect(zone.x, zone.y, zone.width, zone.height)

  // Borda da zona
  ctx.strokeStyle = color.stroke
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.strokeRect(zone.x, zone.y, zone.width, zone.height)
  ctx.setLineDash([])

  // Nome da zona
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.font = '12px sans-serif'
  ctx.fillText(zone.name, zone.x + 10, zone.y + 20)

  // Ícone da zona
  const icons = {
    workstation: '💻',
    meeting: '🗣️',
    lounge: '☕',
    open: '🌟'
  }
  ctx.font = '16px sans-serif'
  ctx.fillText(icons[zone.type] || '', zone.x + zone.width - 30, zone.y + 25)
}

function drawProximityLines(ctx, group, users) {
  const groupUsers = users.filter(u => group.members.includes(u.id))

  if (groupUsers.length < 2) return

  ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)'
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])

  for (let i = 0; i < groupUsers.length; i++) {
    for (let j = i + 1; j < groupUsers.length; j++) {
      ctx.beginPath()
      ctx.moveTo(groupUsers[i].x, groupUsers[i].y)
      ctx.lineTo(groupUsers[j].x, groupUsers[j].y)
      ctx.stroke()
    }
  }

  ctx.setLineDash([])
}

function drawAvatar(ctx, user, isCurrentUser, isInProximity, isHovered) {
  const { x, y, avatar, name, status } = user

  // Círculo de proximidade (apenas para usuário atual)
  if (isCurrentUser) {
    ctx.beginPath()
    ctx.arc(x, y, PROXIMITY_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(102, 126, 234, 0.05)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.2)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Glow se em proximidade
  if (isInProximity) {
    ctx.beginPath()
    ctx.arc(x, y, AVATAR_SIZE / 2 + 8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)'
    ctx.fill()
  }

  // Sombra
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetY = 3

  // Avatar (círculo)
  ctx.beginPath()
  ctx.arc(x, y, AVATAR_SIZE / 2, 0, Math.PI * 2)
  ctx.fillStyle = avatar?.color || '#667eea'
  ctx.fill()

  // Borda se hover ou usuário atual
  if (isHovered || isCurrentUser) {
    ctx.strokeStyle = isCurrentUser ? '#fff' : 'rgba(255, 255, 255, 0.5)'
    ctx.lineWidth = isCurrentUser ? 3 : 2
    ctx.stroke()
  }

  // Resetar sombra
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // Emoji
  ctx.font = '20px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(avatar?.emoji || '😊', x, y)

  // Indicador de status
  const statusColors = {
    available: '#4ade80',
    focused: '#fbbf24',
    'in-meeting': '#f87171'
  }
  ctx.beginPath()
  ctx.arc(x + AVATAR_SIZE / 2 - 5, y - AVATAR_SIZE / 2 + 5, 6, 0, Math.PI * 2)
  ctx.fillStyle = statusColors[status] || '#4ade80'
  ctx.fill()
  ctx.strokeStyle = '#1a1a2e'
  ctx.lineWidth = 2
  ctx.stroke()

  // Nome
  ctx.fillStyle = '#fff'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(name, x, y + AVATAR_SIZE / 2 + 15)
}

function getStatusText(status) {
  switch (status) {
    case 'available': return 'Disponível'
    case 'focused': return 'Focado'
    case 'in-meeting': return 'Em reunião'
    default: return status
  }
}

export default Office
