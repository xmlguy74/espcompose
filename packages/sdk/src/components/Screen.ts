/**
 * Screen component — top-level page wrapper.
 *
 * Compiles to <lvgl-page> with optional padding.
 * This is the primary entry point for a page in the design system.
 */

import type { EspComposeElement } from '../types';
import { createIntentComponent } from '../intents';
import { resolveSpacing, type SpacingToken } from '../design-tokens';

interface ScreenProps {
  children?: EspComposeElement | EspComposeElement[];
  /** Padding around the page content. Token name or pixel value. */
  padding?: SpacingToken | number;
  /** Skip this page in the page list. */
  skip?: boolean;
}

/**
 * Screen — a top-level LVGL page container.
 *
 * @example
 * <Screen padding="lg">
 *   <VStack gap="md">
 *     <Text variant="title">Home</Text>
 *     <Button text="Toggle" />
 *   </VStack>
 * </Screen>
 */
export const Screen = createIntentComponent(
  (props: ScreenProps): EspComposeElement => {
    const padding = props.padding != null ? resolveSpacing(props.padding) : undefined;

    return {
      type: 'lvgl-page',
      props: {
        ...(padding != null ? { padAll: padding } : {}),
        ...(props.skip != null ? { skip: props.skip } : {}),
        ...(props.children
          ? { children: Array.isArray(props.children) ? props.children : [props.children] }
          : {}),
      },
    };
  },
  {
    intents: ['ds:screen', 'lvgl:page'] as const,
    allowedChildIntents: ['ds:layout', 'ds:component', 'ds:field', 'lvgl:widget', 'lvgl:container'] as const,
  },
);
