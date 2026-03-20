// AUTO-GENERATED — DO NOT EDIT.
// Regenerate with: pnpm --filter @esphome/compose codegen

/* eslint-disable */

import type { ComponentProps, Pin, Ref } from "../../types";
import type { _CoreComponent } from "../bases";
import type { ld2420_LD2420Component, uart_UARTComponent } from "../markers";
export interface Ld2420Props extends _CoreComponent {
    /** @yamlKey uart_id */
    uartId?: Ref<uart_UARTComponent>;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            ld2420: Ld2420Props & ComponentProps<ld2420_LD2420Component>;
        }
    }
}
