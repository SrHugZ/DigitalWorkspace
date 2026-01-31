const PROXIMITY_THRESHOLD = 150 // Distância para iniciar conversa

export class Room {
  constructor(id, config) {
    this.id = id
    this.name = config.name
    this.width = config.width
    this.height = config.height
    this.zones = config.zones || []
    this.users = new Map()
    this.proximityGroups = new Map() // Grupos de usuários próximos
  }

  addUser(clientId, userData) {
    const user = {
      id: clientId,
      name: userData.name,
      avatar: userData.avatar || this.generateAvatar(),
      x: userData.x || 800,
      y: userData.y || 450,
      status: 'available',
      currentZone: null,
      joinedAt: Date.now()
    }

    user.currentZone = this.getZoneAt(user.x, user.y)
    user.status = this.getStatusByZone(user.currentZone)

    this.users.set(clientId, user)
    return user
  }

  removeUser(clientId) {
    const user = this.users.get(clientId)
    this.users.delete(clientId)
    this.updateProximityGroups()
    return user
  }

  getUser(clientId) {
    return this.users.get(clientId)
  }

  getAllUsers() {
    return Array.from(this.users.values())
  }

  getUserCount() {
    return this.users.size
  }

  updateUserPosition(clientId, x, y) {
    const user = this.users.get(clientId)
    if (!user) return null

    user.x = Math.max(0, Math.min(this.width, x))
    user.y = Math.max(0, Math.min(this.height, y))

    const newZone = this.getZoneAt(user.x, user.y)
    const zoneChanged = user.currentZone?.id !== newZone?.id

    user.currentZone = newZone
    user.status = this.getStatusByZone(newZone)

    // Calcular proximidades
    const proximityChanges = this.updateProximityGroups()

    return {
      user,
      zoneChanged,
      proximityChanges
    }
  }

  getZoneAt(x, y) {
    return this.zones.find(zone =>
      x >= zone.x &&
      x <= zone.x + zone.width &&
      y >= zone.y &&
      y <= zone.y + zone.height
    ) || null
  }

  getStatusByZone(zone) {
    if (!zone) return 'available'

    switch (zone.type) {
      case 'workstation':
        return 'focused'
      case 'meeting':
        return 'in-meeting'
      case 'lounge':
        return 'available'
      default:
        return 'available'
    }
  }

  calculateDistance(user1, user2) {
    const dx = user1.x - user2.x
    const dy = user1.y - user2.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  updateProximityGroups() {
    const changes = {
      newConnections: [],
      disconnections: []
    }

    const users = Array.from(this.users.values())
    const newGroups = new Map()
    const processed = new Set()

    for (const user of users) {
      if (processed.has(user.id)) continue

      const nearbyUsers = users.filter(other => {
        if (other.id === user.id) return false
        return this.calculateDistance(user, other) <= PROXIMITY_THRESHOLD
      })

      if (nearbyUsers.length > 0) {
        const groupId = [user.id, ...nearbyUsers.map(u => u.id)].sort().join('-')
        const group = {
          id: groupId,
          members: [user.id, ...nearbyUsers.map(u => u.id)]
        }
        newGroups.set(groupId, group)

        group.members.forEach(id => processed.add(id))
      }
    }

    // Detectar mudanças
    const oldGroupIds = new Set(this.proximityGroups.keys())
    const newGroupIds = new Set(newGroups.keys())

    for (const groupId of newGroupIds) {
      if (!oldGroupIds.has(groupId)) {
        changes.newConnections.push(newGroups.get(groupId))
      }
    }

    for (const groupId of oldGroupIds) {
      if (!newGroupIds.has(groupId)) {
        changes.disconnections.push(this.proximityGroups.get(groupId))
      }
    }

    this.proximityGroups = newGroups
    return changes
  }

  getProximityGroup(userId) {
    for (const group of this.proximityGroups.values()) {
      if (group.members.includes(userId)) {
        return group
      }
    }
    return null
  }

  generateAvatar() {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    return {
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: '😊'
    }
  }

  getState() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      zones: this.zones,
      users: this.getAllUsers(),
      proximityGroups: Array.from(this.proximityGroups.values())
    }
  }
}
