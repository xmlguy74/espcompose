// AUTO-GENERATED — DO NOT EDIT.
// Regenerate with: pnpm --filter @esphome/compose codegen

/* eslint-disable */

import type { ComponentProps, Pin, Ref } from "../../types";
import type { _CoreComponent } from "../bases";
import type { ch422g_CH422GComponent, i2c_I2CBus } from "../markers";
export interface Ch422gProps extends _CoreComponent {
    /** @yamlKey i2c_id */
    i2cId?: Ref<i2c_I2CBus>;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            ch422g: Ch422gProps & ComponentProps<ch422g_CH422GComponent>;
        }
    }
}
