/**
 * Isometric Wall System
 *
 * Paredes com transparência e janelas estilo escritório
 */

import { TILE_WIDTH, TILE_HEIGHT } from './IsometricEngine.js'

const WALL_HEIGHT = 80 // Altura da parede em pixels
const WALL_THICKNESS = 8

export const WALL_TYPES = {
  SOLID: 'solid',
  GLASS: 'glass',
  WINDOW: 'window',
  DOOR: 'door'
}

export const WALL_DIRECTIONS = {
  NORTH: 'north', // Parede no lado superior esquerdo
  EAST: 'east',   // Parede no lado superior direito
  SOUTH: 'south', // Parede no lado inferior direito
  WEST: 'west'    // Parede no lado inferior esquerdo
}

export class Wall {
  constructor(gridX, gridY, direction, type = WALL_TYPES.SOLID, length = 1) {
    this.gridX = gridX
    this.gridY = gridY
    this.direction = direction
    this.type = type
    this.length = length
    this.color = '#2d3748'
    this.glassColor = 'rgba(135, 206, 235, 0.4)'
    this.frameColor = '#1a202c'
  }

  render(ctx, engine) {
    const { x, y } = engine.gridToScreen(this.gridX, this.gridY)
    const zoom = engine.zoom
    const wallHeight = WALL_HEIGHT * zoom

    ctx.save()

    switch (this.direction) {
      case WALL_DIRECTIONS.NORTH:
        this.renderNorthWall(ctx, x, y, zoom, wallHeight)
        break
      case WALL_DIRECTIONS.EAST:
        this.renderEastWall(ctx, x, y, zoom, wallHeight)
        break
      case WALL_DIRECTIONS.SOUTH:
        this.renderSouthWall(ctx, x, y, zoom, wallHeight)
        break
      case WALL_DIRECTIONS.WEST:
        this.renderWestWall(ctx, x, y, zoom, wallHeight)
        break
    }

    ctx.restore()
  }

  renderNorthWall(ctx, x, y, zoom, wallHeight) {
    const tileW = TILE_WIDTH * zoom / 2
    const tileH = TILE_HEIGHT * zoom / 2

    for (let i = 0; i < this.length; i++) {
      const offsetX = -i * tileW
      const offsetY = -i * tileH

      const baseX = x + offsetX - tileW
      const baseY = y + offsetY - tileH

      // Forma da parede (lado esquerdo do tile)
      ctx.beginPath()
      ctx.moveTo(baseX, baseY) // Canto inferior
      ctx.lineTo(baseX, baseY - wallHeight) // Canto superior
      ctx.lineTo(baseX + tileW, baseY - tileH - wallHeight) // Topo direito
      ctx.lineTo(baseX + tileW, baseY - tileH) // Base direita
      ctx.closePath()

      this.fillWall(ctx, 'left')
      this.renderWallDetails(ctx, baseX, baseY, tileW, tileH, wallHeight, 'left')
    }
  }

  renderEastWall(ctx, x, y, zoom, wallHeight) {
    const tileW = TILE_WIDTH * zoom / 2
    const tileH = TILE_HEIGHT * zoom / 2

    for (let i = 0; i < this.length; i++) {
      const offsetX = i * tileW
      const offsetY = -i * tileH

      const baseX = x + offsetX
      const baseY = y + offsetY - tileH

      // Forma da parede (lado direito do tile)
      ctx.beginPath()
      ctx.moveTo(baseX, baseY) // Canto inferior
      ctx.lineTo(baseX, baseY - wallHeight) // Canto superior
      ctx.lineTo(baseX + tileW, baseY + tileH - wallHeight) // Topo direito
      ctx.lineTo(baseX + tileW, baseY + tileH) // Base direita
      ctx.closePath()

      this.fillWall(ctx, 'right')
      this.renderWallDetails(ctx, baseX, baseY, tileW, tileH, wallHeight, 'right')
    }
  }

  renderSouthWall(ctx, x, y, zoom, wallHeight) {
    const tileW = TILE_WIDTH * zoom / 2
    const tileH = TILE_HEIGHT * zoom / 2

    for (let i = 0; i < this.length; i++) {
      const offsetX = i * tileW
      const offsetY = i * tileH

      const baseX = x + offsetX
      const baseY = y + offsetY

      ctx.beginPath()
      ctx.moveTo(baseX, baseY)
      ctx.lineTo(baseX, baseY - wallHeight)
      ctx.lineTo(baseX + tileW, baseY + tileH - wallHeight)
      ctx.lineTo(baseX + tileW, baseY + tileH)
      ctx.closePath()

      this.fillWall(ctx, 'right')
      this.renderWallDetails(ctx, baseX, baseY, tileW, tileH, wallHeight, 'right')
    }
  }

  renderWestWall(ctx, x, y, zoom, wallHeight) {
    const tileW = TILE_WIDTH * zoom / 2
    const tileH = TILE_HEIGHT * zoom / 2

    for (let i = 0; i < this.length; i++) {
      const offsetX = -i * tileW
      const offsetY = i * tileH

      const baseX = x + offsetX - tileW
      const baseY = y + offsetY

      ctx.beginPath()
      ctx.moveTo(baseX, baseY)
      ctx.lineTo(baseX, baseY - wallHeight)
      ctx.lineTo(baseX + tileW, baseY - tileH - wallHeight)
      ctx.lineTo(baseX + tileW, baseY - tileH)
      ctx.closePath()

      this.fillWall(ctx, 'left')
      this.renderWallDetails(ctx, baseX, baseY, tileW, tileH, wallHeight, 'left')
    }
  }

  fillWall(ctx, side) {
    if (this.type === WALL_TYPES.GLASS) {
      ctx.fillStyle = this.glassColor
      ctx.fill()
      ctx.strokeStyle = this.frameColor
      ctx.lineWidth = 2
      ctx.stroke()
    } else if (this.type === WALL_TYPES.SOLID) {
      // Gradiente para dar profundidade
      const baseColor = side === 'left' ? '#374151' : '#4b5563'
      ctx.fillStyle = baseColor
      ctx.fill()
      ctx.strokeStyle = '#1f2937'
      ctx.lineWidth = 1
      ctx.stroke()
    } else {
      ctx.fillStyle = side === 'left' ? '#374151' : '#4b5563'
      ctx.fill()
    }
  }

  renderWallDetails(ctx, baseX, baseY, tileW, tileH, wallHeight, side) {
    if (this.type === WALL_TYPES.WINDOW || this.type === WALL_TYPES.GLASS) {
      this.renderWindow(ctx, baseX, baseY, tileW, tileH, wallHeight, side)
    }

    if (this.type === WALL_TYPES.DOOR) {
      this.renderDoor(ctx, baseX, baseY, tileW, tileH, wallHeight, side)
    }
  }

  renderWindow(ctx, baseX, baseY, tileW, tileH, wallHeight, side) {
    const windowMargin = wallHeight * 0.2
    const windowHeight = wallHeight * 0.5
    const windowWidth = tileW * 0.7

    ctx.fillStyle = 'rgba(135, 206, 250, 0.5)'
    ctx.strokeStyle = '#1a202c'
    ctx.lineWidth = 2

    if (side === 'left') {
      const winX = baseX + tileW * 0.15
      const winY = baseY - tileH * 0.15 - wallHeight + windowMargin

      ctx.beginPath()
      ctx.moveTo(winX, winY)
      ctx.lineTo(winX, winY + windowHeight)
      ctx.lineTo(winX + windowWidth, winY + windowHeight - tileH * 0.3)
      ctx.lineTo(winX + windowWidth, winY - tileH * 0.3)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Reflexo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.beginPath()
      ctx.moveTo(winX + 2, winY + 2)
      ctx.lineTo(winX + 2, winY + windowHeight * 0.3)
      ctx.lineTo(winX + windowWidth * 0.3, winY + windowHeight * 0.3 - tileH * 0.1)
      ctx.lineTo(winX + windowWidth * 0.3, winY - tileH * 0.1 + 2)
      ctx.closePath()
      ctx.fill()
    } else {
      const winX = baseX + tileW * 0.15
      const winY = baseY + tileH * 0.15 - wallHeight + windowMargin

      ctx.beginPath()
      ctx.moveTo(winX, winY)
      ctx.lineTo(winX, winY + windowHeight)
      ctx.lineTo(winX + windowWidth, winY + windowHeight + tileH * 0.3)
      ctx.lineTo(winX + windowWidth, winY + tileH * 0.3)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Reflexo
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.beginPath()
      ctx.moveTo(winX + 2, winY + 2)
      ctx.lineTo(winX + 2, winY + windowHeight * 0.3)
      ctx.lineTo(winX + windowWidth * 0.3, winY + windowHeight * 0.3 + tileH * 0.1)
      ctx.lineTo(winX + windowWidth * 0.3, winY + tileH * 0.1 + 2)
      ctx.closePath()
      ctx.fill()
    }
  }

  renderDoor(ctx, baseX, baseY, tileW, tileH, wallHeight, side) {
    const doorHeight = wallHeight * 0.8
    const doorWidth = tileW * 0.6

    ctx.fillStyle = '#8b4513'
    ctx.strokeStyle = '#5d2e0c'
    ctx.lineWidth = 2

    if (side === 'left') {
      const doorX = baseX + tileW * 0.2
      const doorY = baseY - tileH * 0.2

      ctx.beginPath()
      ctx.moveTo(doorX, doorY)
      ctx.lineTo(doorX, doorY - doorHeight)
      ctx.lineTo(doorX + doorWidth, doorY - doorHeight - tileH * 0.25)
      ctx.lineTo(doorX + doorWidth, doorY - tileH * 0.25)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Maçaneta
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(doorX + doorWidth * 0.8, doorY - doorHeight * 0.5, 3, 0, Math.PI * 2)
      ctx.fill()
    } else {
      const doorX = baseX + tileW * 0.2
      const doorY = baseY + tileH * 0.2

      ctx.beginPath()
      ctx.moveTo(doorX, doorY)
      ctx.lineTo(doorX, doorY - doorHeight)
      ctx.lineTo(doorX + doorWidth, doorY - doorHeight + tileH * 0.25)
      ctx.lineTo(doorX + doorWidth, doorY + tileH * 0.25)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Maçaneta
      ctx.fillStyle = '#ffd700'
      ctx.beginPath()
      ctx.arc(doorX + doorWidth * 0.8, doorY - doorHeight * 0.5, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// Helper para criar paredes de uma sala
export function createRoomWalls(startX, startY, width, height, wallType = WALL_TYPES.GLASS) {
  const walls = []

  // Parede Norte (lado esquerdo superior)
  walls.push(new Wall(startX + width, startY, WALL_DIRECTIONS.NORTH, wallType, width))

  // Parede Leste (lado direito superior)
  walls.push(new Wall(startX + width, startY, WALL_DIRECTIONS.EAST, wallType, height))

  return walls
}
