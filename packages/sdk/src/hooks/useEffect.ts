// ────────────────────────────────────────────────────────────────────────────
// useEffect — reactive side-effect hook
//
// Registers a side-effect that runs when reactive sources change.
// Must be called inside a function component body (render phase).
//
// During lowering, the callback's reactive dependencies become an Effect
// node in the C++ reactive runtime.
//
// Usage:
//   useEffect(() => { void sensor.value; });
// ────────────────────────────────────────────────────────────────────────────

import { ReactiveNode, startTracking, stopTracking } from '../reactive-node';
import { registerReactiveNode } from './useReactiveScope';
import { assertPhase } from '../phase';

/**
 * Register a side-effect that runs when reactive sources change.
 *
 * Must be called inside a function component body (render phase).
 * The callback is executed once to capture dependencies. During lowering,
 * it becomes an Effect node in the C++ reactive runtime.
 */
export function useEffect(fn: () => void): void {
  assertPhase('render', 'useEffect()');
  startTracking();
  fn();
  const deps = stopTracking();

  if (deps.length > 0) {
    const node = new ReactiveNode<void>({
      kind: 'effect',
      dependencies: deps,
      cppExpression: '0 /* uncompiled – AST compiler should have handled this */',
    });

    registerReactiveNode(node);
  }
}
