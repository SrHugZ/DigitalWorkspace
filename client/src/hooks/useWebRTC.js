import { useState, useEffect, useRef, useCallback } from 'react'

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
]

export function useWebRTC(wsConnection, proximityGroup, clientId) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState(new Map())
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [connectionState, setConnectionState] = useState('disconnected')

  const peerConnections = useRef(new Map())
  const localStreamRef = useRef(null)

  // Obter mídia local
  const startLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        }
      })

      localStreamRef.current = stream
      setLocalStream(stream)
      return stream
    } catch (error) {
      console.error('Erro ao obter mídia:', error)
      // Tentar apenas áudio se vídeo falhar
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStreamRef.current = audioStream
        setLocalStream(audioStream)
        return audioStream
      } catch (audioError) {
        console.error('Erro ao obter áudio:', audioError)
        return null
      }
    }
  }, [])

  // Parar mídia local
  const stopLocalMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
      setLocalStream(null)
    }
  }, [])

  // Criar peer connection
  const createPeerConnection = useCallback((targetUserId) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

    // Adicionar tracks locais
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current)
      })
    }

    // Handler para ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsConnection) {
        wsConnection.send({
          type: 'ice-candidate',
          targetUserId,
          candidate: event.candidate
        })
      }
    }

    // Handler para tracks remotos
    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        const newMap = new Map(prev)
        newMap.set(targetUserId, event.streams[0])
        return newMap
      })
    }

    // Handler para estado de conexão
    pc.onconnectionstatechange = () => {
      setConnectionState(pc.connectionState)
    }

    peerConnections.current.set(targetUserId, pc)
    return pc
  }, [wsConnection])

  // Criar e enviar offer
  const createOffer = useCallback(async (targetUserId) => {
    let pc = peerConnections.current.get(targetUserId)
    if (!pc) {
      pc = createPeerConnection(targetUserId)
    }

    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      if (wsConnection) {
        wsConnection.send({
          type: 'offer',
          targetUserId,
          offer: pc.localDescription
        })
      }
    } catch (error) {
      console.error('Erro ao criar offer:', error)
    }
  }, [createPeerConnection, wsConnection])

  // Processar offer recebido
  const handleOffer = useCallback(async (fromUserId, offer) => {
    let pc = peerConnections.current.get(fromUserId)
    if (!pc) {
      pc = createPeerConnection(fromUserId)
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      if (wsConnection) {
        wsConnection.send({
          type: 'answer',
          targetUserId: fromUserId,
          answer: pc.localDescription
        })
      }
    } catch (error) {
      console.error('Erro ao processar offer:', error)
    }
  }, [createPeerConnection, wsConnection])

  // Processar answer recebido
  const handleAnswer = useCallback(async (fromUserId, answer) => {
    const pc = peerConnections.current.get(fromUserId)
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      } catch (error) {
        console.error('Erro ao processar answer:', error)
      }
    }
  }, [])

  // Processar ICE candidate recebido
  const handleIceCandidate = useCallback(async (fromUserId, candidate) => {
    const pc = peerConnections.current.get(fromUserId)
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (error) {
        console.error('Erro ao adicionar ICE candidate:', error)
      }
    }
  }, [])

  // Fechar conexão com um peer
  const closePeerConnection = useCallback((userId) => {
    const pc = peerConnections.current.get(userId)
    if (pc) {
      pc.close()
      peerConnections.current.delete(userId)
      setRemoteStreams(prev => {
        const newMap = new Map(prev)
        newMap.delete(userId)
        return newMap
      })
    }
  }, [])

  // Fechar todas as conexões
  const closeAllConnections = useCallback(() => {
    peerConnections.current.forEach((pc, userId) => {
      pc.close()
    })
    peerConnections.current.clear()
    setRemoteStreams(new Map())
    stopLocalMedia()
  }, [stopLocalMedia])

  // Toggle áudio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }, [])

  // Toggle vídeo
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }, [])

  // Iniciar mídia quando entrar em proximidade
  useEffect(() => {
    if (proximityGroup && proximityGroup.members.length > 1) {
      if (!localStreamRef.current) {
        startLocalMedia().then((stream) => {
          if (stream) {
            // Iniciar chamada com outros membros do grupo
            proximityGroup.members.forEach(memberId => {
              if (memberId !== clientId) {
                createOffer(memberId)
              }
            })
          }
        })
      }
    } else {
      // Sair de proximidade - fechar conexões
      closeAllConnections()
    }
  }, [proximityGroup, clientId, startLocalMedia, createOffer, closeAllConnections])

  return {
    localStream,
    remoteStreams,
    isAudioEnabled,
    isVideoEnabled,
    connectionState,
    toggleAudio,
    toggleVideo,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    closeAllConnections
  }
}
