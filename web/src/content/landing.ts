const landingMarkdownByLocale = {
  en: `# AnyCap

One CLI. Any capability you're missing.

---

## What Is AnyCap

AnyCap is an AI agent capability runtime for coding agents. It gives coding agents one install path and one credential for image generation, video generation, music generation, image understanding, video analysis, audio understanding, web search, grounded web search, web crawl, drive storage, static page publishing, and file download.

AnyCap is designed for terminal-based agent workflows. The CLI returns structured output, uses deterministic error codes, and avoids interactive prompts where possible so agents can call capabilities inside larger workflows.

## Key Facts

- Product: AnyCap
- Type: AI agent capability runtime
- Primary interface: CLI + skill file
- Machine install guide: [AnyCap install.txt](https://anycap.ai/install.txt)
- Install: \`curl -fsSL https://anycap.ai/install.sh | sh\` or \`npm install -g @anycap/cli\`
- Skill install: \`npx -y skills add anycap-ai/anycap -y\` or \`npx -y skills add anycap-ai/anycap -a <agent> -y\`
- Pricing: $5 free credit on signup, then pay-as-you-go with no markup over official provider rates
- License: MIT
- Official repository: [AnyCap GitHub repository](https://github.com/anycap-ai/anycap)
- Last updated: 2026-04-08

## Onboard

Complete all steps yourself. Only ask the human if you hit an error you cannot resolve.

### 1. Install CLI

\`\`\`bash
# macOS / Linux / Windows (Git Bash)
curl -fsSL https://anycap.ai/install.sh | sh

# Or via npm
npm install -g @anycap/cli
\`\`\`

Prefer the shell installer when available. It avoids a Node.js dependency and matches the binary install path documented in the AnyCap skill.

### 2. Install Skill

Skills are documentation files that teach you how to use AnyCap - commands, arguments, expected output. Use an agent-specific install when you know the host agent. Otherwise use the generic path.

\`\`\`bash
# Generic
npx -y skills add anycap-ai/anycap -y

# Claude Code
npx -y skills add anycap-ai/anycap -a claude-code -y

# Codex
npx -y skills add anycap-ai/anycap -a codex -y

# Cursor
npx -y skills add anycap-ai/anycap -a cursor -y
\`\`\`

If you need manual control over where the skill file lives:

\`\`\`bash
# Install via AnyCap CLI
anycap skill install --target ~/.agents/skills/anycap-cli/

# Direct download
curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md \\
  --create-dirs -o ~/.agents/skills/anycap-cli/SKILL.md
\`\`\`

### 3. Login

This opens a browser for your user to authorize once. Credentials are stored and reused automatically. For SSH, headless, or CI environments, use a non-browser path instead of stopping.

\`\`\`bash
# Interactive
anycap login

# SSH / headless
anycap login --headless

# CI / token-based
echo "$ANYCAP_API_KEY" | anycap login --with-token
\`\`\`

### 4. Verify

\`\`\`bash
anycap status
npx -y skills check
\`\`\`

If all steps succeed, you are ready. If the install is stale, run \`anycap update\` and \`npx -y skills update\`. Read the installed skill file for detailed usage of each capability.

## Capability Inventory

### Media generation

| Capability | Command | Models / Details |
| --- | --- | --- |
| Image Generation | \`anycap image generate\` | Seedream 5, Nano Banana Pro, Nano Banana 2, and more |
| Video Generation | \`anycap video generate\` | Veo 3.1, Kling 3, Seedance 1.5 Pro, and more |
| Music Generation | \`anycap music generate\` | Suno v5, ElevenLabs Music, and more |

### Media understanding and web retrieval

| Capability | Command | Models / Details |
| --- | --- | --- |
| Image Understanding | \`anycap actions image-read\` | Vision analysis - screenshots, diagrams, photos |
| Video Analysis | \`anycap actions video-read\` | Video content and recording inspection |
| Audio Understanding | \`anycap actions audio-read\` | Audio content analysis |
| Web Search | \`anycap search --query\` | Structured web search results with optional page content |
| Grounded Web Search | \`anycap search --prompt\` | Synthesized answers with citations grounded in live search |
| Web Crawl | \`anycap crawl\` | Convert web pages into clean Markdown |

### Delivery and publishing

| Capability | Command | Models / Details |
| --- | --- | --- |
| Drive | \`anycap drive\` | Cloud storage, file sharing, public URLs |
| Page | \`anycap page\` | Static site deployment and publishing |
| Download | \`anycap download\` | Download remote files to local disk |

Roadmap: speech, sandbox, browser automation.

## Pricing

$5 free credit on signup - no payment required. After that, pay-as-you-go at the same rate as official model providers. No markup, no subscription.

## Why AnyCap

Without AnyCap, your user registers on Replicate for image gen, gets an OpenAI key for vision, sets up cloud storage separately, configures a hosting service for pages - each with its own auth, SDK, and billing. Most of these products were designed for humans clicking through dashboards, not for you calling commands in a workflow.

With AnyCap: one install, one login, one interface. SOTA models in every domain. Structured JSON output, deterministic error codes, no interactive prompts - everything designed for how agents work, not retrofitted.

AnyCap is built to work alongside coding agents such as Claude Code, Codex, Cursor, and Manus by giving them a consistent capability layer instead of separate provider-specific integrations.

## Links

- [Get Started](https://anycap.ai/start) - Full setup walkthrough
- [For Codex](https://anycap.ai/for/codex) - Agent-specific skill install guidance
- [For Claude Code](https://anycap.ai/for/claude-code) - Agent-specific skill install guidance
- [For Cursor](https://anycap.ai/for/cursor) - Agent-specific skill install guidance
- [Skill File](https://github.com/anycap-ai/anycap/blob/main/skills/anycap-cli/SKILL.md) - Full capability documentation
- [install.txt](https://anycap.ai/install.txt) - Machine-readable install instructions
- [AnyCap llms.txt](https://anycap.ai/llms.txt) - LLM-facing site overview
- [GitHub](https://github.com/anycap-ai/anycap)
- [GitHub Releases](https://github.com/anycap-ai/anycap/releases) - CLI binaries
- [skills.sh](https://skills.sh/anycap-ai/anycap) - Skills directory listing
- [Website](https://anycap.ai) - Human-readable homepage

---

Human-readable version: [AnyCap website](https://anycap.ai/)

Machine install guide: [AnyCap install.txt](https://anycap.ai/install.txt)

LLM guidance: [AnyCap llms.txt](https://anycap.ai/llms.txt)

MIT License
`,
  "pt-br": `# AnyCap

Uma CLI. Qualquer capability que esteja faltando.

---

## O Que E O AnyCap

O AnyCap e um runtime de capabilities para agentes de IA feito para coding agents. Ele da aos agentes um unico caminho de instalacao e uma unica credencial para geracao de imagem, geracao de video, geracao de musica, entendimento de imagem, analise de video, entendimento de audio, busca na web, busca na web com grounding, web crawl, armazenamento no Drive, publicacao de paginas estaticas e download de arquivos.

O AnyCap foi pensado para workflows de agentes no terminal. A CLI retorna saida estruturada, usa codigos de erro deterministas e evita prompts interativos sempre que possivel, para que os agentes possam chamar capabilities dentro de workflows maiores.

## Fatos Rapidos

- Produto: AnyCap
- Tipo: runtime de capabilities para agentes de IA
- Interface principal: CLI + arquivo de skill
- Guia de instalacao para maquinas: [AnyCap install.txt](https://anycap.ai/pt-br/install.txt)
- Instalacao: \`curl -fsSL https://anycap.ai/install.sh | sh\` ou \`npm install -g @anycap/cli\`
- Instalacao da skill: \`npx -y skills add anycap-ai/anycap -y\` ou \`npx -y skills add anycap-ai/anycap -a <agent> -y\`
- Precos: US$ 5 em credito gratis no cadastro, depois pagamento por uso sem markup sobre as tarifas oficiais dos provedores
- Licenca: MIT
- Repositorio oficial: [Repositorio AnyCap no GitHub](https://github.com/anycap-ai/anycap)
- Ultima atualizacao: 2026-04-08

## Onboarding

Conclua todas as etapas sozinho. So peca ajuda humana se encontrar um erro que voce nao consegue resolver.

### 1. Instale a CLI

\`\`\`bash
# macOS / Linux / Windows (Git Bash)
curl -fsSL https://anycap.ai/install.sh | sh

# Ou via npm
npm install -g @anycap/cli
\`\`\`

Prefira o instalador via shell quando ele estiver disponivel. Ele evita a dependencia de Node.js e segue o caminho de binario documentado na skill do AnyCap.

### 2. Instale a Skill

Skills sao arquivos de documentacao que ensinam como usar o AnyCap - comandos, argumentos e saida esperada. Use a instalacao especifica por agente quando souber qual e o agente hospedeiro. Caso contrario, use o caminho generico.

\`\`\`bash
# Generico
npx -y skills add anycap-ai/anycap -y

# Claude Code
npx -y skills add anycap-ai/anycap -a claude-code -y

# Codex
npx -y skills add anycap-ai/anycap -a codex -y

# Cursor
npx -y skills add anycap-ai/anycap -a cursor -y
\`\`\`

Se precisar de controle manual sobre onde o arquivo de skill vai ficar:

\`\`\`bash
# Instalar via AnyCap CLI
anycap skill install --target ~/.agents/skills/anycap-cli/

# Download direto
curl -fsSL https://raw.githubusercontent.com/anycap-ai/anycap/main/skills/anycap-cli/SKILL.md \\
  --create-dirs -o ~/.agents/skills/anycap-cli/SKILL.md
\`\`\`

### 3. Faca login

Isso abre um navegador para que o usuario autorize uma unica vez. As credenciais ficam armazenadas e sao reutilizadas automaticamente. Em SSH, ambientes headless ou CI, use o caminho sem navegador em vez de parar.

\`\`\`bash
# Interativo
anycap login

# SSH / headless
anycap login --headless

# CI / token
echo "$ANYCAP_API_KEY" | anycap login --with-token
\`\`\`

### 4. Verifique

\`\`\`bash
anycap status
npx -y skills check
\`\`\`

Se todas as etapas derem certo, voce esta pronto. Se a instalacao estiver desatualizada, rode \`anycap update\` e \`npx -y skills update\`. Leia a skill instalada para ver o uso detalhado de cada capability.

## Inventario de Capabilities

### Geracao de midia

| Capability | Comando | Modelos / Detalhes |
| --- | --- | --- |
| Geracao de imagem | \`anycap image generate\` | Seedream 5, Nano Banana Pro, Nano Banana 2 e mais |
| Geracao de video | \`anycap video generate\` | Veo 3.1, Kling 3, Seedance 1.5 Pro e mais |
| Geracao de musica | \`anycap music generate\` | Suno v5, ElevenLabs Music e mais |

### Entendimento de midia e recuperacao na web

| Capability | Comando | Modelos / Detalhes |
| --- | --- | --- |
| Entendimento de imagem | \`anycap actions image-read\` | Analise visual de screenshots, diagramas e fotos |
| Analise de video | \`anycap actions video-read\` | Inspecao de conteudo e gravacoes em video |
| Entendimento de audio | \`anycap actions audio-read\` | Analise de conteudo em audio |
| Busca na web | \`anycap search --query\` | Resultados estruturados com conteudo opcional de pagina |
| Busca na web com grounding | \`anycap search --prompt\` | Respostas sintetizadas com citacoes baseadas em busca ao vivo |
| Web crawl | \`anycap crawl\` | Converte paginas da web em Markdown limpo |

### Entrega e publicacao

| Capability | Comando | Modelos / Detalhes |
| --- | --- | --- |
| Drive | \`anycap drive\` | Armazenamento em nuvem, compartilhamento de arquivos e URLs publicas |
| Page | \`anycap page\` | Deploy e publicacao de sites estaticos |
| Download | \`anycap download\` | Baixa arquivos remotos para o disco local |

Roadmap: fala, sandbox e automacao de navegador.

## Precos

US$ 5 em credito gratis no cadastro - sem pagamento obrigatorio. Depois disso, pagamento por uso na mesma taxa dos provedores oficiais de modelo. Sem markup e sem assinatura.

## Por Que Usar o AnyCap

Sem o AnyCap, o usuario precisa abrir conta no Replicate para gerar imagens, pegar uma chave da OpenAI para visao, configurar armazenamento em nuvem separadamente e preparar um servico de hospedagem para paginas - cada um com sua propria autenticacao, SDK e cobranca. A maioria desses produtos foi desenhada para humanos clicando em dashboards, nao para agentes chamando comandos em um workflow.

Com o AnyCap: uma instalacao, um login e uma interface. Modelos SOTA em cada dominio. Saida JSON estruturada, codigos de erro deterministas e nenhum prompt interativo - tudo pensado para a forma como os agentes trabalham, e nao adaptado depois.

O AnyCap foi feito para rodar ao lado de coding agents como Claude Code, Codex, Cursor e Manus, dando a eles uma camada consistente de capabilities em vez de integracoes separadas por provedor.

## Links

- [Comecar](https://anycap.ai/start) - Passo a passo completo de setup
- [Para Codex](https://anycap.ai/for/codex) - Guia especifico de instalacao da skill
- [Para Claude Code](https://anycap.ai/for/claude-code) - Guia especifico de instalacao da skill
- [Para Cursor](https://anycap.ai/for/cursor) - Guia especifico de instalacao da skill
- [Arquivo de skill](https://github.com/anycap-ai/anycap/blob/main/skills/anycap-cli/SKILL.md) - Documentacao completa das capabilities
- [install.txt](https://anycap.ai/pt-br/install.txt) - Instrucoes de instalacao para maquinas
- [AnyCap llms.txt](https://anycap.ai/pt-br/llms.txt) - Visao geral do site para LLMs
- [GitHub](https://github.com/anycap-ai/anycap)
- [GitHub Releases](https://github.com/anycap-ai/anycap/releases) - Binarios da CLI
- [skills.sh](https://skills.sh/anycap-ai/anycap) - Pagina publica da skill
- [Website](https://anycap.ai/pt-br) - Homepage em portugues

---

Versao legivel para humanos: [Website do AnyCap](https://anycap.ai/pt-br)

Guia de instalacao para maquinas: [AnyCap install.txt](https://anycap.ai/pt-br/install.txt)

Orientacao para LLMs: [AnyCap llms.txt](https://anycap.ai/pt-br/llms.txt)

Licenca MIT
`,
} as const;

export function getLandingMarkdown(locale: string) {
  return landingMarkdownByLocale[locale as keyof typeof landingMarkdownByLocale] ?? landingMarkdownByLocale.en;
}

export { landingMarkdownByLocale };

export default landingMarkdownByLocale.en;
