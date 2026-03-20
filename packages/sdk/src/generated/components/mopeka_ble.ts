// AUTO-GENERATED — DO NOT EDIT.
// Regenerate with: pnpm --filter @esphome/compose codegen

/* eslint-disable */

import type { ComponentProps, Pin, Ref } from "../../types";
import type { _BthomeMithermometerBleDevice } from "../bases";
import type { mopeka_ble_MopekaListener } from "../markers";
export interface MopekaBleProps extends _BthomeMithermometerBleDevice {
    /** @yamlKey show_sensors_without_sync */
    showSensorsWithoutSync?: boolean;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            mopeka_ble: MopekaBleProps & ComponentProps<mopeka_ble_MopekaListener>;
        }
    }
}
