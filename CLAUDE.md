# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an OpenCLAW plugin for speech-to-text (STT) functionality. It transcribes voice messages using a custom OpenAI-compatible API and injects the transcribed text into the conversation context.

## Commands

This is a plain TypeScript plugin with no build/test scripts:
- Development: Edit `index.ts` directly
- No build step required - OpenCLAW loads `.ts` files directly

## Architecture

The plugin consists of a single file (`index.ts`) with two main hooks:

1. **`message` hook** - Listens for incoming messages and detects audio/voice attachments. When audio is found, it initiates an async STT task using the configured custom provider API.

2. **`before_prompt_build` hook** - Waits for the STT task to complete and injects the transcribed text into the conversation context as `[Voice message from user: "..."]`.

### API Flow
- Audio is read from `event.context.mediaPath`
- Converted to base64 and sent to the configured `apiUrl`
- The response is prepended to the prompt context

### Configuration (required)
All settings in `plugins.entries.wii-cstt.config`:
- `apiKey`: Provider API key
- `apiUrl`: Full URL to the OpenAI-compatible endpoint (e.g., `https://your-provider.com/v1/chat/completions`)
- `model`: Model name to use for transcription
