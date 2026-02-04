/**
 * WebRTC Signaling Handler
 *
 * Gerencia a troca de sinais para estabelecer conexões peer-to-peer
 * entre usuários que estão próximos no escritório virtual.
 *
 * Fluxo:
 * 1. Usuário A se aproxima de B (proximity-start)
 * 2. A cria offer e envia via servidor
 * 3. B recebe offer, cria answer e envia via servidor
 * 4. Ambos trocam ICE candidates
 * 5. Conexão P2P estabelecida para áudio/vídeo
 */

export class WebRTCSignaling {
  constructor(wss, roomManager) {
    this.wss = wss
    this.roomManager = roomManager
    this.pendingOffers = new Map() // targetUserId -> offer
  }

  handleOffer(fromClient, targetUserId, offer) {
    const targetClient = this.findClientById(targetUserId)
    if (targetClient) {
      targetClient.send(JSON.stringify({
        type: 'offer',
        fromUserId: fromClient.clientId,
        offer
      }))
    }
  }

  handleAnswer(fromClient, targetUserId, answer) {
    const targetClient = this.findClientById(targetUserId)
    if (targetClient) {
      targetClient.send(JSON.stringify({
        type: 'answer',
        fromUserId: fromClient.clientId,
        answer
      }))
    }
  }

  handleIceCandidate(fromClient, targetUserId, candidate) {
    const targetClient = this.findClientById(targetUserId)
    if (targetClient) {
      targetClient.send(JSON.stringify({
        type: 'ice-candidate',
        fromUserId: fromClient.clientId,
        candidate
      }))
    }
  }

  findClientById(clientId) {
    for (const client of this.wss.clients) {
      if (client.clientId === clientId && client.readyState === 1) {
        return client
      }
    }
    return null
  }

  // Inicia processo de conexão quando há proximidade
  initiateConnection(user1Id, user2Id) {
    const client1 = this.findClientById(user1Id)
    const client2 = this.findClientById(user2Id)

    if (client1 && client2) {
      // Notificar cliente 1 para iniciar conexão
      client1.send(JSON.stringify({
        type: 'initiate-call',
        targetUserId: user2Id
      }))
    }
  }

  // Encerra conexão quando usuários se afastam
  terminateConnection(user1Id, user2Id) {
    const client1 = this.findClientById(user1Id)
    const client2 = this.findClientById(user2Id)

    if (client1) {
      client1.send(JSON.stringify({
        type: 'terminate-call',
        targetUserId: user2Id
      }))
    }

    if (client2) {
      client2.send(JSON.stringify({
        type: 'terminate-call',
        targetUserId: user1Id
      }))
    }
  }
}
