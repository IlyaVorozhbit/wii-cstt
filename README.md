# wii-cstt

OpenClaw plugin for speech-to-text (STT) functionality. Transcribes voice messages using a custom OpenAI-compatible API and injects the transcribed text into the conversation context.

## Features

- Automatically detects voice/audio messages
- Transcribes audio using any OpenAI-compatible API (e.g., RouterAI, OpenAI, etc.)
- Injects transcribed text into the conversation context
- Configurable logging

## Installation

1. Enable the plugin:
   ```bash
   openclaw plugins enable wii-cstt
   ```

2. Configure the plugin (see Configuration below)

## Configuration

Add to your OpenClaw config under `plugins.entries.wii-cstt`:

```json
{
  "plugins": {
    "entries": {
      "wii-cstt": {
        "enabled": true,
        "hooks": {
          "allowPromptInjection": true
        },
        "config": {
          "apiKey": "your-api-key",
          "apiUrl": "https://your-provider.com/v1/chat/completions",
          "model": "google/gemini-3.1-flash-lite-preview",
          "log": false,
          "logErrors": true
        }
      }
    }
  }
}
```

### Config Options

| Option | Type | Description |
|--------|------|-------------|
| `apiKey` | string | Provider API key |
| `apiUrl` | string | Full URL to OpenAI-compatible endpoint |
| `model` | string | Model name for transcription |
| `log` | boolean | Enable verbose logging (default: false) |
| `logErrors` | boolean | Enable error logging (default: true) |

### Required: `allowPromptInjection`

**Important:** You must set `hooks.allowPromptInjection: true` in the plugin config for the transcription to be injected into the conversation.

## Supported Providers

Any OpenAI-compatible API that supports `input_audio` in chat completions:

- [RouterAI](https://routerai.ru)
- OpenAI (with audio input support)
- Google Gemini (via compatible providers)

## Development

```bash
# Deploy to server
./deploy.sh
```

Set environment variables before deploying:
```bash
export SCP_HOST=your-server.com
export SCP_USER=root
export SCP_PATH=/path/to/plugins/wii-cstt
./deploy.sh
```

Or pass them inline:
```bash
SCP_HOST=your-server.com SCP_USER=root SCP_PATH=/path/to/plugins/wii-cstt ./deploy.sh
```
