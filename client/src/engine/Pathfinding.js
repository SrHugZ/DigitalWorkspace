/**
 * A* Pathfinding Algorithm
 *
 * Encontra o caminho mais curto entre dois pontos no grid
 */

class PriorityQueue {
  constructor() {
    this.elements = []
  }

  isEmpty() {
    return this.elements.length === 0
  }

  enqueue(element, priority) {
    this.elements.push({ element, priority })
    this.elements.sort((a, b) => a.priority - b.priority)
  }

  dequeue() {
    return this.elements.shift()?.element
  }
}

export class Pathfinder {
  constructor(tileMap, obstacles = []) {
    this.tileMap = tileMap
    this.obstacles = new Set(obstacles.map(o => `${o.x},${o.y}`))
  }

  // Atualizar obstáculos (móveis, outros avatares, etc)
  setObstacles(obstacles) {
    this.obstacles = new Set(obstacles.map(o => `${o.x},${o.y}`))
  }

  addObstacle(x, y) {
    this.obstacles.add(`${x},${y}`)
  }

  removeObstacle(x, y) {
    this.obstacles.delete(`${x},${y}`)
  }

  // Verificar se uma posição é válida para caminhar
  isWalkable(x, y) {
    // Fora dos limites
    if (x < 0 || y < 0 || x >= this.tileMap.width || y >= this.tileMap.height) {
      return false
    }

    // Verificar se o tile é walkable
    if (!this.tileMap.isWalkable(x, y)) {
      return false
    }

    // Verificar obstáculos
    if (this.obstacles.has(`${x},${y}`)) {
      return false
    }

    return true
  }

  // Obter vizinhos válidos (8 direções)
  getNeighbors(x, y) {
    const neighbors = []
    const directions = [
      { dx: 0, dy: -1 },  // Norte
      { dx: 1, dy: -1 },  // Nordeste
      { dx: 1, dy: 0 },   // Leste
      { dx: 1, dy: 1 },   // Sudeste
      { dx: 0, dy: 1 },   // Sul
      { dx: -1, dy: 1 },  // Sudoeste
      { dx: -1, dy: 0 },  // Oeste
      { dx: -1, dy: -1 }  // Noroeste
    ]

    for (const dir of directions) {
      const newX = x + dir.dx
      const newY = y + dir.dy

      if (this.isWalkable(newX, newY)) {
        // Para diagonais, verificar se não estamos "cortando" cantos
        if (dir.dx !== 0 && dir.dy !== 0) {
          // Movimento diagonal - verificar tiles adjacentes
          if (!this.isWalkable(x + dir.dx, y) || !this.isWalkable(x, y + dir.dy)) {
            continue // Não permitir cortar cantos
          }
        }
        neighbors.push({ x: newX, y: newY })
      }
    }

    return neighbors
  }

  // Heurística (distância euclidiana)
  heuristic(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  }

  // Custo de movimento (diagonal custa mais)
  movementCost(x1, y1, x2, y2) {
    const dx = Math.abs(x2 - x1)
    const dy = Math.abs(y2 - y1)
    return dx + dy === 2 ? 1.414 : 1 // Diagonal = √2 ≈ 1.414
  }

  // Algoritmo A*
  findPath(startX, startY, endX, endY) {
    // Verificar se início e fim são válidos
    if (!this.isWalkable(startX, startY)) {
      console.warn('Posição inicial não é walkable')
      return []
    }

    if (!this.isWalkable(endX, endY)) {
      // Tentar encontrar tile walkable mais próximo do destino
      const closest = this.findClosestWalkable(endX, endY)
      if (closest) {
        endX = closest.x
        endY = closest.y
      } else {
        console.warn('Posição final não é walkable e não há alternativa')
        return []
      }
    }

    // Se já estamos no destino
    if (startX === endX && startY === endY) {
      return []
    }

    const openSet = new PriorityQueue()
    const cameFrom = new Map()
    const gScore = new Map()
    const fScore = new Map()

    const startKey = `${startX},${startY}`
    const endKey = `${endX},${endY}`

    gScore.set(startKey, 0)
    fScore.set(startKey, this.heuristic(startX, startY, endX, endY))
    openSet.enqueue({ x: startX, y: startY }, fScore.get(startKey))

    const closedSet = new Set()

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue()
      const currentKey = `${current.x},${current.y}`

      // Chegamos ao destino!
      if (current.x === endX && current.y === endY) {
        return this.reconstructPath(cameFrom, current)
      }

      closedSet.add(currentKey)

      // Explorar vizinhos
      for (const neighbor of this.getNeighbors(current.x, current.y)) {
        const neighborKey = `${neighbor.x},${neighbor.y}`

        if (closedSet.has(neighborKey)) {
          continue
        }

        const tentativeGScore = gScore.get(currentKey) +
          this.movementCost(current.x, current.y, neighbor.x, neighbor.y)

        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, current)
          gScore.set(neighborKey, tentativeGScore)
          fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor.x, neighbor.y, endX, endY))

          openSet.enqueue(neighbor, fScore.get(neighborKey))
        }
      }
    }

    // Não encontrou caminho
    console.warn('Nenhum caminho encontrado')
    return []
  }

  // Reconstruir o caminho a partir do mapa cameFrom
  reconstructPath(cameFrom, current) {
    const path = [current]
    let currentKey = `${current.x},${current.y}`

    while (cameFrom.has(currentKey)) {
      current = cameFrom.get(currentKey)
      currentKey = `${current.x},${current.y}`
      path.unshift(current)
    }

    // Remover o ponto inicial (avatar já está lá)
    path.shift()

    return path
  }

  // Encontrar tile walkable mais próximo de uma posição
  findClosestWalkable(x, y, maxRadius = 5) {
    for (let radius = 1; radius <= maxRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
            const checkX = x + dx
            const checkY = y + dy
            if (this.isWalkable(checkX, checkY)) {
              return { x: checkX, y: checkY }
            }
          }
        }
      }
    }
    return null
  }

  // Simplificar path removendo pontos desnecessários em linha reta
  simplifyPath(path) {
    if (path.length <= 2) return path

    const simplified = [path[0]]

    for (let i = 1; i < path.length - 1; i++) {
      const prev = simplified[simplified.length - 1]
      const curr = path[i]
      const next = path[i + 1]

      // Verificar se estamos mudando de direção
      const dir1X = curr.x - prev.x
      const dir1Y = curr.y - prev.y
      const dir2X = next.x - curr.x
      const dir2Y = next.y - curr.y

      if (dir1X !== dir2X || dir1Y !== dir2Y) {
        simplified.push(curr)
      }
    }

    simplified.push(path[path.length - 1])
    return simplified
  }
}

// Funções auxiliares para debugging
export function visualizePath(ctx, engine, path, color = 'rgba(102, 126, 234, 0.5)') {
  if (path.length === 0) return

  ctx.strokeStyle = color
  ctx.lineWidth = 3 * engine.zoom
  ctx.setLineDash([5, 5])
  ctx.beginPath()

  const start = engine.gridToScreen(path[0].x, path[0].y)
  ctx.moveTo(start.x, start.y)

  for (let i = 1; i < path.length; i++) {
    const point = engine.gridToScreen(path[i].x, path[i].y)
    ctx.lineTo(point.x, point.y)
  }

  ctx.stroke()
  ctx.setLineDash([])

  // Desenhar pontos nos waypoints
  ctx.fillStyle = color
  for (const point of path) {
    const screen = engine.gridToScreen(point.x, point.y)
    ctx.beginPath()
    ctx.arc(screen.x, screen.y, 4 * engine.zoom, 0, Math.PI * 2)
    ctx.fill()
  }
}
