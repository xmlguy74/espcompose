import yaml from 'yaml';
import type { EspComposeElement, FunctionComponent } from './types';
import { isRef } from './types';
import { useScript, withScriptScope } from './hooks';

export * from './hooks';

// ────────────────────────────────────────────────────────────────────────────
// camelCase → snake_case key conversion
//
// Generated TypeScript props use camelCase (e.g. `buildPath`, `friendlyName`).
// ESPHome YAML requires snake_case (e.g. `build_path`, `friendly_name`).
// We convert all prop keys at the point where we build the plain object so
// the YAML output is always correct.
//
// The convention: any uppercase letter that follows a lowercase letter or digit
// becomes `_<lowercase>`. This handles the common cases produced by codegen.
// ────────────────────────────────────────────────────────────────────────────

function camelToSnake(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

function keysToSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[camelToSnake(k)] = serializeValue(v);
  }
  return out;
}

/**
 * Serialize a prop value for YAML output.
 * Ref<T> instances (produced by useRef()) are serialized as their string token.
 * Plain objects have their keys recursively converted to snake_case.
 * Arrays are mapped element-wise.
 * All other values are passed through unchanged.
 */
function serializeValue(v: unknown): unknown {
  if (isRef(v)) return v.toString();
  if (Array.isArray(v)) return v.map(serializeValue);
  if (v !== null && typeof v === 'object') {
    return keysToSnakeCase(v as Record<string, unknown>);
  }
  return v;
}

// ────────────────────────────────────────────────────────────────────────────
// JSX factory
// ────────────────────────────────────────────────────────────────────────────

function createElement(
  type: string | FunctionComponent,
  props: Record<string, unknown> | null,
  ...children: (EspComposeElement | EspComposeElement[] | null | undefined)[]
): EspComposeElement {
  const flatChildren = children.flat().filter((c): c is EspComposeElement => c != null);

  return {
    type,
    props: {
      ...(props ?? {}),
      ...(flatChildren.length > 0 ? { children: flatChildren } : {}),
    },
  };
}

function Fragment(props: { children?: EspComposeElement | EspComposeElement[] }): EspComposeElement {
  const { children } = props;
  if (children == null) return null!;
  return (Array.isArray(children) ? children : [children]) as unknown as EspComposeElement;
}

// ────────────────────────────────────────────────────────────────────────────
// Element → plain object conversion
// ────────────────────────────────────────────────────────────────────────────

function toPlainObject(el: EspComposeElement | EspComposeElement[] | null | undefined): unknown {
  if (el == null) return undefined;

  if (Array.isArray(el)) {
    const mapped = el.map(toPlainObject).filter((v) => v != null);
    return mapped.length === 1 ? mapped[0] : mapped;
  }

  // Function component: call it and recurse
  if (typeof el.type === 'function') {
    const result = el.type(el.props as never);
    if (result == null) return undefined;
    return toPlainObject(Array.isArray(result) ? result : result);
  }

  const { children, ref, "x:custom": xCustom, ...ownProps } = el.props as Record<string, unknown> & { children?: unknown; ref?: unknown; "x:custom"?: unknown };

  // If a `ref` was passed, extract its token and inject it as `id`.
  // This mirrors React's ref pattern: <as5600 ref={myRef} /> → id: <token>
  const propsWithId = ref != null
    ? { id: isRef(ref) ? ref.toString() : String(ref), ...ownProps }
    : ownProps;

  // Spread x:custom values into the props so they appear as direct YAML keys.
  const allProps = xCustom != null
    ? { ...propsWithId, ...(xCustom as Record<string, unknown>) }
    : propsWithId;

  if (el.type === 'esphome') {
    // The <esphome> root: own props become `esphome:`, each child element
    // becomes a sibling top-level section (e.g. wifi:, sensor:, ...)
    // Convert camelCase prop keys back to snake_case for YAML output.
    const childSections = childrenToTopLevelSections(
      children as EspComposeElement | EspComposeElement[] | undefined
    );
    return {
      esphome: stripUndefined(keysToSnakeCase(allProps)),
      ...childSections,
    };
  }

  // All other intrinsic elements: { [type]: { ...ownProps, ...childrenMerged } }
  const childData = buildChildData(
    children as EspComposeElement | EspComposeElement[] | undefined
  );
  const data = stripUndefined(keysToSnakeCase({ ...allProps, ...childData }));
  return { [el.type]: Object.keys(data).length > 0 ? data : null };
}

/**
 * Converts an <esphome> element's children into top-level YAML sections.
 *
 * Each child element becomes `{ [child.type]: { ...child.props } }`.
 * Multiple children of the same type are collected into an array.
 * Fragment children are flattened.
 */
function childrenToTopLevelSections(
  children: EspComposeElement | EspComposeElement[] | undefined
): Record<string, unknown> {
  if (!children) return {};

  const normalized = flattenFragments(Array.isArray(children) ? children : [children]);
  const sections: Record<string, unknown[]> = {};

  for (const child of normalized) {
    if (typeof child.type === 'function') {
      // Render function components inside the esphome root
      const result = child.type(child.props as never);
      if (result == null) continue;
      const rendered = Array.isArray(result) ? result : [result];
      const inner = flattenFragments(rendered);
      for (const c of inner) {
        mergeSection(sections, c);
      }
    } else {
      mergeSection(sections, child);
    }
  }

  // Unwrap single-item arrays
  const out: Record<string, unknown> = {};
  for (const [key, values] of Object.entries(sections)) {
    out[key] = values.length === 1 ? values[0] : values;
  }
  return out;
}

function mergeSection(sections: Record<string, unknown[]>, child: EspComposeElement) {
  const { children: grandchildren, ref, "x:custom": xCustom, ...ownProps } = child.props as Record<string, unknown> & { children?: unknown; ref?: unknown; "x:custom"?: unknown };
  const propsWithId = ref != null
    ? { id: isRef(ref) ? ref.toString() : String(ref), ...ownProps }
    : ownProps;
  const allProps = xCustom != null
    ? { ...propsWithId, ...(xCustom as Record<string, unknown>) }
    : propsWithId;
  const childData = buildChildData(
    grandchildren as EspComposeElement | EspComposeElement[] | undefined
  );
  // Convert camelCase prop keys to snake_case for YAML output.
  const data = stripUndefined(keysToSnakeCase({ ...allProps, ...childData }));
  if (!sections[child.type as string]) sections[child.type as string] = [];
  sections[child.type as string].push(Object.keys(data).length > 0 ? data : null);
}

/**
 * Converts nested children into a sub-object by recursively calling toPlainObject
 * on each child and merging the resulting `{ [type]: data }` pairs.
 */
function buildChildData(
  children: EspComposeElement | EspComposeElement[] | undefined
): Record<string, unknown> {
  if (!children) return {};
  const arr = Array.isArray(children) ? children : [children];
  const out: Record<string, unknown> = {};
  for (const child of arr) {
    const plain = toPlainObject(child);
    if (plain != null && typeof plain === 'object' && !Array.isArray(plain)) {
      Object.assign(out, plain);
    }
  }
  return out;
}

function flattenFragments(elements: EspComposeElement[]): EspComposeElement[] {
  const out: EspComposeElement[] = [];
  for (const el of elements) {
    if (el.type === Fragment) {
      const result = Fragment(el.props as never);
      if (result != null) {
        const nested = Array.isArray(result) ? result : [result];
        out.push(...flattenFragments(nested));
      }
    } else {
      out.push(el);
    }
  }
  return out;
}

function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

function render(element: EspComposeElement | EspComposeElement[]): unknown {
  return toPlainObject(Array.isArray(element) ? element : element);
}

function toYAML(config: unknown): string {
  return yaml.stringify(config, { aliasDuplicateObjects: false, nullStr: '' });
}

export const ESPCompose = {
  createElement,
  Fragment,
  render,
  toYAML,
  useScript,
  withScriptScope,
};

export { createElement, Fragment, render, toYAML };
