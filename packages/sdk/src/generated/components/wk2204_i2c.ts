// AUTO-GENERATED — DO NOT EDIT.
// Regenerate with: pnpm codegen

/* eslint-disable */

import type { ComponentProps, Pin, Ref } from "../../types";
import type { i2c_I2CBus, weikai_i2c_WeikaiComponentI2C } from "../markers";
export interface Wk2204I2cProps {
    /** @yamlKey i2c_id */
    i2cId?: Ref<i2c_I2CBus>;
    address?: unknown;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            wk2204_i2c: Wk2204I2cProps & ComponentProps<weikai_i2c_WeikaiComponentI2C>;
        }
    }
}
