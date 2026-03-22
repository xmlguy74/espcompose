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
export * from './design-tokens';
export * from './components/index';
export { INTRINSIC_INTENT_REGISTRY } from './intent-registry';

// Both ./components/index and ./generated/index export names "Button" and
// "Text".  The generated ones are marker-type aliases (button_Button,
// text_Text); the DS components are the intended public API.  Explicit
// named re-exports resolve the TS2308 ambiguity in favour of the DS.
export { Button, Text } from './components/index';

// Re-export the generated barrel: JSX.IntrinsicElements augmentations,
// component-prop interfaces & marker phantom-types.  The two colliding
// names are skipped because they are already explicitly exported above.
export * from './generated/index';
