/**
 * Tile Map System - SoWork Style
 *
 * Gerencia o grid de tiles do chão do escritório
 * Inclui água, deck, jardim e pisos variados
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
  SIDEWALK: 8,
  WATER: 9,
  DECK: 10,
  GARDEN: 11,
  FLOOR_DARK: 12,
  PATH_STONE: 13,
  SAND: 14,
  FLOOR_CARPET_PURPLE: 15
}

// Cores dos tiles (mais refinadas, estilo SoWork)
const TILE_COLORS = {
  [TILE_TYPES.EMPTY]: null,
  [TILE_TYPES.GRASS]: { fill: '#5cb85c', stroke: '#4a9e4a', pattern: 'grass' },
  [TILE_TYPES.FLOOR_WOOD]: { fill: '#c4a06a', stroke: '#a08050', pattern: 'wood' },
  [TILE_TYPES.FLOOR_CARPET_BLUE]: { fill: '#4a6fa5', stroke: '#3a5f8a', pattern: 'carpet' },
  [TILE_TYPES.FLOOR_CARPET_RED]: { fill: '#c45a5a', stroke: '#a84040', pattern: 'carpet' },
  [TILE_TYPES.FLOOR_TILE]: { fill: '#d8dce2', stroke: '#c0c4ca', pattern: 'tile' },
  [TILE_TYPES.FLOOR_CONCRETE]: { fill: '#9ca3af', stroke: '#6b7280', pattern: 'concrete' },
  [TILE_TYPES.FLOOR_CARPET_GREEN]: { fill: '#4a9e6a', stroke: '#3a8e5a', pattern: 'carpet' },
  [TILE_TYPES.SIDEWALK]: { fill: '#c8cdd4', stroke: '#a8adb4', pattern: 'sidewalk' },
  [TILE_TYPES.WATER]: { fill: '#3b8fd4', stroke: '#2a7fc4', pattern: 'water' },
  [TILE_TYPES.DECK]: { fill: '#a07848', stroke: '#8a6838', pattern: 'deck' },
  [TILE_TYPES.GARDEN]: { fill: '#48b068', stroke: '#38a058', pattern: 'garden' },
  [TILE_TYPES.FLOOR_DARK]: { fill: '#3a3a4a', stroke: '#2a2a3a', pattern: 'tile' },
  [TILE_TYPES.PATH_STONE]: { fill: '#b0a898', stroke: '#988878', pattern: 'stone' },
  [TILE_TYPES.SAND]: { fill: '#e8d8a8', stroke: '#d0c090', pattern: 'sand' },
  [TILE_TYPES.FLOOR_CARPET_PURPLE]: { fill: '#7a5aaa', stroke: '#6a4a9a', pattern: 'carpet' }
}

// Contador global para animação de água
let waterAnimTime = 0
export function updateWaterAnimation() {
  waterAnimTime = Date.now() * 0.001
}

export class Tile {
  constructor(gridX, gridY, type = TILE_TYPES.FLOOR_WOOD) {
    this.gridX = gridX
    this.gridY = gridY
    this.type = type
    this.highlighted = false
    this.walkable = type !== TILE_TYPES.EMPTY && type !== TILE_TYPES.WATER
    // Seed para variação visual por tile
    this.seed = (gridX * 7 + gridY * 13) % 100
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

    // Água tem tratamento especial
    if (this.type === TILE_TYPES.WATER) {
      this.renderWater(ctx, x, y, width, height, engine.zoom)
      return
    }

    drawDiamond(ctx, x, y, width, height, fillColor, colors.stroke)

    // Adicionar padrão/textura
    this.renderPattern(ctx, x, y, width, height, colors.pattern, engine.zoom)
  }

  renderWater(ctx, x, y, width, height, zoom) {
    // Base da água com variação de cor
    const wave = Math.sin(waterAnimTime * 1.5 + this.seed * 0.3) * 0.08
    const r = 59 + Math.floor(wave * 30)
    const g = 143 + Math.floor(wave * 20)
    const b = 212 + Math.floor(wave * 15)
    const baseColor = `rgb(${r},${g},${b})`

    drawDiamond(ctx, x, y, width, height, baseColor, '#2a7fc4')

    ctx.save()

    // Reflexos de luz na água
    ctx.globalAlpha = 0.15 + Math.sin(waterAnimTime * 2 + this.seed) * 0.08
    const sparkleX = x + Math.sin(waterAnimTime + this.seed * 0.5) * width * 0.15
    const sparkleY = y + Math.cos(waterAnimTime * 0.8 + this.seed * 0.3) * height * 0.1

    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath()
    ctx.ellipse(sparkleX, sparkleY, 3 * zoom, 1.5 * zoom, 0.5, 0, Math.PI * 2)
    ctx.fill()

    // Ondulações sutis
    ctx.globalAlpha = 0.1
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 0.8 * zoom
    const waveOffset = Math.sin(waterAnimTime * 1.2 + this.seed * 0.4) * 4 * zoom
    ctx.beginPath()
    ctx.moveTo(x - width * 0.2, y + waveOffset)
    ctx.quadraticCurveTo(x, y - 2 * zoom + waveOffset, x + width * 0.2, y + waveOffset)
    ctx.stroke()

    ctx.restore()
  }

  renderPattern(ctx, x, y, width, height, pattern, zoom) {
    ctx.save()
    ctx.globalAlpha = 0.25

    switch (pattern) {
      case 'grass':
        this.drawGrassDetails(ctx, x, y, width, height, zoom)
        break
      case 'wood':
        this.drawWoodGrain(ctx, x, y, width, height, zoom)
        break
      case 'carpet':
        this.drawCarpetTexture(ctx, x, y, width, height, zoom)
        break
      case 'tile':
        this.drawTileLines(ctx, x, y, width, height, zoom)
        break
      case 'deck':
        this.drawDeckPlanks(ctx, x, y, width, height, zoom)
        break
      case 'garden':
        this.drawGardenDetails(ctx, x, y, width, height, zoom)
        break
      case 'stone':
        this.drawStonePath(ctx, x, y, width, height, zoom)
        break
      case 'sand':
        this.drawSandTexture(ctx, x, y, width, height, zoom)
        break
      case 'sidewalk':
        this.drawSidewalkLines(ctx, x, y, width, height, zoom)
        break
    }

    ctx.restore()
  }

  drawGrassDetails(ctx, x, y, width, height, zoom) {
    // Usar seed para posições consistentes
    const rng = this.seededRandom(this.seed)
    ctx.fillStyle = '#3a8e3a'
    for (let i = 0; i < 4; i++) {
      const offsetX = (rng() - 0.5) * width * 0.5
      const offsetY = (rng() - 0.5) * height * 0.3
      ctx.fillRect(x + offsetX, y + offsetY, 1.5 * zoom, 3 * zoom)
    }
    // Flores ocasionais
    if (this.seed % 8 === 0) {
      ctx.globalAlpha = 0.5
      const colors = ['#f0e040', '#e87070', '#e0e0e0', '#d070e0']
      ctx.fillStyle = colors[this.seed % colors.length]
      ctx.beginPath()
      ctx.arc(x + (rng() - 0.5) * width * 0.3, y + (rng() - 0.5) * height * 0.2, 2 * zoom, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawWoodGrain(ctx, x, y, width, height, zoom) {
    ctx.strokeStyle = '#8b6914'
    ctx.lineWidth = 0.8 * zoom
    // Múltiplas linhas de madeira
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath()
      ctx.moveTo(x - width * 0.3, y + i * 4 * zoom)
      ctx.lineTo(x + width * 0.3, y + i * 4 * zoom)
      ctx.stroke()
    }
  }

  drawCarpetTexture(ctx, x, y, width, height, zoom) {
    const rng = this.seededRandom(this.seed)
    ctx.fillStyle = 'rgba(255,255,255,0.15)'
    for (let i = 0; i < 6; i++) {
      const px = x + (rng() - 0.5) * width * 0.5
      const py = y + (rng() - 0.5) * height * 0.5
      ctx.beginPath()
      ctx.arc(px, py, 0.8 * zoom, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawTileLines(ctx, x, y, width, height, zoom) {
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 0.8 * zoom
    ctx.beginPath()
    ctx.moveTo(x, y - height * 0.25)
    ctx.lineTo(x, y + height * 0.25)
    ctx.moveTo(x - width * 0.25, y)
    ctx.lineTo(x + width * 0.25, y)
    ctx.stroke()
  }

  drawDeckPlanks(ctx, x, y, width, height, zoom) {
    ctx.strokeStyle = '#704828'
    ctx.lineWidth = 0.7 * zoom
    // Tábuas do deck
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(x - width * 0.35, y + i * 3 * zoom)
      ctx.lineTo(x + width * 0.35, y + i * 3 * zoom)
      ctx.stroke()
    }
    // Nós da madeira
    if (this.seed % 5 === 0) {
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#604020'
      ctx.beginPath()
      ctx.arc(x + (this.seed % 3 - 1) * 5 * zoom, y, 1.5 * zoom, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawGardenDetails(ctx, x, y, width, height, zoom) {
    const rng = this.seededRandom(this.seed)
    // Grama mais detalhada
    ctx.fillStyle = '#2a8040'
    for (let i = 0; i < 5; i++) {
      const ox = (rng() - 0.5) * width * 0.4
      const oy = (rng() - 0.5) * height * 0.3
      ctx.fillRect(x + ox, y + oy, 1.2 * zoom, 2.5 * zoom)
    }
    // Flores frequentes
    if (this.seed % 4 === 0) {
      ctx.globalAlpha = 0.6
      const flowerColors = ['#ff6b8a', '#ffcc00', '#ff9933', '#cc66ff', '#66ccff']
      ctx.fillStyle = flowerColors[this.seed % flowerColors.length]
      ctx.beginPath()
      ctx.arc(x + (rng() - 0.5) * width * 0.3, y + (rng() - 0.5) * height * 0.2, 2.5 * zoom, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawStonePath(ctx, x, y, width, height, zoom) {
    const rng = this.seededRandom(this.seed)
    // Pedras individuais
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 0.6 * zoom
    for (let i = 0; i < 3; i++) {
      const sx = x + (rng() - 0.5) * width * 0.4
      const sy = y + (rng() - 0.5) * height * 0.3
      ctx.beginPath()
      ctx.ellipse(sx, sy, (3 + rng() * 3) * zoom, (2 + rng() * 2) * zoom, rng() * Math.PI, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  drawSandTexture(ctx, x, y, width, height, zoom) {
    const rng = this.seededRandom(this.seed)
    ctx.fillStyle = 'rgba(180,160,120,0.3)'
    for (let i = 0; i < 4; i++) {
      const px = x + (rng() - 0.5) * width * 0.4
      const py = y + (rng() - 0.5) * height * 0.3
      ctx.beginPath()
      ctx.arc(px, py, 0.6 * zoom, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawSidewalkLines(ctx, x, y, width, height, zoom) {
    ctx.strokeStyle = 'rgba(0,0,0,0.08)'
    ctx.lineWidth = 0.5 * zoom
    // Linhas de junção
    ctx.beginPath()
    ctx.moveTo(x - width * 0.15, y - height * 0.15)
    ctx.lineTo(x + width * 0.15, y + height * 0.15)
    ctx.stroke()
  }

  // Gerador de números pseudo-aleatórios com seed
  seededRandom(seed) {
    let s = seed + 1
    return function() {
      s = (s * 16807 + 0) % 2147483647
      return (s - 1) / 2147483646
    }
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
      tile.walkable = type !== TILE_TYPES.EMPTY && type !== TILE_TYPES.WATER
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

  // Preencher borda de retângulo
  fillBorder(startX, startY, width, height, type) {
    for (let x = startX; x < startX + width; x++) {
      this.setTile(x, startY, type)
      this.setTile(x, startY + height - 1, type)
    }
    for (let y = startY; y < startY + height; y++) {
      this.setTile(startX, y, type)
      this.setTile(startX + width - 1, y, type)
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
