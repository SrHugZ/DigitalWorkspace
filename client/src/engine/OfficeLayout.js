/**
 * Office Layout Configuration - SoWork Style
 *
 * Layout inspirado no SoWork com:
 * - Água/oceano ao redor do escritório (ilha)
 * - Jardim central com lago e fonte
 * - Deck/terraço externo com guarda-sóis
 * - Árvores coloridas (cerejeiras, pinheiros, normais)
 * - Salas bem definidas com pisos variados
 * - Canteiros de flores e cercas vivas
 */

import { TileMap, TILE_TYPES } from './TileMap.js'
import { Furniture, FURNITURE_TYPES } from './Furniture.js'

// Definição das zonas com comportamentos
export const ZONES = {
  WORKSTATION: {
    id: 'workstation',
    name: 'Workstation',
    status: 'focused',
    color: '#3b82f6',
    icon: '💻',
    behavior: { audioDefault: false, interruptionsAllowed: true, quickTalkEnabled: true }
  },
  DEEP_WORK: {
    id: 'deep-work',
    name: 'Deep Work',
    status: 'busy',
    color: '#ef4444',
    icon: '🎯',
    behavior: { audioDefault: false, interruptionsAllowed: false, quickTalkEnabled: false, warningOnEnter: true }
  },
  MEETING_SMALL: {
    id: 'meeting-small',
    name: 'Sala de Reunião',
    status: 'in-meeting',
    color: '#f59e0b',
    icon: '🗣️',
    behavior: { audioDefault: true, videoDefault: true, screenShareEnabled: true }
  },
  MEETING_LARGE: {
    id: 'meeting-large',
    name: 'Sala de Reunião Grande',
    status: 'in-meeting',
    color: '#dc2626',
    icon: '📊',
    behavior: { audioDefault: true, videoDefault: true, screenShareEnabled: true, moderatorEnabled: true }
  },
  LOUNGE: {
    id: 'lounge',
    name: 'Lounge',
    status: 'available',
    color: '#22c55e',
    icon: '☕',
    behavior: { audioDefault: true, proximityAudio: true, informal: true }
  },
  CAFE: {
    id: 'cafe',
    name: 'Café',
    status: 'available',
    color: '#84cc16',
    icon: '🍵',
    behavior: { audioDefault: true, proximityAudio: true, informal: true }
  },
  WATERCOOLER: {
    id: 'watercooler',
    name: 'Corredor',
    status: 'available',
    color: '#06b6d4',
    icon: '💬',
    behavior: { audioDefault: false, quickTalkAuto: true, transient: true }
  },
  PAIR_PROGRAMMING: {
    id: 'pair-programming',
    name: 'Pair Programming',
    status: 'collaborating',
    color: '#8b5cf6',
    icon: '👥',
    behavior: { audioDefault: true, screenShareDefault: true }
  },
  LEADER_OFFICE: {
    id: 'leader-office',
    name: 'Sala do Líder',
    status: 'available',
    color: '#6366f1',
    icon: '👔',
    behavior: { accessControlled: true, privateConversation: true }
  },
  HR_ROOM: {
    id: 'hr-room',
    name: 'RH / People',
    status: 'private',
    color: '#ec4899',
    icon: '💼',
    behavior: { encrypted: true, noRecording: true, private: true }
  },
  ONBOARDING: {
    id: 'onboarding',
    name: 'Onboarding',
    status: 'available',
    color: '#14b8a6',
    icon: '🎓',
    behavior: { guidedTour: true, welcomeMessages: true }
  },
  SILENCE_ROOM: {
    id: 'silence',
    name: 'Sala de Silêncio',
    status: 'away',
    color: '#64748b',
    icon: '🌿',
    behavior: { audioDisabled: true, ambientSounds: true, mentalHealth: true }
  },
  OUTDOOR: {
    id: 'outdoor',
    name: 'Área Externa',
    status: 'available',
    color: '#10b981',
    icon: '🌳',
    behavior: { informal: true, relaxed: true }
  },
  GARDEN: {
    id: 'garden',
    name: 'Jardim',
    status: 'available',
    color: '#34d399',
    icon: '🌺',
    behavior: { informal: true, relaxed: true }
  },
  RECEPTION: {
    id: 'reception',
    name: 'Recepção',
    status: 'available',
    color: '#a855f7',
    icon: '🏢',
    behavior: { spawnPoint: true }
  },
  DECK: {
    id: 'deck',
    name: 'Terraço',
    status: 'available',
    color: '#d97706',
    icon: '☀️',
    behavior: { informal: true, relaxed: true }
  }
}

export function createOfficeLayout() {
  // Mapa maior: 60x50 para caber água ao redor
  const tileMap = new TileMap(60, 50)
  const walls = []
  const furniture = []
  const zones = []

  // =============================================
  // 1. ÁGUA (OCEANO) AO REDOR DE TUDO
  // =============================================
  tileMap.fillRect(0, 0, 60, 50, TILE_TYPES.WATER)

  // =============================================
  // 2. ILHA / TERRENO PRINCIPAL (grama)
  // =============================================
  // Ilha com formato orgânico - base retangular com bordas suaves
  tileMap.fillRect(6, 5, 48, 40, TILE_TYPES.GRASS)

  // Bordas arredondadas - removendo cantos para parecer ilha
  // Canto superior esquerdo
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3 - i; j++) {
      tileMap.setTile(6 + j, 5 + i, TILE_TYPES.WATER)
    }
  }
  // Canto superior direito
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3 - i; j++) {
      tileMap.setTile(53 - j, 5 + i, TILE_TYPES.WATER)
    }
  }
  // Canto inferior esquerdo
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3 - i; j++) {
      tileMap.setTile(6 + j, 44 - i, TILE_TYPES.WATER)
    }
  }
  // Canto inferior direito
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3 - i; j++) {
      tileMap.setTile(53 - j, 44 - i, TILE_TYPES.WATER)
    }
  }

  // Areia/praia entre água e grama (borda da ilha)
  // Borda superior
  for (let x = 9; x <= 51; x++) {
    tileMap.setTile(x, 5, TILE_TYPES.SAND)
  }
  // Borda inferior
  for (let x = 9; x <= 51; x++) {
    tileMap.setTile(x, 44, TILE_TYPES.SAND)
  }
  // Borda esquerda
  for (let y = 8; y <= 41; y++) {
    tileMap.setTile(6, y, TILE_TYPES.SAND)
  }
  // Borda direita
  for (let y = 8; y <= 41; y++) {
    tileMap.setTile(53, y, TILE_TYPES.SAND)
  }

  // =============================================
  // 3. CAMINHOS DE PEDRA CONECTANDO ÁREAS
  // =============================================
  // Caminho central horizontal
  tileMap.fillRect(10, 24, 40, 2, TILE_TYPES.PATH_STONE)
  // Caminho central vertical
  tileMap.fillRect(29, 8, 2, 34, TILE_TYPES.PATH_STONE)
  // Caminho para deck esquerdo
  tileMap.fillRect(7, 24, 3, 2, TILE_TYPES.PATH_STONE)
  // Caminho para deck direito
  tileMap.fillRect(50, 24, 3, 2, TILE_TYPES.PATH_STONE)

  // =============================================
  // 4. PRÉDIO PRINCIPAL (ALA ESQUERDA)
  // =============================================

  // --- RECEPÇÃO (entrada sul-esquerda) ---
  tileMap.fillRect(10, 32, 12, 8, TILE_TYPES.FLOOR_TILE)
  zones.push({ ...ZONES.RECEPTION, x: 10, y: 32, width: 12, height: 8 })

  furniture.push(new Furniture(14, 35, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(14, 36, FURNITURE_TYPES.CHAIR, { color: '#a855f7' }))
  furniture.push(new Furniture(15, 35, FURNITURE_TYPES.COMPUTER))
  furniture.push(new Furniture(11, 37, FURNITURE_TYPES.SOFA, { color: '#6b7280' }))
  furniture.push(new Furniture(19, 37, FURNITURE_TYPES.SOFA, { color: '#6b7280' }))
  furniture.push(new Furniture(20, 33, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(11, 33, FURNITURE_TYPES.PLANT_LARGE))

  // --- SALA DO LÍDER ---
  tileMap.fillRect(10, 8, 8, 7, TILE_TYPES.FLOOR_WOOD)
  zones.push({ ...ZONES.LEADER_OFFICE, x: 10, y: 8, width: 8, height: 7 })

  furniture.push(new Furniture(13, 10, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(13, 11, FURNITURE_TYPES.CHAIR, { color: '#1e40af' }))
  furniture.push(new Furniture(14, 10, FURNITURE_TYPES.COMPUTER))
  furniture.push(new Furniture(11, 12, FURNITURE_TYPES.CHAIR, { color: '#6b7280' }))
  furniture.push(new Furniture(15, 12, FURNITURE_TYPES.CHAIR, { color: '#6b7280' }))
  furniture.push(new Furniture(16, 9, FURNITURE_TYPES.BOOKSHELF))
  furniture.push(new Furniture(11, 9, FURNITURE_TYPES.PLANT))

  // --- RH / PEOPLE ---
  tileMap.fillRect(19, 8, 8, 7, TILE_TYPES.FLOOR_CARPET_BLUE)
  zones.push({ ...ZONES.HR_ROOM, x: 19, y: 8, width: 8, height: 7 })

  furniture.push(new Furniture(22, 10, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(22, 11, FURNITURE_TYPES.CHAIR, { color: '#ec4899' }))
  furniture.push(new Furniture(23, 10, FURNITURE_TYPES.COMPUTER))
  furniture.push(new Furniture(20, 12, FURNITURE_TYPES.ARMCHAIR, { color: '#ec4899' }))
  furniture.push(new Furniture(24, 12, FURNITURE_TYPES.ARMCHAIR, { color: '#ec4899' }))
  furniture.push(new Furniture(25, 9, FURNITURE_TYPES.FILING_CABINET))

  // --- SALA DE REUNIÃO (DAILY ROOM) ---
  tileMap.fillRect(10, 16, 8, 7, TILE_TYPES.FLOOR_CARPET_RED)
  zones.push({ ...ZONES.MEETING_SMALL, x: 10, y: 16, width: 8, height: 7, name: 'Daily Room' })

  furniture.push(new Furniture(13, 19, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(11, 18, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  furniture.push(new Furniture(15, 18, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  furniture.push(new Furniture(11, 20, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  furniture.push(new Furniture(15, 20, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  furniture.push(new Furniture(11, 17, FURNITURE_TYPES.TV))

  // --- ONBOARDING ---
  tileMap.fillRect(19, 16, 8, 7, TILE_TYPES.FLOOR_CARPET_GREEN)
  zones.push({ ...ZONES.ONBOARDING, x: 19, y: 16, width: 8, height: 7 })

  furniture.push(new Furniture(22, 19, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(20, 18, FURNITURE_TYPES.CHAIR, { color: '#14b8a6' }))
  furniture.push(new Furniture(24, 18, FURNITURE_TYPES.CHAIR, { color: '#14b8a6' }))
  furniture.push(new Furniture(25, 17, FURNITURE_TYPES.TV))
  furniture.push(new Furniture(20, 21, FURNITURE_TYPES.PLANT))

  // =============================================
  // 5. PRÉDIO PRINCIPAL (ALA DIREITA)
  // =============================================

  // --- WORKSTATIONS (grande área de trabalho) ---
  tileMap.fillRect(33, 8, 16, 14, TILE_TYPES.FLOOR_CARPET_BLUE)
  zones.push({ ...ZONES.WORKSTATION, x: 33, y: 8, width: 16, height: 14 })

  // Fileira 1
  for (let i = 0; i < 4; i++) {
    furniture.push(new Furniture(36 + i * 4, 10, FURNITURE_TYPES.DESK))
    furniture.push(new Furniture(36 + i * 4, 11, FURNITURE_TYPES.CHAIR, { color: '#3b82f6' }))
    furniture.push(new Furniture(37 + i * 4, 10, FURNITURE_TYPES.COMPUTER))
  }
  // Fileira 2
  for (let i = 0; i < 4; i++) {
    furniture.push(new Furniture(36 + i * 4, 14, FURNITURE_TYPES.DESK))
    furniture.push(new Furniture(36 + i * 4, 15, FURNITURE_TYPES.CHAIR, { color: '#22c55e' }))
    furniture.push(new Furniture(37 + i * 4, 14, FURNITURE_TYPES.COMPUTER))
  }
  // Fileira 3
  for (let i = 0; i < 4; i++) {
    furniture.push(new Furniture(36 + i * 4, 18, FURNITURE_TYPES.DESK))
    furniture.push(new Furniture(36 + i * 4, 19, FURNITURE_TYPES.CHAIR, { color: '#f59e0b' }))
  }

  furniture.push(new Furniture(34, 9, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(48, 9, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(34, 21, FURNITURE_TYPES.WATER_COOLER))

  // --- SALA DE REUNIÃO GRANDE ---
  tileMap.fillRect(33, 23, 8, 8, TILE_TYPES.FLOOR_CARPET_RED)
  zones.push({ ...ZONES.MEETING_LARGE, x: 33, y: 23, width: 8, height: 8, name: 'War Room' })

  furniture.push(new Furniture(36, 27, FURNITURE_TYPES.TABLE_MEETING))
  furniture.push(new Furniture(34, 25, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(36, 25, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(38, 25, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(34, 29, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(36, 29, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(38, 29, FURNITURE_TYPES.CHAIR, { color: '#dc2626' }))
  furniture.push(new Furniture(34, 24, FURNITURE_TYPES.TV))
  furniture.push(new Furniture(39, 24, FURNITURE_TYPES.WHITEBOARD))

  // --- DEEP WORK ---
  tileMap.fillRect(42, 23, 7, 6, TILE_TYPES.FLOOR_WOOD)
  zones.push({ ...ZONES.DEEP_WORK, x: 42, y: 23, width: 7, height: 6 })

  furniture.push(new Furniture(44, 25, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(44, 26, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(47, 25, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(47, 26, FURNITURE_TYPES.CHAIR, { color: '#ef4444' }))
  furniture.push(new Furniture(43, 24, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(48, 28, FURNITURE_TYPES.LAMP))

  // --- PAIR PROGRAMMING ---
  tileMap.fillRect(42, 30, 7, 6, TILE_TYPES.FLOOR_CARPET_PURPLE)
  zones.push({ ...ZONES.PAIR_PROGRAMMING, x: 42, y: 30, width: 7, height: 6 })

  furniture.push(new Furniture(45, 32, FURNITURE_TYPES.DESK))
  furniture.push(new Furniture(46, 32, FURNITURE_TYPES.COMPUTER))
  furniture.push(new Furniture(44, 33, FURNITURE_TYPES.CHAIR, { color: '#8b5cf6' }))
  furniture.push(new Furniture(47, 33, FURNITURE_TYPES.CHAIR, { color: '#8b5cf6' }))
  furniture.push(new Furniture(43, 31, FURNITURE_TYPES.WHITEBOARD))
  furniture.push(new Furniture(48, 35, FURNITURE_TYPES.PLANT))

  // --- LOUNGE ---
  tileMap.fillRect(33, 32, 8, 8, TILE_TYPES.FLOOR_WOOD)
  zones.push({ ...ZONES.LOUNGE, x: 33, y: 32, width: 8, height: 8 })

  furniture.push(new Furniture(37, 36, FURNITURE_TYPES.RUG, { color: '#7c3aed', gridZ: -0.1 }))
  furniture.push(new Furniture(35, 35, FURNITURE_TYPES.COUCH, { color: '#1e40af' }))
  furniture.push(new Furniture(39, 34, FURNITURE_TYPES.ARMCHAIR, { color: '#065f46' }))
  furniture.push(new Furniture(39, 37, FURNITURE_TYPES.ARMCHAIR, { color: '#065f46' }))
  furniture.push(new Furniture(37, 36, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(34, 38, FURNITURE_TYPES.TV))
  furniture.push(new Furniture(34, 33, FURNITURE_TYPES.PLANT_LARGE))
  furniture.push(new Furniture(40, 33, FURNITURE_TYPES.LAMP))

  // =============================================
  // 6. JARDIM CENTRAL COM LAGO
  // =============================================
  tileMap.fillRect(19, 26, 10, 6, TILE_TYPES.GARDEN)
  zones.push({ ...ZONES.GARDEN, x: 19, y: 26, width: 10, height: 6 })

  // Lago/fonte no centro do jardim
  furniture.push(new Furniture(24, 29, FURNITURE_TYPES.FOUNTAIN))

  // Canteiros de flores
  furniture.push(new Furniture(20, 27, FURNITURE_TYPES.FLOWER_BED))
  furniture.push(new Furniture(27, 27, FURNITURE_TYPES.FLOWER_BED, { color: '#cc66ff' }))
  furniture.push(new Furniture(20, 31, FURNITURE_TYPES.FLOWER_BED, { color: '#ffcc00' }))
  furniture.push(new Furniture(27, 31, FURNITURE_TYPES.FLOWER_BED, { color: '#ff6b8a' }))

  // Bancos no jardim
  furniture.push(new Furniture(22, 28, FURNITURE_TYPES.BENCH))
  furniture.push(new Furniture(26, 30, FURNITURE_TYPES.BENCH))

  // =============================================
  // 7. CAFÉ / COZINHA
  // =============================================
  tileMap.fillRect(10, 26, 8, 5, TILE_TYPES.FLOOR_TILE)
  zones.push({ ...ZONES.CAFE, x: 10, y: 26, width: 8, height: 5 })

  furniture.push(new Furniture(12, 27, FURNITURE_TYPES.COFFEE_MACHINE))
  furniture.push(new Furniture(14, 27, FURNITURE_TYPES.WATER_COOLER))
  furniture.push(new Furniture(13, 29, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(12, 28, FURNITURE_TYPES.CHAIR, { color: '#84cc16' }))
  furniture.push(new Furniture(14, 30, FURNITURE_TYPES.CHAIR, { color: '#84cc16' }))
  furniture.push(new Furniture(16, 28, FURNITURE_TYPES.TABLE_ROUND))
  furniture.push(new Furniture(15, 29, FURNITURE_TYPES.CHAIR, { color: '#84cc16' }))
  furniture.push(new Furniture(17, 29, FURNITURE_TYPES.CHAIR, { color: '#84cc16' }))

  // --- SALA DE SILÊNCIO ---
  tileMap.fillRect(10, 41, 8, 3, TILE_TYPES.FLOOR_CARPET_GREEN)
  zones.push({ ...ZONES.SILENCE_ROOM, x: 10, y: 41, width: 8, height: 3 })

  furniture.push(new Furniture(12, 42, FURNITURE_TYPES.ARMCHAIR, { color: '#64748b' }))
  furniture.push(new Furniture(16, 42, FURNITURE_TYPES.ARMCHAIR, { color: '#64748b' }))
  furniture.push(new Furniture(14, 42, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(17, 41, FURNITURE_TYPES.LAMP))

  // =============================================
  // 8. DECK / TERRAÇO ESQUERDO (beira d'água)
  // =============================================
  tileMap.fillRect(7, 16, 2, 16, TILE_TYPES.DECK)
  zones.push({ ...ZONES.DECK, x: 7, y: 16, width: 2, height: 16, name: 'Deck Oeste' })

  furniture.push(new Furniture(8, 20, FURNITURE_TYPES.UMBRELLA, { color: '#e05050' }))
  furniture.push(new Furniture(8, 28, FURNITURE_TYPES.UMBRELLA, { color: '#3b82f6' }))
  furniture.push(new Furniture(8, 24, FURNITURE_TYPES.BENCH))

  // =============================================
  // 9. DECK / TERRAÇO DIREITO (beira d'água)
  // =============================================
  tileMap.fillRect(51, 16, 2, 16, TILE_TYPES.DECK)
  zones.push({ ...ZONES.DECK, x: 51, y: 16, width: 2, height: 16, name: 'Deck Leste' })

  furniture.push(new Furniture(52, 20, FURNITURE_TYPES.UMBRELLA, { color: '#f59e0b' }))
  furniture.push(new Furniture(52, 28, FURNITURE_TYPES.UMBRELLA, { color: '#22c55e' }))
  furniture.push(new Furniture(52, 24, FURNITURE_TYPES.BENCH))

  // =============================================
  // 10. CORREDOR PRINCIPAL (WATERCOOLER)
  // =============================================
  tileMap.fillRect(29, 8, 3, 34, TILE_TYPES.FLOOR_TILE)
  zones.push({ ...ZONES.WATERCOOLER, x: 29, y: 8, width: 3, height: 34 })

  // =============================================
  // 11. ÁRVORES E PAISAGISMO
  // =============================================

  // Árvores verdes ao redor do escritório
  furniture.push(new Furniture(9, 7, FURNITURE_TYPES.TREE, { color: '#2d8a4e' }))
  furniture.push(new Furniture(15, 6, FURNITURE_TYPES.TREE, { color: '#1a7a3a' }))
  furniture.push(new Furniture(22, 6, FURNITURE_TYPES.TREE, { color: '#3a9a5e' }))
  furniture.push(new Furniture(37, 6, FURNITURE_TYPES.TREE, { color: '#2d8a4e' }))
  furniture.push(new Furniture(44, 6, FURNITURE_TYPES.TREE_PINE, { color: '#1a7040' }))
  furniture.push(new Furniture(50, 7, FURNITURE_TYPES.TREE, { color: '#3a9a5e' }))

  // Cerejeiras na entrada e jardim
  furniture.push(new Furniture(12, 42, FURNITURE_TYPES.TREE_CHERRY))
  furniture.push(new Furniture(28, 33, FURNITURE_TYPES.TREE_CHERRY))
  furniture.push(new Furniture(20, 33, FURNITURE_TYPES.TREE_CHERRY))

  // Pinheiros decorativos
  furniture.push(new Furniture(9, 14, FURNITURE_TYPES.TREE_PINE, { color: '#1a6a30' }))
  furniture.push(new Furniture(50, 14, FURNITURE_TYPES.TREE_PINE, { color: '#1a7040' }))
  furniture.push(new Furniture(50, 36, FURNITURE_TYPES.TREE_PINE, { color: '#1a6a30' }))
  furniture.push(new Furniture(9, 36, FURNITURE_TYPES.TREE_PINE, { color: '#1a7040' }))

  // Árvores grandes variadas
  furniture.push(new Furniture(30, 6, FURNITURE_TYPES.TREE, { color: '#4aaa6e' }))
  furniture.push(new Furniture(48, 43, FURNITURE_TYPES.TREE, { color: '#2d8a4e' }))
  furniture.push(new Furniture(12, 44, FURNITURE_TYPES.TREE, { color: '#3a9a5e' }))
  furniture.push(new Furniture(40, 43, FURNITURE_TYPES.TREE, { color: '#1a7a3a' }))
  furniture.push(new Furniture(20, 44, FURNITURE_TYPES.TREE_CHERRY))

  // Cercas vivas ao redor das áreas internas
  furniture.push(new Furniture(10, 15, FURNITURE_TYPES.HEDGE))
  furniture.push(new Furniture(14, 15, FURNITURE_TYPES.HEDGE))
  furniture.push(new Furniture(19, 15, FURNITURE_TYPES.HEDGE))
  furniture.push(new Furniture(23, 15, FURNITURE_TYPES.HEDGE))
  furniture.push(new Furniture(33, 22, FURNITURE_TYPES.HEDGE))
  furniture.push(new Furniture(37, 22, FURNITURE_TYPES.HEDGE))
  furniture.push(new Furniture(42, 22, FURNITURE_TYPES.HEDGE))
  furniture.push(new Furniture(46, 22, FURNITURE_TYPES.HEDGE))

  // Plantas menores pela ilha
  furniture.push(new Furniture(28, 7, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(32, 7, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(28, 42, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(32, 42, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(7, 10, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(53, 10, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(7, 38, FURNITURE_TYPES.PLANT))
  furniture.push(new Furniture(53, 38, FURNITURE_TYPES.PLANT))

  // Lago extra no canto da ilha
  furniture.push(new Furniture(46, 40, FURNITURE_TYPES.POND))

  return {
    tileMap,
    walls,
    furniture,
    zones,
    width: 60,
    height: 50,
    spawnPoint: { x: 15, y: 35 } // Recepção
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
      case FURNITURE_TYPES.FLOWER_BED:
        obstacles.pop() // Não é obstáculo
        break

      case FURNITURE_TYPES.POND:
      case FURNITURE_TYPES.FOUNTAIN:
        obstacles.push({ x: x - 1, y })
        obstacles.push({ x: x + 1, y })
        obstacles.push({ x, y: y - 1 })
        obstacles.push({ x, y: y + 1 })
        break

      case FURNITURE_TYPES.TREE:
      case FURNITURE_TYPES.TREE_PINE:
      case FURNITURE_TYPES.TREE_CHERRY:
        // Árvore ocupa só o tronco
        break

      case FURNITURE_TYPES.HEDGE:
        obstacles.push({ x: x - 1, y })
        obstacles.push({ x: x + 1, y })
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
