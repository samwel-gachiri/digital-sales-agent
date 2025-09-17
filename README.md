# Digital Sales Agent - Coral Protocol Hackathon

An AI-powered sales automation system that leverages the Coral Protocol to orchestrate multiple specialized agents for end-to-end sales processes. This project showcases the power of agent reusability and coordination through Coral Protocol.

![Digital Sales Agent](https://via.placeholder.com/800x400/3b82f6/ffffff?text=Digital+Sales+Agent)

## 🎯 Overview

The Digital Sales Agent automates the complete sales workflow from prospect discovery to deal closure using a multi-agent architecture:

- **Prospect Discovery** - AI-powered web scraping and company research
- **Lead Qualification** - BANT scoring with voice interactions
- **Contact Initiation** - Voice and email automation with ElevenLabs
- **Deal Progression** - Pipeline management and CRM integration
- **Sales Analytics** - Real-time performance insights and reporting

## 🏗️ Architecture

### Agent Ecosystem

- **Sales Agent** - Central orchestrator for sales workflows
- **Sales Interface Agent** - FastAPI backend with REST endpoints
- **Firecrawl Agent** - Web scraping and contact extraction
- **OpenDeepResearch Agent** - Company intelligence and market research
- **VoiceInterface Agent** - Real-time voice interactions with ElevenLabs
- **Pandas Agent** - Data analysis and reporting

### Technology Stack

- **Backend**: Python, FastAPI, LangChain, Coral Protocol
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Voice**: LiveKit, ElevenLabs TTS
- **Data**: Pydantic models, PostgreSQL (planned)
- **Deployment**: Docker, Kubernetes (planned)

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- [Coral Server](https://github.com/Coral-Protocol/coral-server) running
- API keys for OpenAI, ElevenLabs, Firecrawl, etc.

### 1. Setup Coral Server

Follow the [Coral Server setup guide](https://github.com/Coral-Protocol/coral-server) to get the core protocol running.

### 2. Setup Agents

#### Sales Agent

```bash
cd Coral-SalesAgent
cp .env_sample .env
# Edit .env with your API keys
uv sync
uv run python main.py
```

#### Sales Interface Agent

```bash
cd Coral-SalesInterfaceAgent
cp .env_sample .env
# Edit .env with your API keys
uv sync
uv run python main.py
```

#### Existing Agents

Setup the required existing agents:

```bash
# Firecrawl Agent
cd Coral-FirecrawlMCP-Agent
cp .env_sample .env
uv sync
uv run python main.py

# OpenDeepResearch Agent
cd Coral-OpenDeepResearch-Agent
cp .env_sample .env
uv sync
uv run python main.py

# VoiceInterface Agent
cd Coral-VoiceInterface-Agent
cp .env.example .env
uv sync
uv run python main.py console

# Pandas Agent
cd Coral-Pandas-Agent
cp .env_sample .env
uv sync
uv run python main.py
```

### 3. Setup Frontend

```bash
cd SalesUI
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Sales API: http://localhost:8000
- Coral Server: http://localhost:8080

## 📋 Features

### ✅ Implemented

- [x] Sales Agent with Coral Protocol integration
- [x] Sales Interface Agent with FastAPI endpoints
- [x] Next.js frontend with dashboard and discovery pages
- [x] TypeScript data models and interfaces
- [x] Integration with existing Coral agents
- [x] Responsive UI with Tailwind CSS
- [x] Real-time agent status monitoring

### 🚧 In Progress

- [ ] Voice interaction integration with ElevenLabs
- [ ] BANT lead scoring algorithms
- [ ] Email template generation
- [ ] Analytics dashboard with charts
- [ ] CRM integration capabilities

### 📅 Planned

- [ ] Database persistence with PostgreSQL
- [ ] WebSocket real-time updates
- [ ] Advanced analytics and reporting
- [ ] Docker containerization
- [ ] Kubernetes deployment manifests

## 🎮 Usage Examples

### Discover Prospects

```bash
curl -X POST http://localhost:8000/sales/discover-prospects \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "technology",
    "company_size": "50-200",
    "keywords": ["SaaS", "startup"]
  }'
```

### Qualify a Lead

```bash
curl -X POST http://localhost:8000/sales/qualify-lead \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_id": "123",
    "contact_id": "456"
  }'
```

### Initiate Contact

```bash
curl -X POST http://localhost:8000/sales/initiate-contact \
  -H "Content-Type: application/json" \
  -d '{
    "prospect_id": "123",
    "contact_id": "456",
    "method": "voice",
    "message": "Hi, I'd like to discuss how we can help your business grow"
  }'
```

## 🏆 Hackathon Features

This project demonstrates several key hackathon themes:

### Coral Protocol (Mandatory) ✅

- Multi-agent orchestration and communication
- Reuse of existing agents from the Coral ecosystem
- Zero-trust API coordination between specialized agents

### ElevenLabs Integration 🎤

- Voice-based prospect outreach and qualification
- Real-time conversation capabilities
- Natural, expressive voice interactions

### Agent Reusability 🔄

- Leverages 4 existing Coral Protocol agents
- Demonstrates the power of composable AI systems
- Shows how agents can be combined for new use cases

## 📁 Project Structure

```
Coral-LeadsWebapp/
├── Coral-SalesAgent/              # Main sales orchestrator
│   ├── main.py
│   ├── models.py
│   ├── pyproject.toml
│   └── README.md
├── Coral-SalesInterfaceAgent/     # FastAPI backend
│   ├── main.py
│   ├── pyproject.toml
│   └── .env_sample
├── SalesUI/                       # Next.js frontend
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── tailwind.config.js
├── types/                         # Shared TypeScript types
│   └── index.ts
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Coral Protocol](https://coralprotocol.org) for the agent orchestration framework
- [ElevenLabs](https://elevenlabs.io) for voice AI capabilities
- [Firecrawl](https://firecrawl.dev) for web scraping capabilities
- [OpenDeepResearch](https://github.com/langchain-ai/open_deep_research) for research automation

## 📞 Support

- [Discord](https://discord.com/invite/Xjm892dtt3) - Join the Coral Protocol community
- [GitHub Issues](https://github.com/your-repo/issues) - Report bugs or request features
- [Documentation](https://coralprotocol.org/docs) - Coral Protocol documentation

---

Built with ❤️ for the Internet of Agents Hackathon
