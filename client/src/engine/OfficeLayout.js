/**
 * Office Layout Configuration
 *
 * Define o layout do escritório virtual com zonas, móveis e decoração
 */

import { TileMap, TILE_TYPES } from './TileMap.js'
import { Wall, WALL_TYPES, WALL_DIRECTIONS, createRoomWalls } from './Wall.js'
import { Furniture, FURNITURE_TYPES } from './Furniture.js'

// Definição das zonas do escritório
export const ZONES = {
  WORKSTATION: {
    id: 'workstation',
    name: 'Área de Trabalho',
    status: 'focused',
    color: '#3b82f6'
  },
  MEETING_ROOM: {
    id: 'meeting',
    name: 'Sala de Reunião',
    status: 'in-meeting',
    color: '#ef4444'
  },
  LOUNGE: {
    id: 'lounge',
    name: 'Lounge',
    status: 'available',
    color: '#22c55e'
  },
  CAFE: {
    id: 'cafe',
    name: 'Café',
    status: 'available',
    color: '#f59e0b'
  },
  RECEPTION: {
    id: 'reception',
    name: 'Recepção',
    status: 'available',
    color: '#8b5cf6'
  },
  OUTDOOR: {
    id: 'outdoor',
    name: 'Área Externa',
    status: 'available',
    color: '#10b981'
  }
}

export function createOfficeLayout() {
  // Criar tilemap 40x30
  const tileMap = new TileMap(40, 30)
  const walls = []
  const furniture = []
  const zones = []

  // === ÁREA EXTERNA (GRAMA) ===
  tileMap.fillRect(0, 0, 40, 30, TILE_TYPES.GRASS)

  // === CALÇADA ===
  tileMap.fillRect(2, 2, 36, 2, TILE_TYPES.SIDEWALK)
  tileMap.fillRect(2, 2, 2, 26, TILE_TYPES.SIDEWALK)

  // === ÁREA DE TRABALHO PRINCIPAL (Workstations) ===
  // Sala grande à direita
  tileMap.fillRect(20, 5, 16, 12, TILE_TYPES.FLOOR_CARPET_BLUE)
  zones.push({ ...ZONES.WORKSTATION, x: 20, y: 5, width: 16, height: 12 })

  // Paredes da área de trabalho
  walls.push(new Wall(36, 5, WALL_DIRECTIONS.NORTH, WALL_TYPES.GLASS, 16))
  walls.push(new Wall(36, 5, WALL_DIRECTIONS.EAST, WALL_TYPES.GLASS, 12))
  walls.push(new Wall(20, 17, WALL_DIRECTIONS.NORTH, WALL_TYPES.GLASS, 2))
  walls.push(new Wall(33, 17, WALL_DIRECTIONS.NORTH, WALL_TYPES.GLASS, 3))

  // Mesas e cadeiras - Estação 1
  furniture.push(new Furniture(23, 7, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(23, 8, FURNITURE_TYPES.CHAIR, { color: '#3b82f6' }))
  furniture.push(new Furniture(24, 7, FURNITURE_TYPES.COMPUTER))

  furniture.push(new Furniture(28, 7, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(28, 8, FURNITURE_TYPES.CHAIR, { color: '#3b82f6' }))
  furniture.push(new Furniture(29, 7, FURNITURE_TYPES.COMPUTER))

  furniture.push(new Furniture(33, 7, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(33, 8, FURNITURE_TYPES.CHAIR, { color: '#3b82f6' }))
  furniture.push(new Furniture(34, 7, FURNITURE_TYPES.COMPUTER))

  // Mesas e cadeiras - Estação 2
  furniture.push(new Furniture(23, 11, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(23, 12, FURNITURE_TYPES.CHAIR, { color: '#22c55e' }))
  furniture.push(new Furniture(24, 11, FURNITURE_TYPES.COMPUTER))

  furniture.push(new Furniture(28, 11, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(28, 12, FURNITURE_TYPES.CHAIR, { color: '#22c55e' }))
  furniture.push(new Furniture(29, 11, FURNITURE_TYPES.COMPUTER))

  furniture.push(new Furniture(33, 11, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(33, 12, FURNITURE_TYPES.CHAIR, { color: '#22c55e' }))
  furniture.push(new Furniture(34, 11, FURNITURE_TYPES.COMPUTER))

  // Mesas e cadeiras - Estação 3
  furniture.push(new Furniture(23, 15, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(23, 16, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))

  furniture.push(new Furniture(28, 15, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(28, 16, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))

  // Plantas decorativas
  furniture.push(new Furniture(21, 6, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(35, 6, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(35, 16, FURNITURE_TYPES.PLANT))

  // === SALA DE REUNIÃO 1 ===
  tileMap.fillRect(5, 5, 10, 8, TILE_TYPES.FLOOR_CARPET_RED)
  zones.push({ ...ZONES.MEETING_ROOM, x: 5, y: 5, width: 10, height: 8, name: 'Sala de Reunião 1' })

  // Paredes
  walls.push(new Wall(15, 5, WALL_DIRECTIONS.NORTH, WALL_TYPES.GLASS, 10))
  walls.push(new Wall(15, 5, WALL_DIRECTIONS.EAST, WALL_TYPES.GLASS, 8))
  walls.push(new Wall(5, 13, WALL_DIRECTIONS.NORTH, WALL_TYPES.WINDOW, 3))
  walls.push(new Wall(12, 13, WALL_DIRECTIONS.NORTH, WALL_TYPES.GLASS, 3))

  // Mesa de reunião e cadeiras
  furniture.push(new Furniture(10, 9, FURNITURE_TYPES.TABLE_MEETING))

  // Cadeiras ao redor
  furniture.push(new Furniture(7, 8, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(9, 7, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(11, 7, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(13, 8, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(13, 10, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(11, 11, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(9, 11, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(7, 10, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))

  // TV/Whiteboard
  furniture.push(new Furniture(6, 6, FURNITURE_TYPES.TV))

  // === SALA DE REUNIÃO 2 (menor) ===
  tileMap.fillRect(5, 15, 8, 6, TILE_TYPES.FLOOR_CARPET_GREEN)
  zones.push({ ...ZONES.MEETING_ROOM, x: 5, y: 15, width: 8, height: 6, name: 'Sala de Reunião 2' })

  // Paredes
  walls.push(new Wall(13, 15, WALL_DIRECTIONS.NORTH, WALL_TYPES.GLASS, 8))
  walls.push(new Wall(13, 15, WALL_DIRECTIONS.EAST, WALL_TYPES.GLASS, 6))

  // Mesa redonda e cadeiras
  furniture.push(new Furniture(9, 18, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(7, 17, FURNITURE_TYPES.CHAIR, { color: '#22c55e' }))
  furniture.push(new Furniture(11, 17, FURNITURE_TYPES.CHAIR, { color: '#22c55e' }))
  furniture.push(new Furniture(7, 19, FURNITURE_TYPES.CHAIR, { color: '#22c55e' }))
  furniture.push(new Furniture(11, 19, FURNITURE_TYPES.CHAIR, { color: '#22c55e' }))

  // Whiteboard
  furniture.push(new Furniture(6, 16, FURNITURE_TYPES.WHITEBOARD))

  // === LOUNGE / ÁREA DE DESCANSO ===
  tileMap.fillRect(20, 19, 12, 8, TILE_TYPES.FLOOR_WOOD)
  zones.push({ ...ZONES.LOUNGE, x: 20, y: 19, width: 12, height: 8 })

  // Paredes parciais
  walls.push(new Wall(32, 19, WALL_DIRECTIONS.NORTH, WALL_TYPES.SOLID, 6))
  walls.push(new Wall(32, 19, WALL_DIRECTIONS.EAST, WALL_TYPES.WINDOW, 8))

  // Sofás e poltronas
  furniture.push(new Furniture(23, 22, FURNITURE_TYPES.COUCH, { color: '#1e40af' }))
  furniture.push(new Furniture(28, 21, FURNITURE_TYPES.ARMCHAIR, { color: '#065f46' }))
  furniture.push(new Furniture(28, 24, FURNITURE_TYPES.ARMCHAIR, { color: '#065f46' }))

  // Mesa de centro
  furniture.push(new Furniture(25, 23, FURNITURE_TYPES.TABLE_ROUND))

  // Tapete
  furniture.push(new Furniture(25, 23, FURNITURE_TYPES.RUG, { color: '#7c3aed', gridZ: -0.1 }))

  // Plantas e decoração
  furniture.push(new Furniture(21, 20, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(30, 20, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(30, 26, FURNITURE_TYPES.LAMP))

  // TV
  furniture.push(new Furniture(21, 25, FURNITURE_TYPES.TV))

  // === ÁREA DO CAFÉ ===
  tileMap.fillRect(15, 19, 4, 8, TILE_TYPES.FLOOR_TILE)
  zones.push({ ...ZONES.CAFE, x: 15, y: 19, width: 4, height: 8 })

  // Máquina de café e bebedouro
  furniture.push(new Furniture(16, 20, FURNITURE_TYPES.COFFEE_MACHINE))
  furniture.push(new Furniture(18, 20, FURNITURE_TYPES.WATER_COOLER))

  // Mesa alta com banquinhos
  furniture.push(new Furniture(17, 24, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(16, 23, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  furniture.push(new Furniture(18, 25, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))

  // === RECEPÇÃO ===
  tileMap.fillRect(5, 22, 8, 5, TILE_TYPES.FLOOR_CONCRETE)
  zones.push({ ...ZONES.RECEPTION, x: 5, y: 22, width: 8, height: 5 })

  // Balcão de recepção (usando desk como base)
  furniture.push(new Furniture(8, 24, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(8, 25, FURNITURE_TYPES.CHAIR, { color: '#8b5cf6' }))
  furniture.push(new Furniture(9, 24, FURNITURE_TYPES.COMPUTER))

  // Sofá de espera
  furniture.push(new Furniture(6, 26, FURNITURE_TYPES.SOFA, { color: '#6b7280' }))

  // Planta decorativa
  furniture.push(new Furniture(11, 23, FURNITURE_TYPES.PLANT_LARGE))

  // Arquivos
  furniture.push(new Furniture(11, 26, FURNITURE_TYPES.FILING_CABINET))

  // === ÁREA EXTERNA COM ÁRVORES E BANCOS ===
  // Árvores
  furniture.push(new Furniture(2, 8, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(2, 15, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(2, 22, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(37, 20, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(37, 25, FURNITURE_TYPES.PLANT_LARGE))

  // Decoração extra
  furniture.push(new Furniture(35, 22, FURNITURE_TYPES.PLANT))

  // === ESTANTES E ARQUIVOS NA ÁREA DE TRABALHO ===
  furniture.push(new Furniture(22, 16, FURNITURE_TYPES.BOOKSHELF))
  furniture.push(new Furniture(26, 16, FURNITURE_TYPES.FILING_CABINET))
  furniture.push(new Furniture(30, 16, FURNITURE_TYPES.FILING_CABINET))

  return {
    tileMap,
    walls,
    furniture,
    zones,
    width: 40,
    height: 30,
    spawnPoint: { x: 8, y: 26 } // Onde novos usuários aparecem (recepção)
  }
}

// Obter zona em uma posição
export function getZoneAt(zones, x, y) {
  for (const zone of zones) {
    if (x >= zone.x && x < zone.x + zone.width &&
        y >= zone.y && y < zone.y + zone.height) {
      return zone
    }
  }
  return null
}

// Obter posições ocupadas por móveis
export function getFurnitureObstacles(furniture) {
  const obstacles = []

  for (const item of furniture) {
    // Cada móvel ocupa pelo menos sua posição
    obstacles.push({ x: Math.floor(item.gridX), y: Math.floor(item.gridY) })

    // Móveis maiores ocupam mais tiles
    if ([FURNITURE_TYPES.DESK, FURNITURE_TYPES.COUCH, FURNITURE_TYPES.TABLE_MEETING].includes(item.type)) {
      obstacles.push({ x: Math.floor(item.gridX) + 1, y: Math.floor(item.gridY) })
      obstacles.push({ x: Math.floor(item.gridX), y: Math.floor(item.gridY) + 1 })
    }

    if ([FURNITURE_TYPES.SOFA, FURNITURE_TYPES.COUCH].includes(item.type)) {
      obstacles.push({ x: Math.floor(item.gridX) - 1, y: Math.floor(item.gridY) })
      obstacles.push({ x: Math.floor(item.gridX) + 1, y: Math.floor(item.gridY) })
    }

    if (item.type === FURNITURE_TYPES.TABLE_MEETING) {
      obstacles.push({ x: Math.floor(item.gridX) - 1, y: Math.floor(item.gridY) })
      obstacles.push({ x: Math.floor(item.gridX) + 1, y: Math.floor(item.gridY) + 1 })
      obstacles.push({ x: Math.floor(item.gridX) - 1, y: Math.floor(item.gridY) + 1 })
    }
  }

  return obstacles
}
