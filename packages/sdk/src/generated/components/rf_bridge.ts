// AUTO-GENERATED — DO NOT EDIT.
// Regenerate with: pnpm --filter @esphome/compose codegen

/* eslint-disable */

import type { ComponentProps, Pin, Ref } from "../../types";
import type { _CoreComponent } from "../bases";
import type { rf_bridge_RFBridgeComponent, uart_UARTComponent } from "../markers";
export interface RfBridgeProps extends _CoreComponent {
    /** @yamlKey on_code_received */
    onCodeReceived?: () => void;
    /** @yamlKey on_advanced_code_received */
    onAdvancedCodeReceived?: () => void;
    /** @yamlKey uart_id */
    uartId?: Ref<uart_UARTComponent>;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            rf_bridge: RfBridgeProps & ComponentProps<rf_bridge_RFBridgeComponent>;
        }
    }
}
