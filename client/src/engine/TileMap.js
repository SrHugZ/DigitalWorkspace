/**
 * Tile Map System
 *
 * Gerencia o grid de tiles do chão do escritório
 */

import { TILE_WIDTH, TILE_HEIGHT, drawDiamond } from './IsometricEngine.js'

// Tipos de tiles
export const TILE_TYPES = {
  EMPTY: 0,
  GRASS: 1,
  FLOOR_WOOD: 2,
  FLOOR_CARPET_BLUE: 3,
  FLOOR_CARPET_RED: 4,
  FLOOR_TILE: 5,
  FLOOR_CONCRETE: 6,
  FLOOR_CARPET_GREEN: 7,
  SIDEWALK: 8
}

// Cores dos tiles
const TILE_COLORS = {
  [TILE_TYPES.EMPTY]: null,
  [TILE_TYPES.GRASS]: { fill: '#4ade80', stroke: '#22c55e', pattern: 'grass' },
  [TILE_TYPES.FLOOR_WOOD]: { fill: '#c4a574', stroke: '#a08050', pattern: 'wood' },
  [TILE_TYPES.FLOOR_CARPET_BLUE]: { fill: '#3b82f6', stroke: '#2563eb', pattern: 'carpet' },
  [TILE_TYPES.FLOOR_CARPET_RED]: { fill: '#ef4444', stroke: '#dc2626', pattern: 'carpet' },
  [TILE_TYPES.FLOOR_TILE]: { fill: '#e5e7eb', stroke: '#d1d5db', pattern: 'tile' },
  [TILE_TYPES.FLOOR_CONCRETE]: { fill: '#9ca3af', stroke: '#6b7280', pattern: 'concrete' },
  [TILE_TYPES.FLOOR_CARPET_GREEN]: { fill: '#22c55e', stroke: '#16a34a', pattern: 'carpet' },
  [TILE_TYPES.SIDEWALK]: { fill: '#d1d5db', stroke: '#9ca3af', pattern: 'sidewalk' }
}

export class Tile {
  constructor(gridX, gridY, type = TILE_TYPES.FLOOR_WOOD) {
    this.gridX = gridX
    this.gridY = gridY
    this.type = type
    this.highlighted = false
    this.walkable = type !== TILE_TYPES.EMPTY
  }

  render(ctx, engine) {
    if (this.type === TILE_TYPES.EMPTY) return

    const colors = TILE_COLORS[this.type]
    if (!colors) return

    const { x, y } = engine.gridToScreen(this.gridX, this.gridY)
    const width = TILE_WIDTH * engine.zoom
    const height = TILE_HEIGHT * engine.zoom

    // Desenhar tile base
    let fillColor = colors.fill
    if (this.highlighted) {
      fillColor = this.adjustBrightness(colors.fill, 30)
    }

    drawDiamond(ctx, x, y, width, height, fillColor, colors.stroke)

    // Adicionar padrão/textura
    this.renderPattern(ctx, x, y, width, height, colors.pattern, engine.zoom)
  }

  renderPattern(ctx, x, y, width, height, pattern, zoom) {
    ctx.save()
    ctx.globalAlpha = 0.3

    switch (pattern) {
      case 'grass':
        // Pequenos detalhes de grama
        this.drawGrassDetails(ctx, x, y, width, height, zoom)
        break
      case 'wood':
        // Linhas de madeira
        this.drawWoodGrain(ctx, x, y, width, height, zoom)
        break
      case 'carpet':
        // Textura de carpete
        this.drawCarpetTexture(ctx, x, y, width, height, zoom)
        break
      case 'tile':
        // Linhas de piso
        this.drawTileLines(ctx, x, y, width, height, zoom)
        break
    }

    ctx.restore()
  }

  drawGrassDetails(ctx, x, y, width, height, zoom) {
    ctx.fillStyle = '#16a34a'
    const bladeCount = 3
    for (let i = 0; i < bladeCount; i++) {
      const offsetX = (Math.random() - 0.5) * width * 0.5
      const offsetY = (Math.random() - 0.5) * height * 0.3
      ctx.fillRect(x + offsetX, y + offsetY, 2 * zoom, 4 * zoom)
    }
  }

  drawWoodGrain(ctx, x, y, width, height, zoom) {
    ctx.strokeStyle = '#8b6914'
    ctx.lineWidth = 1 * zoom
    ctx.beginPath()
    ctx.moveTo(x - width * 0.3, y)
    ctx.lineTo(x + width * 0.3, y)
    ctx.stroke()
  }

  drawCarpetTexture(ctx, x, y, width, height, zoom) {
    // Pequenos pontos para textura de carpete
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    for (let i = 0; i < 5; i++) {
      const px = x + (Math.random() - 0.5) * width * 0.6
      const py = y + (Math.random() - 0.5) * height * 0.6
      ctx.beginPath()
      ctx.arc(px, py, 1 * zoom, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawTileLines(ctx, x, y, width, height, zoom) {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1 * zoom
    // Cruz no centro
    ctx.beginPath()
    ctx.moveTo(x, y - height * 0.3)
    ctx.lineTo(x, y + height * 0.3)
    ctx.moveTo(x - width * 0.3, y)
    ctx.lineTo(x + width * 0.3, y)
    ctx.stroke()
  }

  adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = Math.min(255, (num >> 16) + amt)
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt)
    const B = Math.min(255, (num & 0x0000FF) + amt)
    return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`
  }
}

export class TileMap {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.tiles = []

    // Inicializar grid vazio
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.tiles.push(new Tile(x, y, TILE_TYPES.EMPTY))
      }
    }
  }

  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null
    }
    return this.tiles[y * this.width + x]
  }

  setTile(x, y, type) {
    const tile = this.getTile(x, y)
    if (tile) {
      tile.type = type
      tile.walkable = type !== TILE_TYPES.EMPTY
    }
  }

  // Preencher área retangular
  fillRect(startX, startY, width, height, type) {
    for (let y = startY; y < startY + height; y++) {
      for (let x = startX; x < startX + width; x++) {
        this.setTile(x, y, type)
      }
    }
  }

  // Verificar se posição é caminhável
  isWalkable(x, y) {
    const tile = this.getTile(x, y)
    return tile && tile.walkable
  }

  // Obter todos os tiles como array para renderização
  getAllTiles() {
    return this.tiles.filter(t => t.type !== TILE_TYPES.EMPTY)
  }

  // Highlight tile em posição específica
  highlightTile(x, y) {
    this.clearHighlights()
    const tile = this.getTile(x, y)
    if (tile) {
      tile.highlighted = true
    }
  }

  clearHighlights() {
    for (const tile of this.tiles) {
      tile.highlighted = false
    }
  }
}
