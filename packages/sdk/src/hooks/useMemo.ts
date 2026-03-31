// ────────────────────────────────────────────────────────────────────────────
// useMemo — reactive memoization hook
//
// Creates a memoized derived value from one or more reactive sources.
// Must be called inside a function component body (render pass).
//
// In the normal build pipeline, the CLI's reactive transformer replaces
// useMemo() calls with _reactive.compiled() before this code runs.
// This runtime fallback handles:
//   - Pure computations (no reactive deps) — returns the value directly
//   - Leftover reactive calls not caught by the compiler — creates
//     a ReactiveNode with dependency tracking only
//
// Usage:
//   const status = useMemo(() => light.isOn ? 'ON' : 'OFF');
// ────────────────────────────────────────────────────────────────────────────

import {
  ReactiveNode,
  startTracking,
  stopTracking,
} from '../reactive-node';
import { registerReactiveNode } from './useReactiveScope';
import { assertHookContext } from './useState';

/**
 * Create a memoized derived value from one or more reactive sources.
 *
 * Must be called inside a function component body (render pass).
 *
 * In the normal build pipeline, the CLI's reactive transformer replaces
 * useMemo() calls with _reactive.compiled() before this code runs.
 * This runtime fallback handles:
 *   - Pure computations (no reactive deps) — returns the value directly
 *   - Leftover reactive calls not caught by the compiler — creates
 *     a ReactiveNode with dependency tracking only
 */
export function useMemo<T>(fn: () => T): T | ReactiveNode<T> {
  assertHookContext('useMemo()');
  startTracking();
  const value = fn();
  const deps = stopTracking();

  if (deps.length === 0) {
    // Pure computation — no reactive dependencies, return as-is
    return value;
  }

  // Infer C++ return type from the JS value
  let cppReturnType: string | undefined;
  if (typeof value === 'string') cppReturnType = 'std::string';
  else if (typeof value === 'number') cppReturnType = 'float';
  else if (typeof value === 'boolean') cppReturnType = 'bool';

  const node = new ReactiveNode<T>({
    kind: 'memo',
    dependencies: deps,
    cppExpression: '0 /* uncompiled – AST compiler should have handled this */',
    cppReturnType,
  });

  registerReactiveNode(node);
  return node;
}
