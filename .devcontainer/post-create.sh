#!/usr/bin/env bash
set -euo pipefail

# Read the pinned ESPHome version from the workspace root package.json
ESPHOME_VERSION=$(node -p "require('./package.json').esphome.version")

# Install ESPHome for YAML validation (esphome config)
pip install --user "esphome==${ESPHOME_VERSION}"

# Install workspace dependencies
pnpm install

# Build all packages so SDK types are available immediately
pnpm build
