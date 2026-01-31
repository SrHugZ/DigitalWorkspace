/**
 * Isometric Furniture System
 *
 * Móveis e objetos decorativos do escritório
 */

import { TILE_WIDTH, TILE_HEIGHT, drawIsoCube } from './IsometricEngine.js'

export const FURNITURE_TYPES = {
  DESK: 'desk',
  CHAIR: 'chair',
  SOFA: 'sofa',
  PLANT: 'plant',
  PLANT_LARGE: 'plant_large',
  COMPUTER: 'computer',
  BOOKSHELF: 'bookshelf',
  TABLE_ROUND: 'table_round',
  TABLE_MEETING: 'table_meeting',
  LAMP: 'lamp',
  COFFEE_MACHINE: 'coffee_machine',
  WATER_COOLER: 'water_cooler',
  WHITEBOARD: 'whiteboard',
  TV: 'tv',
  COUCH: 'couch',
  ARMCHAIR: 'armchair',
  RUG: 'rug',
  TRASH_BIN: 'trash_bin',
  FILING_CABINET: 'filing_cabinet'
}

export class Furniture {
  constructor(gridX, gridY, type, options = {}) {
    this.gridX = gridX
    this.gridY = gridY
    this.gridZ = options.gridZ || 0
    this.type = type
    this.rotation = options.rotation || 0 // 0, 90, 180, 270
    this.color = options.color || null
    this.occupied = false
    this.occupiedBy = null
  }

  render(ctx, engine) {
    const { x, y } = engine.gridToScreen(this.gridX, this.gridY, this.gridZ)
    const zoom = engine.zoom

    ctx.save()

    switch (this.type) {
      case FURNITURE_TYPES.DESK:
        this.renderDesk(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.CHAIR:
        this.renderChair(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.SOFA:
        this.renderSofa(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.PLANT:
        this.renderPlant(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.PLANT_LARGE:
        this.renderLargePlant(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.COMPUTER:
        this.renderComputer(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.BOOKSHELF:
        this.renderBookshelf(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.TABLE_ROUND:
        this.renderRoundTable(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.TABLE_MEETING:
        this.renderMeetingTable(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.LAMP:
        this.renderLamp(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.COFFEE_MACHINE:
        this.renderCoffeeMachine(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.WHITEBOARD:
        this.renderWhiteboard(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.TV:
        this.renderTV(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.COUCH:
        this.renderCouch(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.ARMCHAIR:
        this.renderArmchair(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.RUG:
        this.renderRug(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.FILING_CABINET:
        this.renderFilingCabinet(ctx, x, y, zoom)
        break
      case FURNITURE_TYPES.WATER_COOLER:
        this.renderWaterCooler(ctx, x, y, zoom)
        break
      default:
        this.renderGenericFurniture(ctx, x, y, zoom)
    }

    ctx.restore()
  }

  renderDesk(ctx, x, y, zoom) {
    const w = 50 * zoom
    const h = 25 * zoom
    const depth = 28 * zoom

    // Tampo da mesa
    drawIsoCube(ctx, x, y, w, h, depth, '#8B4513', '#6B3410', '#7A3D11')

    // Pernas
    const legW = 6 * zoom
    const legH = 3 * zoom
    const legDepth = 20 * zoom

    // Perna esquerda traseira
    drawIsoCube(ctx, x - w * 0.35, y - h * 0.2, legW, legH, legDepth, '#5D2E0C', '#4A2409', '#533010')
    // Perna direita traseira
    drawIsoCube(ctx, x + w * 0.35, y - h * 0.2, legW, legH, legDepth, '#5D2E0C', '#4A2409', '#533010')
    // Perna esquerda frontal
    drawIsoCube(ctx, x - w * 0.35, y + h * 0.3, legW, legH, legDepth, '#5D2E0C', '#4A2409', '#533010')
    // Perna direita frontal
    drawIsoCube(ctx, x + w * 0.35, y + h * 0.3, legW, legH, legDepth, '#5D2E0C', '#4A2409', '#533010')
  }

  renderChair(ctx, x, y, zoom) {
    const color = this.color || '#2563eb'
    const darkColor = this.adjustColor(color, -30)
    const lighterColor = this.adjustColor(color, 20)

    // Assento
    const seatW = 24 * zoom
    const seatH = 12 * zoom
    const seatDepth = 6 * zoom

    drawIsoCube(ctx, x, y, seatW, seatH, seatDepth + 15 * zoom, lighterColor, color, darkColor)

    // Encosto
    const backW = 24 * zoom
    const backH = 4 * zoom
    const backDepth = 25 * zoom

    drawIsoCube(ctx, x, y - seatH * 0.8, backW, backH, backDepth + 20 * zoom, lighterColor, color, darkColor)

    // Pernas
    ctx.fillStyle = '#333'
    const legPositions = [
      { dx: -8, dy: -4 },
      { dx: 8, dy: -4 },
      { dx: -8, dy: 4 },
      { dx: 8, dy: 4 }
    ]
    for (const pos of legPositions) {
      ctx.beginPath()
      ctx.arc(x + pos.dx * zoom, y + pos.dy * zoom + 8 * zoom, 2 * zoom, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  renderSofa(ctx, x, y, zoom) {
    const color = this.color || '#ef4444'
    const darkColor = this.adjustColor(color, -30)
    const lighterColor = this.adjustColor(color, 20)

    // Base do sofá
    const baseW = 70 * zoom
    const baseH = 35 * zoom
    const baseDepth = 15 * zoom

    drawIsoCube(ctx, x, y, baseW, baseH, baseDepth, lighterColor, color, darkColor)

    // Encosto
    const backW = 70 * zoom
    const backH = 10 * zoom
    const backDepth = 25 * zoom

    drawIsoCube(ctx, x, y - baseH * 0.6, backW, backH, backDepth + 10 * zoom, lighterColor, color, darkColor)

    // Braços
    const armW = 10 * zoom
    const armH = 30 * zoom
    const armDepth = 20 * zoom

    // Braço esquerdo
    drawIsoCube(ctx, x - baseW * 0.4, y, armW, armH, armDepth, lighterColor, color, darkColor)
    // Braço direito
    drawIsoCube(ctx, x + baseW * 0.4, y, armW, armH, armDepth, lighterColor, color, darkColor)

    // Almofadas
    ctx.fillStyle = this.adjustColor(color, 10)
    for (let i = 0; i < 3; i++) {
      const cushionX = x + (i - 1) * 20 * zoom
      ctx.beginPath()
      ctx.ellipse(cushionX, y - 5 * zoom, 8 * zoom, 4 * zoom, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  renderPlant(ctx, x, y, zoom) {
    // Vaso
    const potW = 16 * zoom
    const potH = 8 * zoom
    const potDepth = 14 * zoom

    drawIsoCube(ctx, x, y, potW, potH, potDepth, '#d97706', '#b45309', '#c2410c')

    // Folhagem
    ctx.fillStyle = '#22c55e'
    const leafPositions = [
      { dx: 0, dy: -20, r: 8 },
      { dx: -6, dy: -16, r: 6 },
      { dx: 6, dy: -16, r: 6 },
      { dx: -4, dy: -24, r: 5 },
      { dx: 4, dy: -24, r: 5 },
      { dx: 0, dy: -28, r: 4 }
    ]

    for (const leaf of leafPositions) {
      ctx.beginPath()
      ctx.arc(x + leaf.dx * zoom, y + leaf.dy * zoom, leaf.r * zoom, 0, Math.PI * 2)
      ctx.fill()
    }

    // Detalhes das folhas
    ctx.fillStyle = '#16a34a'
    ctx.beginPath()
    ctx.arc(x, y - 22 * zoom, 5 * zoom, 0, Math.PI * 2)
    ctx.fill()
  }

  renderLargePlant(ctx, x, y, zoom) {
    // Vaso grande
    const potW = 24 * zoom
    const potH = 12 * zoom
    const potDepth = 20 * zoom

    drawIsoCube(ctx, x, y, potW, potH, potDepth, '#78350f', '#5c2b0a', '#6b3410')

    // Tronco
    ctx.fillStyle = '#7c3aed'
    ctx.fillStyle = '#92400e'
    ctx.beginPath()
    ctx.moveTo(x - 3 * zoom, y - 20 * zoom)
    ctx.lineTo(x + 3 * zoom, y - 20 * zoom)
    ctx.lineTo(x + 2 * zoom, y - 50 * zoom)
    ctx.lineTo(x - 2 * zoom, y - 50 * zoom)
    ctx.closePath()
    ctx.fill()

    // Copa da árvore
    const leafColors = ['#22c55e', '#16a34a', '#15803d', '#14532d']
    const leaves = [
      { dx: 0, dy: -55, r: 15 },
      { dx: -12, dy: -45, r: 12 },
      { dx: 12, dy: -45, r: 12 },
      { dx: -8, dy: -60, r: 10 },
      { dx: 8, dy: -60, r: 10 },
      { dx: 0, dy: -68, r: 8 }
    ]

    leaves.forEach((leaf, i) => {
      ctx.fillStyle = leafColors[i % leafColors.length]
      ctx.beginPath()
      ctx.arc(x + leaf.dx * zoom, y + leaf.dy * zoom, leaf.r * zoom, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  renderComputer(ctx, x, y, zoom) {
    // Monitor
    const monW = 28 * zoom
    const monH = 6 * zoom
    const monDepth = 22 * zoom

    // Tela
    ctx.fillStyle = '#1f2937'
    drawIsoCube(ctx, x, y - 10 * zoom, monW, monH, monDepth, '#374151', '#1f2937', '#111827')

    // Tela iluminada
    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'
    ctx.beginPath()
    ctx.moveTo(x - monW * 0.35, y - 10 * zoom - monDepth + 3 * zoom)
    ctx.lineTo(x + monW * 0.1, y - 10 * zoom - monH * 0.3 - monDepth + 3 * zoom)
    ctx.lineTo(x + monW * 0.1, y - 10 * zoom - monH * 0.3 - 5 * zoom)
    ctx.lineTo(x - monW * 0.35, y - 10 * zoom - 5 * zoom)
    ctx.closePath()
    ctx.fill()

    // Base do monitor
    drawIsoCube(ctx, x, y - 3 * zoom, 8 * zoom, 4 * zoom, 6 * zoom, '#4b5563', '#374151', '#1f2937')

    // Teclado
    drawIsoCube(ctx, x, y + 8 * zoom, 22 * zoom, 8 * zoom, 2 * zoom, '#6b7280', '#4b5563', '#374151')
  }

  renderBookshelf(ctx, x, y, zoom) {
    const w = 40 * zoom
    const h = 20 * zoom
    const depth = 60 * zoom

    // Estrutura
    drawIsoCube(ctx, x, y, w, h, depth, '#92400e', '#78350f', '#713f12')

    // Prateleiras e livros
    const bookColors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899']
    const shelves = [15, 30, 45]

    for (const shelfY of shelves) {
      // Prateleira
      drawIsoCube(ctx, x, y, w - 4 * zoom, h - 2 * zoom, 2 * zoom + (depth - shelfY * zoom), '#a16207', '#854d0e', '#713f12')

      // Livros
      for (let i = 0; i < 4; i++) {
        const bookX = x + (i - 1.5) * 8 * zoom
        const bookColor = bookColors[(i + shelves.indexOf(shelfY)) % bookColors.length]
        drawIsoCube(ctx, bookX, y, 6 * zoom, h - 6 * zoom, 12 * zoom + (depth - shelfY * zoom - 5 * zoom),
          bookColor, this.adjustColor(bookColor, -20), this.adjustColor(bookColor, -40))
      }
    }
  }

  renderRoundTable(ctx, x, y, zoom) {
    // Tampo circular (representado como elipse isométrica)
    const radius = 20 * zoom
    const tableHeight = 25 * zoom

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.beginPath()
    ctx.ellipse(x + 3 * zoom, y + 3 * zoom, radius, radius / 2, 0, 0, Math.PI * 2)
    ctx.fill()

    // Pé da mesa
    ctx.fillStyle = '#5c4033'
    ctx.beginPath()
    ctx.moveTo(x - 4 * zoom, y)
    ctx.lineTo(x + 4 * zoom, y)
    ctx.lineTo(x + 3 * zoom, y - tableHeight)
    ctx.lineTo(x - 3 * zoom, y - tableHeight)
    ctx.closePath()
    ctx.fill()

    // Tampo
    ctx.fillStyle = '#8B4513'
    ctx.beginPath()
    ctx.ellipse(x, y - tableHeight, radius, radius / 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#5D2E0C'
    ctx.lineWidth = 2 * zoom
    ctx.stroke()
  }

  renderMeetingTable(ctx, x, y, zoom) {
    const w = 80 * zoom
    const h = 40 * zoom
    const depth = 25 * zoom

    // Tampo
    drawIsoCube(ctx, x, y, w, h, depth, '#4a4a4a', '#333333', '#2a2a2a')

    // Pernas
    const legW = 6 * zoom
    const legH = 3 * zoom
    const legDepth = 20 * zoom
    const positions = [
      { dx: -0.38, dy: -0.35 },
      { dx: 0.38, dy: -0.35 },
      { dx: -0.38, dy: 0.35 },
      { dx: 0.38, dy: 0.35 }
    ]

    for (const pos of positions) {
      drawIsoCube(ctx, x + w * pos.dx, y + h * pos.dy, legW, legH, legDepth, '#333', '#222', '#1a1a1a')
    }
  }

  renderLamp(ctx, x, y, zoom) {
    // Base
    ctx.fillStyle = '#374151'
    ctx.beginPath()
    ctx.ellipse(x, y, 8 * zoom, 4 * zoom, 0, 0, Math.PI * 2)
    ctx.fill()

    // Poste
    ctx.strokeStyle = '#4b5563'
    ctx.lineWidth = 3 * zoom
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y - 50 * zoom)
    ctx.stroke()

    // Cúpula da lâmpada
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.moveTo(x - 12 * zoom, y - 45 * zoom)
    ctx.quadraticCurveTo(x, y - 60 * zoom, x + 12 * zoom, y - 45 * zoom)
    ctx.lineTo(x + 8 * zoom, y - 40 * zoom)
    ctx.quadraticCurveTo(x, y - 48 * zoom, x - 8 * zoom, y - 40 * zoom)
    ctx.closePath()
    ctx.fill()

    // Luz (glow)
    const gradient = ctx.createRadialGradient(x, y - 35 * zoom, 0, x, y - 35 * zoom, 30 * zoom)
    gradient.addColorStop(0, 'rgba(251, 191, 36, 0.3)')
    gradient.addColorStop(1, 'rgba(251, 191, 36, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y - 35 * zoom, 30 * zoom, 0, Math.PI * 2)
    ctx.fill()
  }

  renderCoffeeMachine(ctx, x, y, zoom) {
    // Base
    drawIsoCube(ctx, x, y, 20 * zoom, 10 * zoom, 30 * zoom, '#2d3748', '#1a202c', '#171923')

    // Parte superior
    drawIsoCube(ctx, x, y - 5 * zoom, 18 * zoom, 9 * zoom, 15 * zoom, '#4a5568', '#2d3748', '#1a202c')

    // Display
    ctx.fillStyle = '#68d391'
    ctx.fillRect(x - 6 * zoom, y - 35 * zoom, 12 * zoom, 6 * zoom)

    // Botões
    ctx.fillStyle = '#e53e3e'
    ctx.beginPath()
    ctx.arc(x + 5 * zoom, y - 25 * zoom, 2 * zoom, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#48bb78'
    ctx.beginPath()
    ctx.arc(x - 5 * zoom, y - 25 * zoom, 2 * zoom, 0, Math.PI * 2)
    ctx.fill()
  }

  renderWhiteboard(ctx, x, y, zoom) {
    const w = 60 * zoom
    const h = 6 * zoom
    const depth = 45 * zoom

    // Quadro
    ctx.fillStyle = '#f3f4f6'
    ctx.beginPath()
    ctx.moveTo(x - w / 2, y - depth)
    ctx.lineTo(x + w / 4, y - h / 2 - depth)
    ctx.lineTo(x + w / 4, y - h / 2)
    ctx.lineTo(x - w / 2, y)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 2 * zoom
    ctx.stroke()

    // Rabiscos
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 1 * zoom
    ctx.beginPath()
    ctx.moveTo(x - w * 0.3, y - depth * 0.7)
    ctx.lineTo(x, y - depth * 0.5)
    ctx.lineTo(x - w * 0.1, y - depth * 0.3)
    ctx.stroke()

    ctx.strokeStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(x - w * 0.2, y - depth * 0.5, 8 * zoom, 0, Math.PI * 2)
    ctx.stroke()
  }

  renderTV(ctx, x, y, zoom) {
    const w = 50 * zoom
    const h = 6 * zoom
    const depth = 30 * zoom

    // Tela
    drawIsoCube(ctx, x, y, w, h, depth, '#1f2937', '#111827', '#0f172a')

    // Tela iluminada
    ctx.fillStyle = 'rgba(59, 130, 246, 0.6)'
    ctx.beginPath()
    ctx.moveTo(x - w * 0.4, y - depth + 4 * zoom)
    ctx.lineTo(x + w * 0.15, y - h * 0.4 - depth + 4 * zoom)
    ctx.lineTo(x + w * 0.15, y - h * 0.4 - 4 * zoom)
    ctx.lineTo(x - w * 0.4, y - 4 * zoom)
    ctx.closePath()
    ctx.fill()

    // Suporte
    ctx.fillStyle = '#374151'
    ctx.beginPath()
    ctx.moveTo(x - 3 * zoom, y + 2 * zoom)
    ctx.lineTo(x + 3 * zoom, y + 2 * zoom)
    ctx.lineTo(x + 8 * zoom, y + 8 * zoom)
    ctx.lineTo(x - 8 * zoom, y + 8 * zoom)
    ctx.closePath()
    ctx.fill()
  }

  renderCouch(ctx, x, y, zoom) {
    const color = this.color || '#1e40af'
    const darkColor = this.adjustColor(color, -30)
    const lighterColor = this.adjustColor(color, 20)

    // Estrutura principal
    drawIsoCube(ctx, x, y, 90 * zoom, 45 * zoom, 20 * zoom, lighterColor, color, darkColor)

    // Encosto mais alto
    drawIsoCube(ctx, x, y - 20 * zoom, 90 * zoom, 12 * zoom, 35 * zoom, lighterColor, color, darkColor)

    // Braços
    drawIsoCube(ctx, x - 38 * zoom, y, 14 * zoom, 40 * zoom, 28 * zoom, lighterColor, color, darkColor)
    drawIsoCube(ctx, x + 38 * zoom, y, 14 * zoom, 40 * zoom, 28 * zoom, lighterColor, color, darkColor)

    // Almofadas do assento
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = this.adjustColor(color, 15)
      ctx.beginPath()
      ctx.ellipse(x + (i - 1) * 25 * zoom, y - 8 * zoom, 10 * zoom, 5 * zoom, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  renderArmchair(ctx, x, y, zoom) {
    const color = this.color || '#065f46'
    const darkColor = this.adjustColor(color, -30)
    const lighterColor = this.adjustColor(color, 20)

    // Assento
    drawIsoCube(ctx, x, y, 35 * zoom, 30 * zoom, 18 * zoom, lighterColor, color, darkColor)

    // Encosto
    drawIsoCube(ctx, x, y - 15 * zoom, 35 * zoom, 10 * zoom, 32 * zoom, lighterColor, color, darkColor)

    // Braços
    drawIsoCube(ctx, x - 15 * zoom, y, 8 * zoom, 28 * zoom, 25 * zoom, lighterColor, color, darkColor)
    drawIsoCube(ctx, x + 15 * zoom, y, 8 * zoom, 28 * zoom, 25 * zoom, lighterColor, color, darkColor)
  }

  renderRug(ctx, x, y, zoom) {
    const color = this.color || '#7c3aed'
    const w = 80 * zoom
    const h = 40 * zoom

    // Tapete (losango achatado)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(x, y - h / 2)
    ctx.lineTo(x + w / 2, y)
    ctx.lineTo(x, y + h / 2)
    ctx.lineTo(x - w / 2, y)
    ctx.closePath()
    ctx.fill()

    // Borda decorativa
    ctx.strokeStyle = this.adjustColor(color, 30)
    ctx.lineWidth = 3 * zoom
    ctx.stroke()

    // Padrão central
    ctx.strokeStyle = this.adjustColor(color, 40)
    ctx.lineWidth = 1 * zoom
    ctx.beginPath()
    ctx.moveTo(x, y - h / 4)
    ctx.lineTo(x + w / 4, y)
    ctx.lineTo(x, y + h / 4)
    ctx.lineTo(x - w / 4, y)
    ctx.closePath()
    ctx.stroke()
  }

  renderFilingCabinet(ctx, x, y, zoom) {
    // Gabinete
    drawIsoCube(ctx, x, y, 22 * zoom, 18 * zoom, 45 * zoom, '#6b7280', '#4b5563', '#374151')

    // Gavetas
    for (let i = 0; i < 3; i++) {
      const drawerY = y - (i * 12 + 5) * zoom
      ctx.fillStyle = '#9ca3af'
      ctx.fillRect(x - 8 * zoom, drawerY - 8 * zoom, 16 * zoom, 10 * zoom)

      // Puxador
      ctx.fillStyle = '#d1d5db'
      ctx.fillRect(x - 3 * zoom, drawerY - 5 * zoom, 6 * zoom, 3 * zoom)
    }
  }

  renderWaterCooler(ctx, x, y, zoom) {
    // Base
    drawIsoCube(ctx, x, y, 18 * zoom, 14 * zoom, 35 * zoom, '#e5e7eb', '#d1d5db', '#9ca3af')

    // Galão de água
    ctx.fillStyle = 'rgba(59, 130, 246, 0.5)'
    ctx.beginPath()
    ctx.ellipse(x, y - 45 * zoom, 10 * zoom, 6 * zoom, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x - 10 * zoom, y - 45 * zoom)
    ctx.lineTo(x - 8 * zoom, y - 65 * zoom)
    ctx.lineTo(x + 8 * zoom, y - 65 * zoom)
    ctx.lineTo(x + 10 * zoom, y - 45 * zoom)
    ctx.closePath()
    ctx.fill()

    // Topo do galão
    ctx.beginPath()
    ctx.ellipse(x, y - 65 * zoom, 8 * zoom, 5 * zoom, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  renderGenericFurniture(ctx, x, y, zoom) {
    drawIsoCube(ctx, x, y, 30 * zoom, 15 * zoom, 25 * zoom, '#6b7280', '#4b5563', '#374151')
  }

  adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  }
}
