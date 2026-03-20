/**
 * ESPHome action primitives callable inside script function bodies.
 *
 * These functions have no runtime implementation — they are compile-time
 * markers that the ESPCompose transformer recognises by import path and
 * rewrites into the appropriate ESPHome YAML action objects.
 *
 * Calling them outside of a top-level `function` declaration (i.e. at
 * module evaluation time or inside arrow functions that are not triggers)
 * will have no effect at runtime and will emit a compiler warning.
 *
 * @espcomposeActions
 */

/**
 * Pause execution for the specified number of milliseconds.
 *
 * Compiles to:  `delay: <ms>ms`
 *
 * @espcomposeAction delay
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function delay(_ms: number): void {
  // Intentional no-op — body is replaced by the compiler transformer.
}

/**
 * ESPHome logger actions.
 */
export const logger = {
  /**
   * Emit a log message at the given level.
   *
   * Compiles to:  `logger.log:\n  message: <message>\n  level: <level>`
   *
   * @espcomposeAction logger.log
   *
   * @param message - The message string to emit.
   * @param level   - Log level: "VERBOSE", "DEBUG", "INFO", "WARN", "ERROR".
   *                  Defaults to "DEBUG" in ESPHome when omitted.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(_message: string, _level?: 'VERBOSE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'): void {
    // Intentional no-op — body is replaced by the compiler transformer.
  },
} as const;
