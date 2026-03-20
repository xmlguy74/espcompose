// ────────────────────────────────────────────────────────────────────────────
// useScript hook — mirrors Resolut's useAction.tsx
//
// Called from transformed script function bodies (compiler-generated).
// Registers the script definition in the current scope (deduplicating via
// findInScope) and returns the ESPHome action that executes it.
// ────────────────────────────────────────────────────────────────────────────

import { assertHookCall } from './useState';
import { ScriptDefinition, findInScope, registerInScope } from './useScope';

/**
 * Hook that registers a script definition in the current scope and returns
 * the ESPHome `script.execute` action for use as a trigger prop value.
 *
 * This hook must be called inside a `_withScriptScope` render pass.
 * The compiler transforms `function` declarations into calls to this hook.
 *
 * @param metadata - Compiler-generated script definition: id, parameters, compiled action list.
 * @returns An ESPHome action array: `[{ 'script.execute': id }]`
 */
export function useScript(metadata: ScriptDefinition): unknown[] {
  assertHookCall();

  // Deduplication: if already registered in any enclosing scope, skip
  if (findInScope(metadata.id)) {
    return [{ 'script.execute': metadata.id }];
  }

  registerInScope(metadata.id, { def: metadata });
  return [{ 'script.execute': metadata.id }];
}
