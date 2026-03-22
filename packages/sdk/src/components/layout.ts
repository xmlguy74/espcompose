/**
 * Layout components — VStack, HStack
 *
 * Compile to <lvgl-obj> with ESPHome LVGL flex layout configuration.
 * ESPHome LVGL supports flex layout via the `layout` config key on obj widgets.
 */

import type { EspComposeElement } from '../types';
import { createIntentComponent } from '../intents';
import { resolveSpacing, type SpacingToken } from '../design-tokens';

// ────────────────────────────────────────────────────────────────────────────
// Shared types
// ────────────────────────────────────────────────────────────────────────────

type FlexAlign = 'START' | 'CENTER' | 'END' | 'SPACE_BETWEEN' | 'SPACE_AROUND' | 'SPACE_EVENLY';
type CrossAlign = 'START' | 'CENTER' | 'END';

interface StackProps {
  children?: EspComposeElement | EspComposeElement[];
  /** Gap between children. Token name or pixel value. */
  gap?: SpacingToken | number;
  /** Padding around the container. Token name or pixel value. */
  padding?: SpacingToken | number;
  /** Main axis alignment. */
  align?: FlexAlign;
  /** Cross axis alignment. */
  crossAlign?: CrossAlign;
  /** Width. Numeric pixels, percentage string, or 'SIZE_CONTENT'. */
  width?: number | string;
  /** Height. Numeric pixels, percentage string, or 'SIZE_CONTENT'. */
  height?: number | string;
  /** Background color (hex). */
  bgColor?: string;
  /** Background opacity. */
  bgOpa?: 'TRANSP' | 'COVER';
  /** Border radius. */
  radius?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// VStack
// ────────────────────────────────────────────────────────────────────────────

/**
 * Vertical stack layout — arranges children in a column.
 *
 * Compiles to `<lvgl-obj>` with `layout: { type: flex, flex_flow: COLUMN }`.
 *
 * @example
 * <VStack gap="md" padding="lg">
 *   <Text variant="title">Hello</Text>
 *   <Button text="Click me" />
 * </VStack>
 */
export const VStack = createIntentComponent(
  (props: StackProps): EspComposeElement => {
    const padding = props.padding != null ? resolveSpacing(props.padding) : undefined;

    return {
      type: 'lvgl-obj',
      props: {
        ...(props.width != null ? { width: props.width } : {}),
        ...(props.height != null ? { height: props.height } : {}),
        ...(padding != null ? { padAll: padding } : {}),
        ...(props.bgColor != null ? { bgColor: props.bgColor } : {}),
        ...(props.bgOpa != null ? { bgOpa: props.bgOpa } : { bgOpa: 'TRANSP' }),
        ...(props.radius != null ? { radius: props.radius } : {}),
        'x:custom': {
          layout: {
            type: 'flex',
            flex_flow: 'COLUMN',
            ...(props.align ? { flex_align_main: props.align } : {}),
            ...(props.crossAlign ? { flex_align_cross: props.crossAlign } : {}),
          },
        },
        ...(props.children
          ? { children: Array.isArray(props.children) ? props.children : [props.children] }
          : {}),
      },
    };
  },
  {
    intents: ['ds:layout', 'lvgl:container', 'lvgl:widget'] as const,
    allowedChildIntents: ['ds:component', 'ds:layout', 'ds:field', 'lvgl:widget', 'lvgl:container'] as const,
  },
);

// ────────────────────────────────────────────────────────────────────────────
// HStack
// ────────────────────────────────────────────────────────────────────────────

/**
 * Horizontal stack layout — arranges children in a row.
 *
 * Compiles to `<lvgl-obj>` with `layout: { type: flex, flex_flow: ROW }`.
 *
 * @example
 * <HStack gap="sm" align="SPACE_BETWEEN">
 *   <Text>Left</Text>
 *   <Text>Right</Text>
 * </HStack>
 */
export const HStack = createIntentComponent(
  (props: StackProps): EspComposeElement => {
    const padding = props.padding != null ? resolveSpacing(props.padding) : undefined;

    return {
      type: 'lvgl-obj',
      props: {
        ...(props.width != null ? { width: props.width } : {}),
        ...(props.height != null ? { height: props.height } : {}),
        ...(padding != null ? { padAll: padding } : {}),
        ...(props.bgColor != null ? { bgColor: props.bgColor } : {}),
        ...(props.bgOpa != null ? { bgOpa: props.bgOpa } : { bgOpa: 'TRANSP' }),
        ...(props.radius != null ? { radius: props.radius } : {}),
        'x:custom': {
          layout: {
            type: 'flex',
            flex_flow: 'ROW',
            ...(props.align ? { flex_align_main: props.align } : {}),
            ...(props.crossAlign ? { flex_align_cross: props.crossAlign } : {}),
          },
        },
        ...(props.children
          ? { children: Array.isArray(props.children) ? props.children : [props.children] }
          : {}),
      },
    };
  },
  {
    intents: ['ds:layout', 'lvgl:container', 'lvgl:widget'] as const,
    allowedChildIntents: ['ds:component', 'ds:layout', 'ds:field', 'lvgl:widget', 'lvgl:container'] as const,
  },
);
