import { Room } from './Room.js'

export class RoomManager {
  constructor() {
    this.rooms = new Map()
    this.clientRooms = new Map() // clientId -> roomId
  }

  createRoom(id, config) {
    const room = new Room(id, config)
    this.rooms.set(id, room)
    return room
  }

  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  getRoomByClient(clientId) {
    const roomId = this.clientRooms.get(clientId)
    return roomId ? this.rooms.get(roomId) : null
  }

  joinRoom(roomId, clientId, userData) {
    const room = this.rooms.get(roomId)
    if (!room) return null

    // Sair da sala anterior se existir
    const previousRoomId = this.clientRooms.get(clientId)
    if (previousRoomId && previousRoomId !== roomId) {
      const previousRoom = this.rooms.get(previousRoomId)
      if (previousRoom) {
        previousRoom.removeUser(clientId)
      }
    }

    this.clientRooms.set(clientId, roomId)
    return room.addUser(clientId, userData)
  }

  leaveRoom(clientId) {
    const roomId = this.clientRooms.get(clientId)
    if (!roomId) return null

    const room = this.rooms.get(roomId)
    if (room) {
      const user = room.removeUser(clientId)
      this.clientRooms.delete(clientId)
      return { room, user }
    }
    return null
  }

  getRoomsList() {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      userCount: room.getUserCount()
    }))
  }
}
