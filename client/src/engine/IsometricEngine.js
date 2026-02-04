/**
 * Isometric Engine Core
 *
 * Sistema de coordenadas isométricas 2:1
 * Converte coordenadas do mundo (grid) para tela e vice-versa
 */

export const TILE_WIDTH = 64
export const TILE_HEIGHT = 32
export const TILE_DEPTH = 16 // Altura visual do tile

export class IsometricEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    this.offsetX = options.offsetX || 0
    this.offsetY = options.offsetY || 0
    this.zoom = options.zoom || 1

    this.entities = []
    this.tiles = []
    this.walls = []

    this.isDragging = false
    this.lastMousePos = { x: 0, y: 0 }

    this.setupEventListeners()
  }

  // Converter coordenadas do grid (mundo) para tela
  gridToScreen(gridX, gridY, gridZ = 0) {
    const screenX = (gridX - gridY) * (TILE_WIDTH / 2) * this.zoom + this.offsetX
    const screenY = (gridX + gridY) * (TILE_HEIGHT / 2) * this.zoom - gridZ * TILE_DEPTH * this.zoom + this.offsetY
    return { x: screenX, y: screenY }
  }

  // Converter coordenadas da tela para grid (mundo)
  screenToGrid(screenX, screenY) {
    const x = (screenX - this.offsetX) / this.zoom
    const y = (screenY - this.offsetY) / this.zoom

    const gridX = (x / (TILE_WIDTH / 2) + y / (TILE_HEIGHT / 2)) / 2
    const gridY = (y / (TILE_HEIGHT / 2) - x / (TILE_WIDTH / 2)) / 2

    return { x: Math.floor(gridX), y: Math.floor(gridY) }
  }

  setupEventListeners() {
    // Pan com mouse
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 1 || e.button === 2) { // Middle or right click
        this.isDragging = true
        this.lastMousePos = { x: e.clientX, y: e.clientY }
      }
    })

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.lastMousePos.x
        const deltaY = e.clientY - this.lastMousePos.y
        this.offsetX += deltaX
        this.offsetY += deltaY
        this.lastMousePos = { x: e.clientX, y: e.clientY }
      }
    })

    this.canvas.addEventListener('mouseup', () => {
      this.isDragging = false
    })

    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false
    })

    // Zoom com scroll
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault()
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(0.5, Math.min(2, this.zoom * zoomFactor))

      // Zoom em direção ao cursor
      const rect = this.canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      this.offsetX = mouseX - (mouseX - this.offsetX) * (newZoom / this.zoom)
      this.offsetY = mouseY - (mouseY - this.offsetY) * (newZoom / this.zoom)
      this.zoom = newZoom
    })

    // Prevenir menu de contexto
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  // Centralizar vista em uma posição do grid
  centerOn(gridX, gridY) {
    const screen = this.gridToScreen(gridX, gridY)
    this.offsetX = this.canvas.width / 2 - screen.x + this.offsetX
    this.offsetY = this.canvas.height / 2 - screen.y + this.offsetY
  }

  // Ordenar entidades por profundidade (depth sorting)
  sortEntities() {
    this.entities.sort((a, b) => {
      // Primeiro por posição Y+X (profundidade isométrica)
      const depthA = a.gridX + a.gridY + (a.gridZ || 0) * 0.1
      const depthB = b.gridX + b.gridY + (b.gridZ || 0) * 0.1
      return depthA - depthB
    })
  }

  addEntity(entity) {
    this.entities.push(entity)
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity)
    if (index > -1) {
      this.entities.splice(index, 1)
    }
  }

  clear() {
    this.ctx.fillStyle = '#2a6fb4'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  render() {
    this.clear()
    this.sortEntities()

    // Renderizar tiles primeiro
    for (const tile of this.tiles) {
      tile.render(this.ctx, this)
    }

    // Renderizar paredes
    for (const wall of this.walls) {
      wall.render(this.ctx, this)
    }

    // Renderizar entidades (móveis, avatares, etc)
    for (const entity of this.entities) {
      entity.render(this.ctx, this)
    }
  }
}

// Desenhar forma de diamante (tile base)
export function drawDiamond(ctx, x, y, width, height, fillColor, strokeColor = null) {
  ctx.beginPath()
  ctx.moveTo(x, y - height / 2)
  ctx.lineTo(x + width / 2, y)
  ctx.lineTo(x, y + height / 2)
  ctx.lineTo(x - width / 2, y)
  ctx.closePath()

  ctx.fillStyle = fillColor
  ctx.fill()

  if (strokeColor) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

// Desenhar cubo isométrico
export function drawIsoCube(ctx, x, y, width, height, depth, topColor, leftColor, rightColor) {
  const halfWidth = width / 2
  const halfHeight = height / 2

  // Face superior (top)
  ctx.beginPath()
  ctx.moveTo(x, y - depth)
  ctx.lineTo(x + halfWidth, y + halfHeight - depth)
  ctx.lineTo(x, y + height - depth)
  ctx.lineTo(x - halfWidth, y + halfHeight - depth)
  ctx.closePath()
  ctx.fillStyle = topColor
  ctx.fill()

  // Face esquerda
  ctx.beginPath()
  ctx.moveTo(x - halfWidth, y + halfHeight - depth)
  ctx.lineTo(x, y + height - depth)
  ctx.lineTo(x, y + height)
  ctx.lineTo(x - halfWidth, y + halfHeight)
  ctx.closePath()
  ctx.fillStyle = leftColor
  ctx.fill()

  // Face direita
  ctx.beginPath()
  ctx.moveTo(x + halfWidth, y + halfHeight - depth)
  ctx.lineTo(x, y + height - depth)
  ctx.lineTo(x, y + height)
  ctx.lineTo(x + halfWidth, y + halfHeight)
  ctx.closePath()
  ctx.fillStyle = rightColor
  ctx.fill()
}
