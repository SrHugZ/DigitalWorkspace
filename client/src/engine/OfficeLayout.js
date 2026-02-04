/**
 * Office Layout Configuration - Versão Completa
 *
 * Layout organizado seguindo modelo de empresa real:
 * - Salas de Foco (Deep Work, Workstations)
 * - Salas de Reunião (Pequena, Grande)
 * - Salas Sociais (Lounge, Café, Watercooler)
 * - Salas de Colaboração (Pair Programming, War Room)
 * - Salas de Gestão (Líder, RH)
 * - Salas Especiais (Onboarding, Silêncio)
 */

import { TileMap, TILE_TYPES } from './TileMap.js'
import { Furniture, FURNITURE_TYPES } from './Furniture.js'

// Definição das zonas com comportamentos
export const ZONES = {
  // Foco Individual
  WORKSTATION: {
    id: 'workstation',
    name: 'Workstation',
    status: 'focused',
    color: '#3b82f6',
    icon: '💻',
    behavior: {
      audioDefault: false,
      interruptionsAllowed: true,
      quickTalkEnabled: true
    }
  },
  DEEP_WORK: {
    id: 'deep-work',
    name: 'Deep Work',
    status: 'busy',
    color: '#ef4444',
    icon: '🎯',
    behavior: {
      audioDefault: false,
      interruptionsAllowed: false,
      quickTalkEnabled: false,
      warningOnEnter: true
    }
  },

  // Reuniões
  MEETING_SMALL: {
    id: 'meeting-small',
    name: 'Sala de Reunião',
    status: 'in-meeting',
    color: '#f59e0b',
    icon: '🗣️',
    behavior: {
      audioDefault: true,
      videoDefault: true,
      screenShareEnabled: true
    }
  },
  MEETING_LARGE: {
    id: 'meeting-large',
    name: 'Sala de Reunião Grande',
    status: 'in-meeting',
    color: '#dc2626',
    icon: '📊',
    behavior: {
      audioDefault: true,
      videoDefault: true,
      screenShareEnabled: true,
      moderatorEnabled: true
    }
  },

  // Social
  LOUNGE: {
    id: 'lounge',
    name: 'Lounge',
    status: 'available',
    color: '#22c55e',
    icon: '☕',
    behavior: {
      audioDefault: true,
      proximityAudio: true,
      informal: true
    }
  },
  CAFE: {
    id: 'cafe',
    name: 'Café',
    status: 'available',
    color: '#84cc16',
    icon: '🍵',
    behavior: {
      audioDefault: true,
      proximityAudio: true,
      informal: true
    }
  },
  WATERCOOLER: {
    id: 'watercooler',
    name: 'Corredor',
    status: 'available',
    color: '#06b6d4',
    icon: '💬',
    behavior: {
      audioDefault: false,
      quickTalkAuto: true,
      transient: true
    }
  },

  // Colaboração
  PAIR_PROGRAMMING: {
    id: 'pair-programming',
    name: 'Pair Programming',
    status: 'collaborating',
    color: '#8b5cf6',
    icon: '👥',
    behavior: {
      audioDefault: true,
      screenShareDefault: true
    }
  },
  WAR_ROOM: {
    id: 'war-room',
    name: 'War Room',
    status: 'urgent',
    color: '#dc2626',
    icon: '🚨',
    behavior: {
      audioDefault: true,
      priority: 'high',
      highlighted: true
    }
  },

  // Gestão
  LEADER_OFFICE: {
    id: 'leader-office',
    name: 'Sala do Líder',
    status: 'available',
    color: '#6366f1',
    icon: '👔',
    behavior: {
      accessControlled: true,
      privateConversation: true
    }
  },
  HR_ROOM: {
    id: 'hr-room',
    name: 'RH / People',
    status: 'private',
    color: '#ec4899',
    icon: '💼',
    behavior: {
      encrypted: true,
      noRecording: true,
      private: true
    }
  },

  // Especiais
  ONBOARDING: {
    id: 'onboarding',
    name: 'Onboarding',
    status: 'available',
    color: '#14b8a6',
    icon: '🎓',
    behavior: {
      guidedTour: true,
      welcomeMessages: true
    }
  },
  SILENCE_ROOM: {
    id: 'silence',
    name: 'Sala de Silêncio',
    status: 'away',
    color: '#64748b',
    icon: '🌿',
    behavior: {
      audioDisabled: true,
      ambientSounds: true,
      mentalHealth: true
    }
  },

  // Externo
  OUTDOOR: {
    id: 'outdoor',
    name: 'Área Externa',
    status: 'available',
    color: '#10b981',
    icon: '🌳',
    behavior: {
      informal: true,
      relaxed: true
    }
  },

  RECEPTION: {
    id: 'reception',
    name: 'Recepção',
    status: 'available',
    color: '#a855f7',
    icon: '🏢',
    behavior: {
      spawnPoint: true
    }
  }
}

export function createOfficeLayout() {
  // Criar tilemap maior: 50x40
  const tileMap = new TileMap(50, 40)
  const walls = []
  const furniture = []
  const zones = []

  // === ÁREA EXTERNA (GRAMA) ===
  tileMap.fillRect(0, 0, 50, 40, TILE_TYPES.GRASS)

  // === CALÇADAS ===
  tileMap.fillRect(3, 3, 44, 2, TILE_TYPES.SIDEWALK) // Superior
  tileMap.fillRect(3, 3, 2, 34, TILE_TYPES.SIDEWALK) // Esquerda
  tileMap.fillRect(3, 35, 44, 2, TILE_TYPES.SIDEWALK) // Inferior
  tileMap.fillRect(45, 3, 2, 34, TILE_TYPES.SIDEWALK) // Direita

  // Corredor central (Watercooler)
  tileMap.fillRect(22, 5, 6, 30, TILE_TYPES.FLOOR_TILE)
  zones.push({ ...ZONES.WATERCOOLER, x: 22, y: 5, width: 6, height: 30 })

  // ============================================
  // LADO ESQUERDO DO ESCRITÓRIO
  // ============================================

  // --- RECEPÇÃO (entrada) ---
  tileMap.fillRect(5, 28, 16, 7, TILE_TYPES.FLOOR_TILE)
  zones.push({ ...ZONES.RECEPTION, x: 5, y: 28, width: 16, height: 7 })

  // Móveis da recepção
  furniture.push(new Furniture(10, 31, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(10, 32, FURNITURE_TYPES.CHAIR, { color: '#a855f7' }))
  furniture.push(new Furniture(11, 31, FURNITURE_TYPES.COMPUTER))
  furniture.push(new Furniture(7, 33, FURNITURE_TYPES.SOFA, { color: '#6b7280' }))
  furniture.push(new Furniture(15, 33, FURNITURE_TYPES.SOFA, { color: '#6b7280' }))
  furniture.push(new Furniture(18, 29, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(6, 29, FURNITURE_TYPES.PLANT_LARGE))

  // --- ONBOARDING ROOM ---
  tileMap.fillRect(5, 22, 8, 5, TILE_TYPES.FLOOR_CARPET_GREEN)
  zones.push({ ...ZONES.ONBOARDING, x: 5, y: 22, width: 8, height: 5 })



  furniture.push(new Furniture(8, 24, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(7, 23, FURNITURE_TYPES.CHAIR, { color: '#14b8a6' }))
  furniture.push(new Furniture(9, 25, FURNITURE_TYPES.CHAIR, { color: '#14b8a6' }))
  furniture.push(new Furniture(11, 23, FURNITURE_TYPES.TV))
  furniture.push(new Furniture(6, 26, FURNITURE_TYPES.PLANT))

  // --- SALA DO LÍDER ---
  tileMap.fillRect(5, 15, 8, 6, TILE_TYPES.FLOOR_WOOD)
  zones.push({ ...ZONES.LEADER_OFFICE, x: 5, y: 15, width: 8, height: 6 })


  furniture.push(new Furniture(8, 17, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(8, 18, FURNITURE_TYPES.CHAIR, { color: '#1e40af' }))
  furniture.push(new Furniture(9, 17, FURNITURE_TYPES.COMPUTER))
  furniture.push(new Furniture(6, 19, FURNITURE_TYPES.CHAIR, { color: '#6b7280' }))
  furniture.push(new Furniture(10, 19, FURNITURE_TYPES.CHAIR, { color: '#6b7280' }))
  furniture.push(new Furniture(11, 16, FURNITURE_TYPES.BOOKSHELF))
  furniture.push(new Furniture(6, 16, FURNITURE_TYPES.PLANT))

  // --- RH / PEOPLE ---
  tileMap.fillRect(5, 8, 8, 6, TILE_TYPES.FLOOR_CARPET_BLUE)
  zones.push({ ...ZONES.HR_ROOM, x: 5, y: 8, width: 8, height: 6 })


  furniture.push(new Furniture(8, 10, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(8, 11, FURNITURE_TYPES.CHAIR, { color: '#ec4899' }))
  furniture.push(new Furniture(9, 10, FURNITURE_TYPES.COMPUTER))
  furniture.push(new Furniture(6, 12, FURNITURE_TYPES.ARMCHAIR, { color: '#ec4899' }))
  furniture.push(new Furniture(10, 12, FURNITURE_TYPES.ARMCHAIR, { color: '#ec4899' }))
  furniture.push(new Furniture(11, 9, FURNITURE_TYPES.FILING_CABINET))
  furniture.push(new Furniture(6, 9, FURNITURE_TYPES.PLANT))

  // --- SALA DE REUNIÃO PEQUENA ---
  tileMap.fillRect(14, 15, 7, 6, TILE_TYPES.FLOOR_CARPET_RED)
  zones.push({ ...ZONES.MEETING_SMALL, x: 14, y: 15, width: 7, height: 6, name: 'Daily Room' })


  furniture.push(new Furniture(17, 18, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(15, 17, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  furniture.push(new Furniture(19, 17, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  furniture.push(new Furniture(15, 19, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  furniture.push(new Furniture(19, 19, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  furniture.push(new Furniture(15, 16, FURNITURE_TYPES.TV))

  // --- SALA DE REUNIÃO GRANDE ---
  tileMap.fillRect(14, 5, 7, 9, TILE_TYPES.FLOOR_CARPET_RED)
  zones.push({ ...ZONES.MEETING_LARGE, x: 14, y: 5, width: 7, height: 9, name: 'War Room' })


  furniture.push(new Furniture(17, 9, FURNITURE_TYPES.TABLE_MEETING))
  furniture.push(new Furniture(15, 7, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(17, 7, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(19, 7, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(15, 11, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(17, 11, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(19, 11, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(15, 6, FURNITURE_TYPES.TV))
  furniture.push(new Furniture(19, 6, FURNITURE_TYPES.WHITEBOARD))

  // ============================================
  // LADO DIREITO DO ESCRITÓRIO
  // ============================================

  // --- WORKSTATIONS (Área de Trabalho Principal) ---
  tileMap.fillRect(29, 5, 16, 14, TILE_TYPES.FLOOR_CARPET_BLUE)
  zones.push({ ...ZONES.WORKSTATION, x: 29, y: 5, width: 16, height: 14 })


  // Fileira 1 de mesas
  for (let i = 0; i < 4; i++) {
    furniture.push(new Furniture(32 + i * 4, 7, FURNITURE_TYPES.DESK))
    furniture.push(new Furniture(32 + i * 4, 8, FURNITURE_TYPES.CHAIR, { color: '#3b82f6' }))
    furniture.push(new Furniture(33 + i * 4, 7, FURNITURE_TYPES.COMPUTER))
  }

  // Fileira 2 de mesas
  for (let i = 0; i < 4; i++) {
    furniture.push(new Furniture(32 + i * 4, 11, FURNITURE_TYPES.DESK))
    furniture.push(new Furniture(32 + i * 4, 12, FURNITURE_TYPES.CHAIR, { color: '#22c55e' }))
    furniture.push(new Furniture(33 + i * 4, 11, FURNITURE_TYPES.COMPUTER))
  }

  // Fileira 3 de mesas
  for (let i = 0; i < 4; i++) {
    furniture.push(new Furniture(32 + i * 4, 15, FURNITURE_TYPES.DESK))
    furniture.push(new Furniture(32 + i * 4, 16, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  }

  // Decoração workstation
  furniture.push(new Furniture(30, 6, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(44, 6, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(30, 18, FURNITURE_TYPES.WATER_COOLER))
  furniture.push(new Furniture(44, 18, FURNITURE_TYPES.BOOKSHELF))

  // --- DEEP WORK ROOM ---
  tileMap.fillRect(29, 20, 8, 6, TILE_TYPES.FLOOR_WOOD)
  zones.push({ ...ZONES.DEEP_WORK, x: 29, y: 20, width: 8, height: 6 })


  // 4 mesas individuais isoladas
  furniture.push(new Furniture(31, 22, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(31, 23, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(35, 22, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(35, 23, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(30, 21, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(36, 25, FURNITURE_TYPES.LAMP))

  // --- PAIR PROGRAMMING ---
  tileMap.fillRect(38, 20, 7, 6, TILE_TYPES.FLOOR_CARPET_BLUE)
  zones.push({ ...ZONES.PAIR_PROGRAMMING, x: 38, y: 20, width: 7, height: 6 })


  furniture.push(new Furniture(41, 22, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(42, 22, FURNITURE_TYPES.COMPUTER))
  furniture.push(new Furniture(40, 23, FURNITURE_TYPES.CHAIR, { color: '#8b5cf6' }))
  furniture.push(new Furniture(43, 23, FURNITURE_TYPES.CHAIR, { color: '#8b5cf6' }))
  furniture.push(new Furniture(39, 21, FURNITURE_TYPES.WHITEBOARD))
  furniture.push(new Furniture(44, 25, FURNITURE_TYPES.PLANT))

  // --- LOUNGE ---
  tileMap.fillRect(29, 27, 16, 8, TILE_TYPES.FLOOR_WOOD)
  zones.push({ ...ZONES.LOUNGE, x: 29, y: 27, width: 16, height: 8 })


  // Tapete grande
  furniture.push(new Furniture(37, 31, FURNITURE_TYPES.RUG, { color: '#7c3aed', gridZ: -0.1 }))

  // Sofás e poltronas
  furniture.push(new Furniture(33, 30, FURNITURE_TYPES.COUCH, { color: '#1e40af' }))
  furniture.push(new Furniture(41, 29, FURNITURE_TYPES.ARMCHAIR, { color: '#065f46' }))
  furniture.push(new Furniture(41, 33, FURNITURE_TYPES.ARMCHAIR, { color: '#065f46' }))

  // Mesa de centro
  furniture.push(new Furniture(37, 31, FURNITURE_TYPES.TABLE_ROUND))

  // TV e decoração
  furniture.push(new Furniture(30, 33, FURNITURE_TYPES.TV))
  furniture.push(new Furniture(30, 28, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(44, 28, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(44, 34, FURNITURE_TYPES.LAMP))

  // --- CAFÉ ---
  tileMap.fillRect(22, 27, 6, 8, TILE_TYPES.FLOOR_TILE)
  zones.push({ ...ZONES.CAFE, x: 22, y: 27, width: 6, height: 8 })

  furniture.push(new Furniture(23, 28, FURNITURE_TYPES.COFFEE_MACHINE))
  furniture.push(new Furniture(26, 28, FURNITURE_TYPES.WATER_COOLER))
  furniture.push(new Furniture(24, 32, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(23, 31, FURNITURE_TYPES.CHAIR, { color: '#84cc16' }))
  furniture.push(new Furniture(25, 33, FURNITURE_TYPES.CHAIR, { color: '#84cc16' }))
  furniture.push(new Furniture(26, 31, FURNITURE_TYPES.CHAIR, { color: '#84cc16' }))

  // --- SALA DE SILÊNCIO ---
  tileMap.fillRect(14, 22, 7, 5, TILE_TYPES.FLOOR_CARPET_GREEN)
  zones.push({ ...ZONES.SILENCE_ROOM, x: 14, y: 22, width: 7, height: 5 })


  furniture.push(new Furniture(16, 24, FURNITURE_TYPES.ARMCHAIR, { color: '#64748b' }))
  furniture.push(new Furniture(19, 24, FURNITURE_TYPES.ARMCHAIR, { color: '#64748b' }))
  furniture.push(new Furniture(15, 23, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(20, 23, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(17, 26, FURNITURE_TYPES.LAMP))

  // === ÁRVORES EXTERNAS ===
  furniture.push(new Furniture(2, 10, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(2, 20, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(2, 30, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(47, 10, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(47, 20, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(47, 30, FURNITURE_TYPES.PLANT_LARGE))

  return {
    tileMap,
    walls,
    furniture,
    zones,
    width: 50,
    height: 40,
    spawnPoint: { x: 12, y: 32 } // Recepção
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

// Obter status baseado na zona
export function getStatusForZone(zone) {
  if (!zone) return 'available'
  return zone.status || 'available'
}

// Obter posições ocupadas por móveis (para pathfinding)
export function getFurnitureObstacles(furniture) {
  const obstacles = []

  for (const item of furniture) {
    const x = Math.floor(item.gridX)
    const y = Math.floor(item.gridY)

    // Posição base
    obstacles.push({ x, y })

    // Móveis maiores ocupam mais tiles
    switch (item.type) {
      case FURNITURE_TYPES.DESK:
      case FURNITURE_TYPES.BOOKSHELF:
        obstacles.push({ x: x + 1, y })
        break

      case FURNITURE_TYPES.SOFA:
        obstacles.push({ x: x - 1, y })
        obstacles.push({ x: x + 1, y })
        break

      case FURNITURE_TYPES.COUCH:
        obstacles.push({ x: x - 1, y })
        obstacles.push({ x: x + 1, y })
        obstacles.push({ x: x - 1, y: y + 1 })
        obstacles.push({ x: x + 1, y: y + 1 })
        break

      case FURNITURE_TYPES.TABLE_MEETING:
        obstacles.push({ x: x - 1, y })
        obstacles.push({ x: x + 1, y })
        obstacles.push({ x, y: y + 1 })
        obstacles.push({ x: x - 1, y: y + 1 })
        obstacles.push({ x: x + 1, y: y + 1 })
        break

      case FURNITURE_TYPES.RUG:
        // Tapete não é obstáculo
        obstacles.pop()
        break
    }
  }

  return obstacles
}

// Labels das zonas para renderização
export function getZoneLabels(zones) {
  return zones.map(zone => ({
    text: `${zone.icon || ''} ${zone.name}`,
    x: zone.x + zone.width / 2,
    y: zone.y + 1,
    color: zone.color
  }))
}
