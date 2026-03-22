/**
 * ESPHome TSX SDK
 *
 * This package provides the core framework for writing ESPHome configurations
 * using TypeScript/TSX syntax that compiles to ESPHome YAML.
 */

export * from './runtime';
export * from './types';
export * from './actions';
export * from './intents';
export { INTRINSIC_INTENT_REGISTRY } from './intent-registry';

// Re-export the generated barrel: this pulls in all generated
// JSX.IntrinsicElements augmentations via declaration merging AND exposes
// component-prop interfaces & marker phantom-types to consumers.
export * from './generated/index';
