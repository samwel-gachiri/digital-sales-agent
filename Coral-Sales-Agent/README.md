# Coral Sales Agent

The Coral Sales Agent is a comprehensive sales automation system that orchestrates multiple specialized agents to handle end-to-end sales processes through the Coral Protocol.

## Responsibility

The Sales Agent acts as the central coordinator for all sales activities, managing:

- Prospect discovery using Firecrawl and OpenDeepResearch agents
- Lead qualification with BANT scoring methodology
- Contact initiation through voice (VoiceInterface + ElevenLabs) and email
- Deal progression tracking and pipeline management
- Sales analytics and performance reporting

## Details

- **Framework**: LangChain
- **Tools used**: Coral Server Tools, Firecrawl Agent, OpenDeepResearch Agent, VoiceInterface Agent, Pandas Agent
- **AI model**: OpenAI GPT-4o-mini (configurable)
- **Date added**: January 2025
- **License**: MIT

## Setup the Agent

### 1. Clone & Install Dependencies

Ensure that the [Coral Server](https://github.com/Coral-Protocol/coral-server) is running on your system.

```bash
# Navigate to the Sales Agent directory
cd Coral-LeadsWebapp/Coral-SalesAgent

# Install uv if not already installed
pip install uv

# Install dependencies from pyproject.toml using uv
uv sync
```

### 2. Configure Environment Variables

Get the API Keys:

- [OpenAI](https://platform.openai.com/api-keys)
- [Groq](https://console.groq.com/keys) (optional)

```bash
# Create .env file in project root
cp .env_sample .env
# Edit .env with your specific configuration
```

Required environment variables:

- `CORAL_SSE_URL`: Coral Server URL (default: http://localhost:8080/sse)
- `CORAL_AGENT_ID`: Unique agent identifier
- `MODEL_API_KEY`: OpenAI or Groq API key
- `MODEL_NAME`: Model to use (default: gpt-4o-mini)
- `MODEL_PROVIDER`: Provider (openai or groq)

## Run the Agent

### Dev Mode

Ensure that the [Coral Server](https://github.com/Coral-Protocol/coral-server) is running and other required agents are active:

- Firecrawl Agent (for web scraping)
- OpenDeepResearch Agent (for company intelligence)
- VoiceInterface Agent (for voice interactions)
- Pandas Agent (for data analysis)

```bash
# Run the agent using uv
uv run python main.py
```

## Sales Workflow

The Sales Agent coordinates the following workflow:

1. **Prospect Discovery**

   - Receives target criteria from Interface Agent
   - Uses Firecrawl Agent to scrape company websites
   - Coordinates with OpenDeepResearch Agent for company intelligence
   - Uses Pandas Agent to structure and analyze prospect data

2. **Lead Qualification**

   - Applies BANT scoring (Budget, Authority, Need, Timeline)
   - Uses VoiceInterface Agent for qualification conversations
   - Categorizes leads as hot, warm, or cold

3. **Contact Initiation**

   - Manages voice outreach via VoiceInterface Agent + ElevenLabs
   - Generates personalized email templates
   - Tracks all interactions and responses

4. **Deal Progression**

   - Monitors deal stages and pipeline movement
   - Coordinates follow-up activities
   - Integrates with CRM systems

5. **Analytics & Reporting**
   - Uses Pandas Agent for performance analytics
   - Generates conversion metrics and pipeline velocity reports
   - Provides real-time dashboard data

## Example Usage

```bash
# The Sales Agent responds to instructions like:
"Discover prospects in the fintech industry with 50-200 employees"
"Qualify the lead from Acme Corp using BANT criteria"
"Initiate voice contact with John Doe at TechStart Inc"
"Generate analytics report for Q1 sales performance"
```

## Integration with Other Agents

The Sales Agent seamlessly integrates with existing Coral Protocol agents:

- **Firecrawl Agent**: Web scraping and contact extraction
- **OpenDeepResearch Agent**: Company intelligence and market research
- **VoiceInterface Agent**: Real-time voice interactions with ElevenLabs
- **Pandas Agent**: Data analysis and reporting

## Creator Details

- **Name**: Digital Sales Agent Team
- **Affiliation**: Coral Protocol
- **Contact**: [Discord](https://discord.com/invite/Xjm892dtt3)
