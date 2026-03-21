// AUTO-GENERATED — DO NOT EDIT.
// Regenerate with: pnpm codegen

/* eslint-disable */

import type { ComponentProps, Pin } from "../../types";
export interface HostProps {
    /**
     * MAC address: A dummy MAC address to use when communicating with HA.
     * @yamlKey mac_address
     */
    macAddress?: unknown;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            host: HostProps & ComponentProps;
        }
    }
}
