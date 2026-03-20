// AUTO-GENERATED — DO NOT EDIT.
// Regenerate with: pnpm --filter @esphome/compose codegen

/* eslint-disable */

import type { ComponentProps, Pin, Ref } from "../../types";
import type { _Pn532 } from "../bases";
import type { i2c_I2CBus, pn532_i2c_PN532I2C } from "../markers";
export interface Pn532I2cProps extends _Pn532 {
    /** @yamlKey i2c_id */
    i2cId?: Ref<i2c_I2CBus>;
    address?: unknown;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            pn532_i2c: Pn532I2cProps & ComponentProps<pn532_i2c_PN532I2C>;
        }
    }
}
