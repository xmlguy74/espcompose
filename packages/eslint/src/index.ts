/**
 * ESPHome TSX ESLint Plugin
 * 
 * This package provides custom ESLint rules for enforcing
 * best practices and constraints in ESPHome TSX projects.
 */

import type { ESLint } from 'eslint';

const plugin: ESLint.Plugin = {
  meta: {
    name: '@esphome-tsx/eslint-plugin',
    version: '0.0.1',
  },
  rules: {
    // Custom rules will be added here
  },
  configs: {
    recommended: {
      plugins: ['@esphome-tsx'],
      rules: {
        // Recommended rule configurations will be added here
      },
    },
  },
};

export = plugin;
