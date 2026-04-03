// ────────────────────────────────────────────────────────────────────────────
// Action IR Types — Re-export from SDK
//
// The action IR types and constructors are defined in @esphome/compose/internals.
// This file re-exports them for backwards compatibility with existing CLI code.
//
// NOTE: Action lowering (to ESPHome YAML) is in @esphome/compose-target-esphome.
// ────────────────────────────────────────────────────────────────────────────

// Re-export all action types and constructors from SDK
export type {
  ActionNode,
  IRNativeAction,
  IRHAServiceAction,
  IRLoggerAction,
  IRDelayAction,
  IRWaitUntilAction,
  IRIfAction,
  IRWhileAction,
  IRRepeatAction,
  IRScriptExecute,
  IRScriptWait,
  IRScriptStop,
  IRThemeSelect,
  IRCondition,
  IRLambdaCondition,
  IRNativeCondition,
  IRActionParam,
  IRLiteralParam,
  IRTriggerVarParam,
  IRExpressionParam,
  IRActionConfig,
} from '@esphome/compose/internals';

export {
  irNativeAction,
  irHAServiceAction,
  irLoggerAction,
  irDelayAction,
  irWaitUntilAction,
  irIfAction,
  irWhileAction,
  irRepeatAction,
  irScriptExecute,
  irScriptWait,
  irScriptStop,
  irThemeSelect,
  irLambdaCondition,
  irNativeCondition,
} from '@esphome/compose/internals';

// Backwards compatibility: re-export ActionNode as IRAction
// TODO: migrate all usages to ActionNode and remove this alias
export type { ActionNode as IRAction } from '@esphome/compose/internals';
