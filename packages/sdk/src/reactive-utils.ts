// ────────────────────────────────────────────────────────────────────────────
// reactive-utils — reactive prop utilities
//
// Helpers for normalizing reactive prop values and creating derived
// reactive nodes. These are user-facing utilities (not hooks — no phase
// assertion required).
// ────────────────────────────────────────────────────────────────────────────

import { ReactiveNode, isReactiveNode } from './reactive-node';
import type { ExpressionDependency } from './reactive-node';
import { useMemo } from './hooks/useMemo';
import { _reactive } from './_reactive';

// ── BindProp<T>: the reactive prop type alias ──────────────────────────────

/**
 * A prop value that can be static, a reactive node, or a reactive function.
 * Component authors use this to declare which props support reactive binding.
 */
export type BindProp<T> = T | (() => T) | ReactiveNode<T>;

// ── resolveBindProp ────────────────────────────────────────────────────────

/**
 * Normalize a prop value that may be static, reactive node, or reactive function.
 *
 * - `ReactiveNode<T>` → pass through (already tracked)
 * - `() => T` → evaluate with dependency tracking → ReactiveNode or literal
 * - `T` → literal (no reactivity)
 */
export function resolveBindProp<T>(prop: BindProp<T>): T | ReactiveNode<T> {
  if (isReactiveNode(prop)) {
    return prop as ReactiveNode<T>;
  }
  if (typeof prop === 'function') {
    return useMemo(prop as () => T);
  }
  return prop as T;
}

// ── reactiveIsNaN ──────────────────────────────────────────────────────────

/**
 * Test whether a reactive numeric value is NaN.
 *
 * Returns a `ReactiveNode<boolean>` that is `true` when the source value
 * is NaN (e.g. HA reports `None` for a numeric attribute).
 *
 * @example
 * value={useMemo(() => reactiveIsNaN(light.brightness).get() ? 0 : light.brightness.get())}
 */
export function reactiveIsNaN(node: ReactiveNode<number>): ReactiveNode<boolean> {
  const sigName = node.cppSignalName ?? node.dependencies[0]?.cppSignalName;
  const getter = sigName ? `${sigName}.get()` : `memo_${(node as unknown as { _index: number })._index}.get()`;
  return _reactive.derivedMemo<boolean>({
    cppExpression: `std::isnan(${getter})`,
    cppReturnType: 'bool',
    dependencies: node.dependencies,
  });
}
