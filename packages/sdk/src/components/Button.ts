/**
 * Button component — interactive button with label.
 *
 * Compiles to <lvgl-button> with an inner <lvgl-label>.
 */

import type { EspComposeElement } from '../types';
import { createIntentComponent } from '../intents';
import {
  resolveStatus,
  resolveSize,
  type StatusToken,
  type SizeToken,
} from '../design-tokens';

type ButtonVariant = 'solid' | 'outline';

interface ButtonProps {
  /** Button label text. */
  text?: string;
  /** Color scheme. Default: 'primary'. */
  status?: StatusToken;
  /** Size. Default: 'md'. */
  size?: SizeToken;
  /** Visual variant. Default: 'solid'. */
  variant?: ButtonVariant;
  /** X position (pixels). */
  x?: number;
  /** Y position (pixels). */
  y?: number;
  /** Width override. */
  width?: number | string;
  /** Height override. */
  height?: number | string;
  /** Press handler (ESPHome action). */
  onPress?: unknown;
}

/**
 * Button — a styled, clickable button with a label.
 *
 * @example
 * <Button text="Toggle Light" status="primary" size="lg" />
 * <Button text="Delete" status="danger" variant="outline" />
 */
export const Button = createIntentComponent(
  (props: ButtonProps): EspComposeElement => {
    const status = props.status ?? 'primary';
    const size = props.size ?? 'md';
    const variant = props.variant ?? 'solid';

    const colors = resolveStatus(status);
    const dims = resolveSize(size);

    const isSolid = variant === 'solid';

    const buttonProps: Record<string, unknown> = {
      width: props.width ?? dims.paddingX * 2 + 80,
      height: props.height ?? dims.height,
      ...(props.x != null ? { x: props.x } : {}),
      ...(props.y != null ? { y: props.y } : {}),
      ...(isSolid
        ? {
            bgColor: colors.bg,
            pressed: { bgColor: colors.bgPressed },
          }
        : {
            bgOpa: 'TRANSP',
            borderColor: colors.bg,
            borderWidth: 2,
            pressed: { bgColor: colors.bg, bgOpa: 'COVER' },
          }),
      ...(props.onPress != null ? { 'x:custom': { on_press: props.onPress } } : {}),
    };

    // Inner label
    const label: EspComposeElement = {
      type: 'lvgl-label',
      props: {
        text: props.text ?? '',
        textColor: isSolid ? colors.text : colors.bg,
        textFont: `montserrat_${dims.fontSize}`,
        align: 'CENTER',
      },
    };

    return {
      type: 'lvgl-button',
      props: {
        ...buttonProps,
        children: [label],
      },
    };
  },
  {
    intents: ['ds:component', 'lvgl:container', 'lvgl:widget'] as const,
    allowedChildIntents: [] as const,
  },
);
