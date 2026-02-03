/**
 * Isometric Avatar System
 *
 * Avatares estilo Habbo com 8 direções
 * Sistema de presença dinâmica - só aparece quem está conectado
 */

import { TILE_WIDTH, TILE_HEIGHT } from './IsometricEngine.js'

// Direções do avatar (em graus, 0 = norte)
export const DIRECTIONS = {
  N: 0,    // Norte
  NE: 1,   // Nordeste
  E: 2,    // Leste
  SE: 3,   // Sudeste
  S: 4,    // Sul
  SW: 5,   // Sudoeste
  W: 6,    // Oeste
  NW: 7    // Noroeste
}

// Configurações visuais
const AVATAR_CONFIG = {
  bodyWidth: 20,
  bodyHeight: 32,
  headRadius: 10,
  legHeight: 12,
  armLength: 10
}

// Cores de pele disponíveis
export const SKIN_COLORS = [
  '#FFDFC4', // Clara
  '#F0D5BE', // Clara média
  '#D1A684', // Média
  '#AA724B', // Bronzeada
  '#6F4F28', // Escura
  '#3D2314'  // Muito escura
]

// Cores de cabelo
export const HAIR_COLORS = [
  '#1a1a1a', // Preto
  '#4a3728', // Castanho escuro
  '#8b4513', // Castanho
  '#d4a76a', // Loiro escuro
  '#f4e04d', // Loiro
  '#ff6b35', // Ruivo
  '#9b59b6', // Roxo
  '#3498db', // Azul
  '#e74c3c', // Vermelho
  '#1abc9c'  // Verde água
]

// Estilos de cabelo
export const HAIR_STYLES = ['short', 'medium', 'long', 'spiky', 'bald', 'ponytail']

// Cores de roupa
export const SHIRT_COLORS = [
  '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#34495e', '#e91e63', '#00bcd4', '#ff5722'
]

export class Avatar {
  constructor(gridX, gridY, options = {}) {
    this.gridX = gridX
    this.gridY = gridY
    this.gridZ = 0

    // Posição visual (para animação suave)
    this.visualX = gridX
    this.visualY = gridY

    // Direção que o avatar está olhando
    this.direction = options.direction || DIRECTIONS.SE

    // Aparência
    this.skinColor = options.skinColor || SKIN_COLORS[0]
    this.hairColor = options.hairColor || HAIR_COLORS[0]
    this.hairStyle = options.hairStyle || 'short'
    this.shirtColor = options.shirtColor || SHIRT_COLORS[0]
    this.pantsColor = options.pantsColor || '#2c3e50'

    // Identificação
    this.id = options.id || Math.random().toString(36).substr(2, 9)
    this.name = options.name || 'Usuário'

    // Estado
    this.isMoving = false
    this.isSitting = false
    this.isWaving = false
    this.status = options.status || 'available'

    // === PRESENÇA DINÂMICA ===
    this.isSpawning = true        // Animação de entrada
    this.isDespawning = false     // Animação de saída
    this.spawnProgress = 0        // 0 a 1
    this.despawnProgress = 0      // 0 a 1
    this.opacity = 0              // Opacidade atual
    this.spawnParticles = []      // Partículas de spawn
    this.despawnCallback = null   // Callback quando despawn terminar

    // Gerar partículas de spawn
    this._generateSpawnParticles()

    // === VIDEO FRAME ===
    this.cameraEnabled = false    // Câmera ativa
    this.videoFrameGlow = 0       // Brilho do frame de vídeo

    // === SALA ATUAL ===
    this.currentRoom = null       // Zona onde está

    // Animação
    this.animationFrame = 0
    this.animationTimer = 0
    this.walkCycle = 0

    // Path para movimento
    this.path = []
    this.targetX = null
    this.targetY = null
    this.moveSpeed = 0.08

    // Idle animation
    this.idleTimer = 0
    this.idleBob = 0
  }

  _generateSpawnParticles() {
    this.spawnParticles = []
    for (let i = 0; i < 12; i++) {
      this.spawnParticles.push({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * -60,
        size: 2 + Math.random() * 4,
        speed: 0.5 + Math.random() * 1.5,
        opacity: 1,
        color: ['#667eea', '#764ba2', '#22c55e', '#fbbf24'][Math.floor(Math.random() * 4)]
      })
    }
  }

  update(deltaTime) {
    // === SPAWN ANIMATION ===
    if (this.isSpawning) {
      this.spawnProgress = Math.min(1, this.spawnProgress + 0.03)
      this.opacity = this.easeOutBack(this.spawnProgress)

      // Atualizar partículas
      for (const p of this.spawnParticles) {
        p.y -= p.speed
        p.opacity = Math.max(0, p.opacity - 0.02)
      }

      if (this.spawnProgress >= 1) {
        this.isSpawning = false
        this.opacity = 1
      }
      return
    }

    // === DESPAWN ANIMATION ===
    if (this.isDespawning) {
      this.despawnProgress = Math.min(1, this.despawnProgress + 0.04)
      this.opacity = 1 - this.easeInBack(this.despawnProgress)

      if (this.despawnProgress >= 1) {
        this.isDespawning = false
        this.opacity = 0
        if (this.despawnCallback) this.despawnCallback()
      }
      return
    }

    // Atualizar animação
    this.animationTimer += deltaTime
    if (this.animationTimer > 150) {
      this.animationTimer = 0
      this.animationFrame = (this.animationFrame + 1) % 4
      if (this.isMoving) {
        this.walkCycle = (this.walkCycle + 1) % 8
      }
    }

    // Idle bob animation
    this.idleTimer += deltaTime
    if (!this.isMoving) {
      this.idleBob = Math.sin(this.idleTimer / 800) * 1.5
    } else {
      this.idleBob = 0
    }

    // Video frame glow
    if (this.cameraEnabled) {
      this.videoFrameGlow = 0.6 + Math.sin(Date.now() / 1000) * 0.4
    }

    // Movimento suave em direção ao grid
    if (this.path.length > 0) {
      const target = this.path[0]
      const dx = target.x - this.visualX
      const dy = target.y - this.visualY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < this.moveSpeed) {
        this.visualX = target.x
        this.visualY = target.y
        this.gridX = target.x
        this.gridY = target.y
        this.path.shift()

        if (this.path.length === 0) {
          this.isMoving = false
        }
      } else {
        this.visualX += (dx / distance) * this.moveSpeed
        this.visualY += (dy / distance) * this.moveSpeed
        this.isMoving = true

        // Atualizar direção baseado no movimento
        this.direction = this.getDirectionFromDelta(dx, dy)
      }
    }
  }

  // Easing functions
  easeOutBack(t) {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  }

  easeInBack(t) {
    const c1 = 1.70158
    const c3 = c1 + 1
    return c3 * t * t * t - c1 * t * t
  }

  // Iniciar despawn (saída)
  despawn(callback) {
    this.isDespawning = true
    this.despawnProgress = 0
    this.despawnCallback = callback
    this._generateSpawnParticles()
  }

  getDirectionFromDelta(dx, dy) {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI)

    if (angle >= -22.5 && angle < 22.5) return DIRECTIONS.E
    if (angle >= 22.5 && angle < 67.5) return DIRECTIONS.SE
    if (angle >= 67.5 && angle < 112.5) return DIRECTIONS.S
    if (angle >= 112.5 && angle < 157.5) return DIRECTIONS.SW
    if (angle >= 157.5 || angle < -157.5) return DIRECTIONS.W
    if (angle >= -157.5 && angle < -112.5) return DIRECTIONS.NW
    if (angle >= -112.5 && angle < -67.5) return DIRECTIONS.N
    if (angle >= -67.5 && angle < -22.5) return DIRECTIONS.NE

    return DIRECTIONS.SE
  }

  setPath(path) {
    this.path = path
    if (path.length > 0) {
      this.isMoving = true
    }
  }

  moveTo(gridX, gridY) {
    this.path = [{ x: gridX, y: gridY }]
    this.isMoving = true
  }

  render(ctx, engine) {
    if (this.opacity <= 0) return

    const { x, y } = engine.gridToScreen(this.visualX, this.visualY, this.gridZ)
    const zoom = engine.zoom

    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity))

    // Escala de spawn (cresce de 0 para 1)
    const spawnScale = this.isSpawning ? this.easeOutBack(this.spawnProgress) : 1
    const despawnScale = this.isDespawning ? 1 - this.despawnProgress * 0.5 : 1
    const scale = spawnScale * despawnScale

    if (scale !== 1) {
      ctx.translate(x, y)
      ctx.scale(scale, scale)
      ctx.translate(-x, -y)
    }

    // Sombra
    this.renderShadow(ctx, x, y, zoom)

    // Corpo do avatar
    if (this.isSitting) {
      this.renderSitting(ctx, x, y + this.idleBob * zoom, zoom)
    } else {
      this.renderStanding(ctx, x, y + this.idleBob * zoom, zoom)
    }

    // Nome do usuário
    this.renderName(ctx, x, y, zoom)

    // Indicador de status
    this.renderStatusIndicator(ctx, x, y, zoom)

    // Video frame flutuante
    if (this.cameraEnabled) {
      this.renderVideoFrame(ctx, x, y, zoom)
    }

    // Partículas de spawn/despawn
    if (this.isSpawning || this.isDespawning) {
      this.renderSpawnParticles(ctx, x, y, zoom)
    }

    ctx.restore()
  }

  renderSpawnParticles(ctx, x, y, zoom) {
    for (const p of this.spawnParticles) {
      if (p.opacity <= 0) continue
      ctx.globalAlpha = p.opacity * this.opacity
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(x + p.x * zoom, y + p.y * zoom, p.size * zoom, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  renderVideoFrame(ctx, x, y, zoom) {
    const frameW = 50 * zoom
    const frameH = 35 * zoom
    const frameX = x - frameW / 2
    const frameY = y - 100 * zoom

    // Linha conectando ao avatar
    ctx.strokeStyle = `rgba(102, 126, 234, ${this.videoFrameGlow})`
    ctx.lineWidth = 1.5 * zoom
    ctx.setLineDash([4 * zoom, 4 * zoom])
    ctx.beginPath()
    ctx.moveTo(x, y - 65 * zoom)
    ctx.lineTo(x, frameY + frameH)
    ctx.stroke()
    ctx.setLineDash([])

    // Sombra do frame
    ctx.shadowColor = 'rgba(102, 126, 234, 0.5)'
    ctx.shadowBlur = 10 * zoom

    // Frame background
    ctx.fillStyle = '#1a1a2e'
    ctx.beginPath()
    ctx.roundRect(frameX, frameY, frameW, frameH, 4 * zoom)
    ctx.fill()

    ctx.shadowBlur = 0

    // Borda brilhante
    ctx.strokeStyle = `rgba(102, 126, 234, ${this.videoFrameGlow})`
    ctx.lineWidth = 2 * zoom
    ctx.beginPath()
    ctx.roundRect(frameX, frameY, frameW, frameH, 4 * zoom)
    ctx.stroke()

    // Ícone de câmera
    ctx.fillStyle = '#667eea'
    const iconSize = 8 * zoom
    ctx.beginPath()
    ctx.roundRect(x - iconSize / 2 - 2 * zoom, frameY + frameH / 2 - iconSize / 2, iconSize, iconSize * 0.7, 2 * zoom)
    ctx.fill()
    // Lente
    ctx.beginPath()
    ctx.moveTo(x + iconSize / 2 - 2 * zoom, frameY + frameH / 2 - 3 * zoom)
    ctx.lineTo(x + iconSize / 2 + 3 * zoom, frameY + frameH / 2 - 5 * zoom)
    ctx.lineTo(x + iconSize / 2 + 3 * zoom, frameY + frameH / 2 + 5 * zoom)
    ctx.lineTo(x + iconSize / 2 - 2 * zoom, frameY + frameH / 2 + 3 * zoom)
    ctx.fill()

    // Nome no frame
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = `${7 * zoom}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(this.name, x, frameY + frameH - 3 * zoom)

    // Indicador "LIVE"
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(frameX + 6 * zoom, frameY + 6 * zoom, 3 * zoom, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${5 * zoom}px Arial`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('LIVE', frameX + 11 * zoom, frameY + 3 * zoom)
  }

  renderShadow(ctx, x, y, zoom) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(x, y + 5 * zoom, 12 * zoom, 6 * zoom, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  renderStanding(ctx, x, y, zoom) {
    const config = AVATAR_CONFIG
    const scale = zoom * 0.8

    // Offset vertical para o avatar ficar "em pé" sobre o tile
    const baseY = y - 20 * zoom

    // Animação de caminhada
    const walkOffset = this.isMoving ? Math.sin(this.walkCycle * Math.PI / 4) * 2 * zoom : 0
    const legOffset = this.isMoving ? Math.sin(this.walkCycle * Math.PI / 4) * 3 * zoom : 0

    // Determinar se está virado para esquerda ou direita
    const facingRight = [DIRECTIONS.E, DIRECTIONS.NE, DIRECTIONS.SE].includes(this.direction)
    const facingFront = [DIRECTIONS.S, DIRECTIONS.SE, DIRECTIONS.SW].includes(this.direction)
    const facingBack = [DIRECTIONS.N, DIRECTIONS.NE, DIRECTIONS.NW].includes(this.direction)

    // === PERNAS ===
    ctx.fillStyle = this.pantsColor

    // Perna esquerda
    ctx.beginPath()
    ctx.roundRect(
      x - 6 * scale + (facingRight ? 0 : -2 * scale),
      baseY + 10 * scale - walkOffset,
      5 * scale,
      config.legHeight * scale + legOffset,
      2 * scale
    )
    ctx.fill()

    // Perna direita
    ctx.beginPath()
    ctx.roundRect(
      x + 1 * scale + (facingRight ? 2 * scale : 0),
      baseY + 10 * scale + walkOffset,
      5 * scale,
      config.legHeight * scale - legOffset,
      2 * scale
    )
    ctx.fill()

    // === SAPATOS ===
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.ellipse(x - 4 * scale, baseY + 22 * scale - walkOffset, 4 * scale, 2 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + 4 * scale, baseY + 22 * scale + walkOffset, 4 * scale, 2 * scale, 0, 0, Math.PI * 2)
    ctx.fill()

    // === CORPO (TORSO) ===
    ctx.fillStyle = this.shirtColor

    // Torso principal
    ctx.beginPath()
    ctx.roundRect(
      x - 8 * scale,
      baseY - 8 * scale,
      16 * scale,
      20 * scale,
      3 * scale
    )
    ctx.fill()

    // Detalhes da camisa
    ctx.fillStyle = this.adjustColor(this.shirtColor, -20)
    ctx.beginPath()
    ctx.moveTo(x, baseY - 5 * scale)
    ctx.lineTo(x - 2 * scale, baseY + 10 * scale)
    ctx.lineTo(x + 2 * scale, baseY + 10 * scale)
    ctx.closePath()
    ctx.fill()

    // === BRAÇOS ===
    const armSwing = this.isMoving ? Math.sin(this.walkCycle * Math.PI / 4) * 4 * zoom : 0

    ctx.fillStyle = this.skinColor

    // Braço esquerdo
    ctx.beginPath()
    ctx.roundRect(
      x - 12 * scale,
      baseY - 5 * scale + armSwing,
      4 * scale,
      14 * scale,
      2 * scale
    )
    ctx.fill()

    // Braço direito
    ctx.beginPath()
    ctx.roundRect(
      x + 8 * scale,
      baseY - 5 * scale - armSwing,
      4 * scale,
      14 * scale,
      2 * scale
    )
    ctx.fill()

    // === CABEÇA ===
    // Pescoço
    ctx.fillStyle = this.skinColor
    ctx.beginPath()
    ctx.roundRect(x - 3 * scale, baseY - 12 * scale, 6 * scale, 6 * scale, 1 * scale)
    ctx.fill()

    // Cabeça
    ctx.beginPath()
    ctx.arc(x, baseY - 20 * scale, config.headRadius * scale, 0, Math.PI * 2)
    ctx.fill()

    // === ROSTO ===
    if (!facingBack) {
      // Olhos
      ctx.fillStyle = '#fff'
      const eyeOffsetX = facingRight ? 2 * scale : -2 * scale

      ctx.beginPath()
      ctx.ellipse(x - 3 * scale + eyeOffsetX, baseY - 21 * scale, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x + 3 * scale + eyeOffsetX, baseY - 21 * scale, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2)
      ctx.fill()

      // Pupilas
      ctx.fillStyle = '#1a1a1a'
      const pupilOffset = facingRight ? 0.5 * scale : -0.5 * scale
      ctx.beginPath()
      ctx.arc(x - 3 * scale + eyeOffsetX + pupilOffset, baseY - 21 * scale, 1 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(x + 3 * scale + eyeOffsetX + pupilOffset, baseY - 21 * scale, 1 * scale, 0, Math.PI * 2)
      ctx.fill()

      // Boca
      ctx.strokeStyle = this.adjustColor(this.skinColor, -40)
      ctx.lineWidth = 1 * scale
      ctx.beginPath()
      ctx.arc(x + eyeOffsetX * 0.5, baseY - 16 * scale, 2 * scale, 0.1 * Math.PI, 0.9 * Math.PI)
      ctx.stroke()
    }

    // === CABELO ===
    this.renderHair(ctx, x, baseY - 20 * scale, scale, facingRight, facingBack)

    // Animação de acenar
    if (this.isWaving) {
      this.renderWavingArm(ctx, x, baseY, scale, facingRight)
    }
  }

  renderHair(ctx, x, headY, scale, facingRight, facingBack) {
    ctx.fillStyle = this.hairColor

    switch (this.hairStyle) {
      case 'short':
        ctx.beginPath()
        ctx.arc(x, headY - 2 * scale, 11 * scale, Math.PI, 2 * Math.PI)
        ctx.fill()
        if (!facingBack) {
          ctx.beginPath()
          ctx.ellipse(x + (facingRight ? 3 : -3) * scale, headY - 6 * scale, 6 * scale, 3 * scale, facingRight ? 0.2 : -0.2, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case 'medium':
        ctx.beginPath()
        ctx.arc(x, headY, 12 * scale, Math.PI * 0.8, Math.PI * 2.2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(x - 8 * scale, headY + 3 * scale, 4 * scale, 8 * scale, -0.3, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(x + 8 * scale, headY + 3 * scale, 4 * scale, 8 * scale, 0.3, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'long':
        ctx.beginPath()
        ctx.arc(x, headY, 12 * scale, Math.PI * 0.7, Math.PI * 2.3)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(x - 11 * scale, headY)
        ctx.quadraticCurveTo(x - 13 * scale, headY + 20 * scale, x - 8 * scale, headY + 25 * scale)
        ctx.lineTo(x - 5 * scale, headY + 20 * scale)
        ctx.quadraticCurveTo(x - 8 * scale, headY + 10 * scale, x - 8 * scale, headY)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(x + 11 * scale, headY)
        ctx.quadraticCurveTo(x + 13 * scale, headY + 20 * scale, x + 8 * scale, headY + 25 * scale)
        ctx.lineTo(x + 5 * scale, headY + 20 * scale)
        ctx.quadraticCurveTo(x + 8 * scale, headY + 10 * scale, x + 8 * scale, headY)
        ctx.fill()
        break

      case 'spiky':
        const spikes = 7
        for (let i = 0; i < spikes; i++) {
          const angle = (Math.PI / (spikes - 1)) * i + Math.PI
          const spikeLength = (8 + Math.random() * 6) * scale
          ctx.beginPath()
          ctx.moveTo(
            x + Math.cos(angle) * 8 * scale,
            headY + Math.sin(angle) * 8 * scale
          )
          ctx.lineTo(
            x + Math.cos(angle - 0.2) * spikeLength,
            headY + Math.sin(angle - 0.2) * spikeLength - 5 * scale
          )
          ctx.lineTo(
            x + Math.cos(angle + 0.2) * spikeLength,
            headY + Math.sin(angle + 0.2) * spikeLength - 5 * scale
          )
          ctx.closePath()
          ctx.fill()
        }
        break

      case 'ponytail':
        ctx.beginPath()
        ctx.arc(x, headY - 2 * scale, 11 * scale, Math.PI, 2 * Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(x, headY - 10 * scale)
        ctx.quadraticCurveTo(x + 15 * scale, headY - 5 * scale, x + 12 * scale, headY + 15 * scale)
        ctx.quadraticCurveTo(x + 8 * scale, headY + 10 * scale, x + 5 * scale, headY - 5 * scale)
        ctx.fill()
        ctx.fillStyle = '#e74c3c'
        ctx.beginPath()
        ctx.ellipse(x + 3 * scale, headY - 8 * scale, 3 * scale, 2 * scale, 0.5, 0, Math.PI * 2)
        ctx.fill()
        break

      case 'bald':
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.beginPath()
        ctx.ellipse(x - 3 * scale, headY - 5 * scale, 3 * scale, 2 * scale, -0.5, 0, Math.PI * 2)
        ctx.fill()
        break
    }
  }

  renderWavingArm(ctx, x, baseY, scale, facingRight) {
    const waveAngle = Math.sin(Date.now() / 100) * 0.3

    ctx.fillStyle = this.skinColor
    ctx.save()
    ctx.translate(x + (facingRight ? 10 : -10) * scale, baseY - 5 * scale)
    ctx.rotate(-Math.PI / 4 + waveAngle)
    ctx.beginPath()
    ctx.roundRect(-2 * scale, -14 * scale, 4 * scale, 14 * scale, 2 * scale)
    ctx.fill()
    ctx.restore()
  }

  renderSitting(ctx, x, y, zoom) {
    const config = AVATAR_CONFIG
    const scale = zoom * 0.8
    const baseY = y - 10 * zoom

    ctx.fillStyle = this.pantsColor
    ctx.beginPath()
    ctx.roundRect(x - 8 * scale, baseY + 5 * scale, 16 * scale, 6 * scale, 2 * scale)
    ctx.fill()

    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.ellipse(x - 6 * scale, baseY + 12 * scale, 4 * scale, 2 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + 6 * scale, baseY + 12 * scale, 4 * scale, 2 * scale, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = this.shirtColor
    ctx.beginPath()
    ctx.roundRect(x - 8 * scale, baseY - 12 * scale, 16 * scale, 18 * scale, 3 * scale)
    ctx.fill()

    ctx.fillStyle = this.skinColor
    ctx.beginPath()
    ctx.roundRect(x - 12 * scale, baseY - 2 * scale, 4 * scale, 10 * scale, 2 * scale)
    ctx.fill()
    ctx.beginPath()
    ctx.roundRect(x + 8 * scale, baseY - 2 * scale, 4 * scale, 10 * scale, 2 * scale)
    ctx.fill()

    ctx.fillStyle = this.skinColor
    ctx.beginPath()
    ctx.arc(x, baseY - 22 * scale, config.headRadius * scale, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(x - 3 * scale, baseY - 23 * scale, 2 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + 3 * scale, baseY - 23 * scale, 2 * scale, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = this.hairColor
    ctx.beginPath()
    ctx.arc(x, baseY - 24 * scale, 11 * scale, Math.PI, 2 * Math.PI)
    ctx.fill()
  }

  renderName(ctx, x, y, zoom) {
    const nameY = y - 55 * zoom

    ctx.font = `bold ${11 * zoom}px Arial`
    const textWidth = ctx.measureText(this.name).width

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.beginPath()
    ctx.roundRect(x - textWidth / 2 - 6 * zoom, nameY - 8 * zoom, textWidth + 12 * zoom, 16 * zoom, 4 * zoom)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.name, x, nameY)
  }

  renderStatusIndicator(ctx, x, y, zoom) {
    const indicatorY = y - 65 * zoom

    const statusColors = {
      available: '#22c55e',
      focused: '#f59e0b',
      'in-meeting': '#ef4444',
      busy: '#ef4444',
      collaborating: '#8b5cf6',
      away: '#6b7280',
      private: '#ec4899',
      urgent: '#dc2626'
    }

    const color = statusColors[this.status] || statusColors.available

    // Círculo de status
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, indicatorY, 4 * zoom, 0, Math.PI * 2)
    ctx.fill()

    // Borda branca
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5 * zoom
    ctx.stroke()
  }

  // Método para iniciar aceno
  wave() {
    this.isWaving = true
    setTimeout(() => {
      this.isWaving = false
    }, 2000)
  }

  sit() {
    this.isSitting = true
  }

  stand() {
    this.isSitting = false
  }

  toggleCamera() {
    this.cameraEnabled = !this.cameraEnabled
    return this.cameraEnabled
  }

  adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }
}
