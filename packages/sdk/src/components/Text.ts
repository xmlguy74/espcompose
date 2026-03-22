/**
 * Text component — semantic text display.
 *
 * Compiles to <lvgl-label> with typography tokens applied.
 */

import type { EspComposeElement } from '../types';
import { createIntentComponent } from '../intents';
import { resolveTypography, type TextVariant } from '../design-tokens';

interface TextProps {
  children?: EspComposeElement | EspComposeElement[];
  /** Typography variant. Determines font size. Default: 'body'. */
  variant?: TextVariant;
  /** Static text content. Use this or children. */
  text?: string;
  /** Text alignment within the label. */
  align?: 'LEFT' | 'CENTER' | 'RIGHT' | 'AUTO';
  /** Text color (hex). */
  color?: string;
  /** Long text mode. */
  longMode?: 'WRAP' | 'DOT' | 'SCROLL' | 'SCROLL_CIRCULAR' | 'CLIP';
  /** X position (pixels). */
  x?: number;
  /** Y position (pixels). */
  y?: number;
  /** Width. */
  width?: number | string;
}

/**
 * Text — a styled label component.
 *
 * @example
 * <Text variant="title">Living Room</Text>
 * <Text variant="caption" color="0x888888">Last updated: 5m ago</Text>
 */
export const Text = createIntentComponent(
  (props: TextProps): EspComposeElement => {
    const variant = props.variant ?? 'body';
    const typo = resolveTypography(variant);

    // Extract "text" from children if it's a string element
    const text = props.text ?? extractTextFromChildren(props.children);

    return {
      type: 'lvgl-label',
      props: {
        text,
        textFont: typo.textFont,
        ...(props.align != null ? { textAlign: props.align } : {}),
        ...(props.color != null ? { textColor: props.color } : {}),
        ...(props.longMode != null ? { longMode: props.longMode } : {}),
        ...(props.x != null ? { x: props.x } : {}),
        ...(props.y != null ? { y: props.y } : {}),
        ...(props.width != null ? { width: props.width } : {}),
      },
    };
  },
  {
    intents: ['ds:component', 'lvgl:widget'] as const,
    allowedChildIntents: [] as const,
  },
);

/**
 * Extract string text from children.
 * In espcompose, text children are passed as EspComposeElements with string content,
 * but for simplicity we support direct string props primarily.
 */
function extractTextFromChildren(children: EspComposeElement | EspComposeElement[] | undefined): string | undefined {
  if (children == null) return undefined;
  // If children is a single element with a string type, use its type as text
  // In espcompose's JSX factory, text nodes aren't supported the same way as React.
  // Users should use the `text` prop instead of children for text content.
  return undefined;
}
