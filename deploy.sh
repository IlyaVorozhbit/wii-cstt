#!/bin/bash

# SCP deploy script for wii-cstt plugin
# Configure these variables or set them as environment variables

SERVER_HOST="${SCP_HOST:-}"
SERVER_PORT="${SCP_PORT:-22}"
SERVER_USER="${SCP_USER:-}"
SERVER_PATH="${SCP_PATH:-}"

# Files to deploy
FILES=("index.ts" "openclaw.plugin.json" "package.json")

# Validate required variables
if [[ -z "$SERVER_HOST" || -z "$SERVER_USER" || -z "$SERVER_PATH" ]]; then
    echo "❌ Please set SCP_HOST, SCP_USER, and SCP_PATH environment variables"
    echo ""
    echo "Usage:"
    echo "  SCP_HOST=your-server.com SCP_USER=root SCP_PATH=/path/to/plugins/wii-cstt ./deploy.sh"
    echo ""
    echo "Or export them:"
    echo "  export SCP_HOST=your-server.com"
    echo "  export SCP_USER=root"
    echo "  export SCP_PATH=/path/to/plugins"
    echo "  ./deploy.sh"
    exit 1
fi

echo "🚀 Deploying to $SERVER_USER@$SERVER_HOST:$SERVER_PATH"

# Create remote directory if it doesn't exist
echo "  Creating remote directory..."
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "mkdir -p $SERVER_PATH"

for file in "${FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "  Sending $file..."
        scp -P "$SERVER_PORT" "$file" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/"
    else
        echo "  ⚠️  $file not found, skipping"
    fi
done

echo "✅ Done!"
