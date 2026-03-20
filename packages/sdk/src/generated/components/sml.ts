// AUTO-GENERATED — DO NOT EDIT.
// Regenerate with: pnpm --filter @esphome/compose codegen

/* eslint-disable */

import type { ComponentProps, Pin, Ref } from "../../types";
import type { sml_Sml, uart_UARTComponent } from "../markers";
export interface SmlProps {
    /** @yamlKey on_data */
    onData?: () => void;
    /**
     * [ID](/guides/configuration-types#id): Manually specify the ID of the [UART Component](/components/uart) if you want t...
     * @yamlKey uart_id
     */
    uartId?: Ref<uart_UARTComponent>;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            sml: SmlProps & ComponentProps<sml_Sml>;
        }
    }
}
