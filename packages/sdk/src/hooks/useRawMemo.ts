// ────────────────────────────────────────────────────────────────────────────
// useRawMemo — explicit C++ memo construction
//
// Creates a ReactiveNode from a hand-written C++ expression and explicit
// dependency list. Use this when the automatic useMemo() compilation isn't
// sufficient — e.g. when you need to call a C++ helper like resolve_font().
//
// Must be called inside a function component body (render phase).
// ────────────────────────────────────────────────────────────────────────────

import { ReactiveNode } from '../reactive-node';
import type { ExpressionDependency } from '../reactive-node';
import { registerReactiveNode } from './useReactiveScope';
import { assertPhase } from '../phase';

export function useRawMemo<T>(opts: {
  cppExpression: string;
  cppReturnType: string;
  dependencies: ExpressionDependency[];
}): ReactiveNode<T> {
  assertPhase('render', 'useRawMemo()');

  const node = new ReactiveNode<T>({
    kind: 'memo',
    dependencies: opts.dependencies,
    cppExpression: opts.cppExpression,
    cppReturnType: opts.cppReturnType,
  });

  registerReactiveNode(node);
  return node;
}
