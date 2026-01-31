# Digital Workspace

## Plataforma de Escritório Virtual Colaborativo

> "Trabalhe remotamente como se estivesse no mesmo escritório."

Uma plataforma que recria, no digital, os elementos invisíveis do escritório físico: **presença**, **contexto**, **espontaneidade** e **proximidade humana**.

---

## Visão Geral

O Digital Workspace substitui a lógica fragmentada de links, agendas e notificações por um **ambiente persistente**, visual e vivo. Não é apenas uma ferramenta de reunião, mas um **lugar digital contínuo** onde o trabalho acontece.

### Problema que resolvemos

O trabalho remoto falhou em três pontos críticos:
- Quebrou a percepção de presença
- Formalizou excessivamente interações simples
- Gerou isolamento cognitivo e social

### Nossa tese

> Se as pessoas conseguem **ver**, **sentir** e **entender** o que está acontecendo ao redor delas, a colaboração acontece naturalmente.

---

## Funcionalidades do MVP

### Escritório 2D Interativo
- Mapa visual do escritório com zonas distintas
- Workstations, salas de reunião e área de lounge
- Grid responsivo que se adapta à tela

### Sistema de Avatares
- Avatares coloridos com emojis personalizáveis
- Movimento fluido por clique
- Indicadores de status em tempo real

### Mecânica de Proximidade
- **Distância espacial define interação**
- Aproximação automática detecta colegas próximos
- Linhas visuais conectam usuários em conversa
- Chat contextual por proximidade

### Status Automático
- **Mesa** = Focado
- **Sala de Reunião** = Em reunião
- **Lounge** = Disponível

---

## Stack Técnica

### Frontend
- **React 18** - UI reativa
- **Vite** - Build tool moderna
- **Canvas 2D** - Renderização do escritório
- **WebSocket** - Comunicação em tempo real

### Backend
- **Node.js** - Runtime
- **ws** - WebSocket server
- **WebRTC** (preparado) - Áudio/vídeo P2P

---

## Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd DigitalWorkspace

# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev
```

O servidor iniciará na porta **8080** e o cliente na porta **3000**.

### Executar separadamente

```bash
# Terminal 1 - Servidor
npm run dev:server

# Terminal 2 - Cliente
npm run dev:client
```

---

## Estrutura do Projeto

```
digital-workspace/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Office/     # Canvas 2D do escritório
│   │   │   ├── UI/         # Componentes de interface
│   │   │   └── VideoChat/  # Overlay de vídeo/chat
│   │   ├── contexts/       # Estado global (WorkspaceContext)
│   │   ├── hooks/          # Hooks customizados
│   │   └── styles/         # CSS global
│   └── package.json
│
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── rooms/          # Gerenciamento de salas
│   │   ├── websocket/      # Handlers de mensagens
│   │   └── signaling/      # WebRTC signaling
│   └── package.json
│
└── package.json            # Monorepo config
```

---

## Arquitetura

```
┌─────────────┐     WebSocket      ┌─────────────┐
│   Client    │◄──────────────────►│   Server    │
│   (React)   │                    │  (Node.js)  │
└─────────────┘                    └─────────────┘
      │                                   │
      │  Canvas 2D                        │  Room Manager
      │  Avatar System                    │  Proximity Engine
      │  WebRTC (P2P)                     │  WebRTC Signaling
      │                                   │
      ▼                                   ▼
 ┌─────────────┐                  ┌─────────────┐
 │  Browser    │◄────────────────►│  Browser    │
 │  (User A)   │      WebRTC      │  (User B)   │
 └─────────────┘                  └─────────────┘
```

---

## Roadmap

### Fase 1 - MVP
- [x] Escritório 2D básico
- [x] Sistema de avatares
- [x] Mecânica de proximidade
- [x] Chat por proximidade
- [x] Status automático por zona

### Fase 2 - Colaboração
- [ ] WebRTC completo (áudio/vídeo)
- [ ] Compartilhamento de tela
- [ ] Permissões e moderação

### Fase 3 - Integrações
- [ ] Calendário (Google, Outlook)
- [ ] Notificações
- [ ] Slack/Discord integration

### Fase 4 - Polimento
- [ ] Sons ambientes
- [ ] Gravação de reuniões
- [ ] Analytics
- [ ] Enterprise features

---

## Diferenciais

| Feature | Zoom/Meet | Slack | Digital Workspace |
|---------|-----------|-------|-------------------|
| Presença visual | ❌ | ⚠️ | ✅ |
| Reuniões sem link | ❌ | ❌ | ✅ |
| Espaço como interface | ❌ | ❌ | ✅ |
| Interação espontânea | ❌ | ⚠️ | ✅ |

---

## Licença

Este projeto está sob a licença MIT.

---

> *"Este produto não concorre com Zoom, Meet ou Slack. Ele substitui a ausência de um lugar."*
