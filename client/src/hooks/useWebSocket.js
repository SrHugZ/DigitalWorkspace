import { useState, useEffect, useCallback, useRef } from 'react'

export function useWebSocket(url) {
  const [isConnected, setIsConnected] = useState(false)
  const [clientId, setClientId] = useState(null)
  const [lastMessage, setLastMessage] = useState(null)
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket conectado')
        setIsConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'connected') {
            setClientId(message.clientId)
          }

          setLastMessage(message)
        } catch (error) {
          console.error('Erro ao processar mensagem:', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket desconectado')
        setIsConnected(false)
        setClientId(null)

        // Reconectar após 3 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Tentando reconectar...')
          connect()
        }, 3000)
      }

      ws.onerror = (error) => {
        console.error('Erro WebSocket:', error)
      }
    } catch (error) {
      console.error('Erro ao conectar:', error)
    }
  }, [url])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  return {
    isConnected,
    clientId,
    lastMessage,
    send
  }
}
