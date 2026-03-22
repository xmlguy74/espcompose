/**
 * Card component — a styled container for grouping content.
 *
 * Compiles to <lvgl-obj> with rounded corners, padding, and an optional background.
 */

import type { EspComposeElement } from '../types';
import { createIntentComponent } from '../intents';
import { resolveSpacing, resolveRadius, type SpacingToken, type RadiusToken } from '../design-tokens';

interface CardProps {
  children?: EspComposeElement | EspComposeElement[];
  /** Padding inside the card. Default: 'md'. */
  padding?: SpacingToken | number;
  /** Corner radius. Default: 'md'. */
  radius?: RadiusToken | number;
  /** Background color (hex). Default: '0x2D2D2D'. */
  bgColor?: string;
  /** Border color (hex). */
  borderColor?: string;
  /** Border width. Default: 0. */
  borderWidth?: number;
  /** Width. */
  width?: number | string;
  /** Height. */
  height?: number | string;
}

/**
 * Card — a styled container with background and rounded corners.
 *
 * @example
 * <Card>
 *   <Text variant="title">Living Room</Text>
 *   <SliderField label="Brightness" />
 * </Card>
 */
export const Card = createIntentComponent(
  (props: CardProps): EspComposeElement => {
    const padding = resolveSpacing(props.padding ?? 'md');
    const radius = resolveRadius(props.radius ?? 'md');

    return {
      type: 'lvgl-obj',
      props: {
        padAll: padding,
        radius,
        bgColor: props.bgColor ?? '0x2D2D2D',
        ...(props.borderColor != null ? { borderColor: props.borderColor } : {}),
        ...(props.borderWidth != null ? { borderWidth: props.borderWidth } : {}),
        ...(props.width != null ? { width: props.width } : {}),
        ...(props.height != null ? { height: props.height } : {}),
        'x:custom': {
          layout: {
            type: 'flex',
            flex_flow: 'COLUMN',
          },
        },
        ...(props.children
          ? { children: Array.isArray(props.children) ? props.children : [props.children] }
          : {}),
      },
    };
  },
  {
    intents: ['ds:component', 'lvgl:container', 'lvgl:widget'] as const,
    allowedChildIntents: ['ds:component', 'ds:layout', 'ds:field', 'lvgl:widget', 'lvgl:container'] as const,
  },
);
