# Opus Usage Tracker

Dashboard + proxy para contar requests, tokens e custo estimado de chamadas Anthropic-compatible.

## Rodar local

```powershell
npm start
```

Abra:

```text
http://localhost:8787
```

## Usar no Claude Code

Configure o Claude Code para chamar o proxy local:

```json
{
  "model": "claude-opus-4-7",
  "availableModels": ["claude-opus-4-7"],
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:8787",
    "ANTHROPIC_MODEL": "claude-opus-4-7",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "claude-opus-4-7"
  },
  "theme": "dark",
  "effortLevel": "xhigh"
}
```

Se publicar no Render, defina `TRACKER_API_KEY` e passe a mesma chave no cliente como `ANTHROPIC_API_KEY` ou `ANTHROPIC_AUTH_TOKEN`.

## Variaveis uteis

```text
PORT=8787
UPSTREAM_BASE_URL=https://base.actionplandigital.com.br
DEFAULT_MODEL=claude-opus-4-7
TRACKER_API_KEY=
STORE_PROMPTS=false
STORE_RESPONSES=false
PRICE_INPUT_PER_MTOK=5
PRICE_OUTPUT_PER_MTOK=25
PRICE_CACHE_READ_PER_MTOK=0.5
PRICE_CACHE_WRITE_PER_MTOK=6.25
```

O custo e estimado. A URL externa nao revela o provedor real nem o custo real.
