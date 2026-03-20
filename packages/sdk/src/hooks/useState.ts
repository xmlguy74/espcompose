// ────────────────────────────────────────────────────────────────────────────
// Hook guard — ported verbatim from Resolut useState.ts
//
// Hooks (useScript) may only be called during a _withScriptScope render pass.
// Calling them outside throws a descriptive error.
// ────────────────────────────────────────────────────────────────────────────

let _currentHookPath: string | null = null;
let _currentHookIndex = 0;
let _currentComponentName: string | null = null;

export function setCurrentHookPath(path: string | null): void {
  _currentHookPath = path;
  _currentHookIndex = 0;
}

export function getCurrentHookPath(): string | null {
  return _currentHookPath;
}

export function setCurrentHookIndex(index: number): void {
  _currentHookIndex = index;
}

export function getCurrentHookIndex(): number {
  return _currentHookIndex;
}

export function setCurrentComponentName(name: string | null): void {
  _currentComponentName = name;
}

export function getCurrentComponentName(): string | null {
  return _currentComponentName;
}

export function assertHookCall(): void {
  if (!_currentHookPath) {
    throw new Error(
      'Hooks must be called within a function component during render. ' +
        'This error occurs when a hook (useScript, etc.) is called outside of a component render context.',
    );
  }
}
