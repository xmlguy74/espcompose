/**
 * Field components — composite label + input widgets.
 *
 * Each field compiles to a container with a label and a widget.
 */

import type { EspComposeElement } from '../types';
import { createIntentComponent } from '../intents';
import { type SpacingToken } from '../design-tokens';

// ────────────────────────────────────────────────────────────────────────────
// SliderField
// ────────────────────────────────────────────────────────────────────────────

interface SliderFieldProps {
  /** Label text displayed above the slider. */
  label: string;
  /** Bound value (sensor or entity reference). */
  value?: unknown;
  /** Change handler (ESPHome action). */
  onChange?: unknown;
  /** Minimum value. Default: 0. */
  min?: number;
  /** Maximum value. Default: 100. */
  max?: number;
  /** Gap between label and slider. Default: 'xs'. */
  gap?: SpacingToken | number;
  /** Width of the field container. */
  width?: number | string;
}

/**
 * SliderField — a label + slider composite.
 *
 * @example
 * <SliderField label="Brightness" min={0} max={255} />
 */
export const SliderField = createIntentComponent(
  (props: SliderFieldProps): EspComposeElement => {

    const label: EspComposeElement = {
      type: 'lvgl-label',
      props: {
        text: props.label,
        textFont: 'montserrat_14',
      },
    };

    const sliderProps: Record<string, unknown> = {
      ...(props.min != null ? { minValue: props.min } : {}),
      ...(props.max != null ? { maxValue: props.max } : {}),
      ...(props.value != null ? { value: props.value } : {}),
      ...(props.onChange != null ? { 'x:custom': { on_change: props.onChange } } : {}),
    };

    const slider: EspComposeElement = {
      type: 'lvgl-slider',
      props: sliderProps,
    };

    return {
      type: 'lvgl-obj',
      props: {
        bgOpa: 'TRANSP',
        ...(props.width != null ? { width: props.width } : { width: '100%' }),
        height: 'SIZE_CONTENT',
        'x:custom': {
          layout: {
            type: 'flex',
            flex_flow: 'COLUMN',
          },
        },
        children: [label, slider],
      },
    };
  },
  {
    intents: ['ds:field', 'ds:component', 'lvgl:container', 'lvgl:widget'] as const,
    allowedChildIntents: [] as const,
  },
);

// ────────────────────────────────────────────────────────────────────────────
// SwitchField
// ────────────────────────────────────────────────────────────────────────────

interface SwitchFieldProps {
  /** Label text displayed next to the switch. */
  label: string;
  /** Bound value (sensor or entity reference). */
  value?: unknown;
  /** Change handler (ESPHome action). */
  onChange?: unknown;
  /** Width of the field container. */
  width?: number | string;
}

/**
 * SwitchField — a label + switch in a row layout.
 *
 * @example
 * <SwitchField label="Lamp" />
 */
export const SwitchField = createIntentComponent(
  (props: SwitchFieldProps): EspComposeElement => {
    const label: EspComposeElement = {
      type: 'lvgl-label',
      props: {
        text: props.label,
        textFont: 'montserrat_16',
      },
    };

    const switchProps: Record<string, unknown> = {
      ...(props.value != null ? { 'x:custom': { value: props.value } } : {}),
      ...(props.onChange != null ? { 'x:custom': { on_change: props.onChange } } : {}),
    };

    const switchEl: EspComposeElement = {
      type: 'lvgl-switch',
      props: switchProps,
    };

    return {
      type: 'lvgl-obj',
      props: {
        bgOpa: 'TRANSP',
        ...(props.width != null ? { width: props.width } : { width: '100%' }),
        height: 'SIZE_CONTENT',
        'x:custom': {
          layout: {
            type: 'flex',
            flex_flow: 'ROW',
            flex_align_main: 'SPACE_BETWEEN',
            flex_align_cross: 'CENTER',
          },
        },
        children: [label, switchEl],
      },
    };
  },
  {
    intents: ['ds:field', 'ds:component', 'lvgl:container', 'lvgl:widget'] as const,
    allowedChildIntents: [] as const,
  },
);

// ────────────────────────────────────────────────────────────────────────────
// DropdownField
// ────────────────────────────────────────────────────────────────────────────

interface DropdownFieldProps {
  /** Label text displayed above the dropdown. */
  label: string;
  /** Newline-separated option values (ESPHome LVGL format). */
  options: string;
  /** Bound selection index. */
  value?: unknown;
  /** Change handler (ESPHome action). */
  onChange?: unknown;
  /** Gap between label and dropdown. Default: 'xs'. */
  gap?: SpacingToken | number;
  /** Width of the field container. */
  width?: number | string;
}

/**
 * DropdownField — a label + dropdown composite.
 *
 * @example
 * <DropdownField label="Mode" options={"Auto\nCool\nHeat"} />
 */
export const DropdownField = createIntentComponent(
  (props: DropdownFieldProps): EspComposeElement => {

    const label: EspComposeElement = {
      type: 'lvgl-label',
      props: {
        text: props.label,
        textFont: 'montserrat_14',
      },
    };

    const dropdownProps: Record<string, unknown> = {
      options: props.options,
      ...(props.value != null ? { selected: props.value } : {}),
      ...(props.onChange != null ? { 'x:custom': { on_change: props.onChange } } : {}),
    };

    const dropdown: EspComposeElement = {
      type: 'lvgl-dropdown',
      props: dropdownProps,
    };

    return {
      type: 'lvgl-obj',
      props: {
        bgOpa: 'TRANSP',
        ...(props.width != null ? { width: props.width } : { width: '100%' }),
        height: 'SIZE_CONTENT',
        'x:custom': {
          layout: {
            type: 'flex',
            flex_flow: 'COLUMN',
          },
        },
        children: [label, dropdown],
      },
    };
  },
  {
    intents: ['ds:field', 'ds:component', 'lvgl:container', 'lvgl:widget'] as const,
    allowedChildIntents: [] as const,
  },
);
