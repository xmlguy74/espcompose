// AUTO-GENERATED — DO NOT EDIT.
// Regenerate with: pnpm --filter @esphome/compose codegen

/* eslint-disable */

import type { ComponentProps, Pin, Ref } from "../../types";
import type { Color, display_Display, font_Font, graphical_display_menu_GraphicalDisplayMenu } from "../markers";
export interface GraphicalDisplayMenuProps {
    /** [ID](/guides/configuration-types#id): ID of the display to render to. See [Drawing Modes](https://esphome.io/componen... */
    display?: Ref<display_Display>;
    /** [Font](/components/font#display-fonts): Specifies the font to use */
    font: Ref<font_Font>;
    /**
     * string: Specifies how to render values for menu items that have values (eg. Selects, numbers). Defaults to rendering ...
     * @yamlKey menu_item_value
     */
    menuItemValue?: string;
    /**
     * [Color](/components/display#config-color): Specifies the foreground color to use. Defaults to COLOR_ON
     * @yamlKey foreground_color
     */
    foregroundColor?: Ref<Color>;
    /**
     * [Color](/components/display#config-color): Specifies the background color to use. Defaults to COLOR_OFF
     * @yamlKey background_color
     */
    backgroundColor?: Ref<Color>;
    /**
     * [Automation](/automations): An automation to perform when the menu needs to be redrawn. This can be useful if your di...
     * @yamlKey on_redraw
     */
    onRedraw?: () => void;
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            graphical_display_menu: GraphicalDisplayMenuProps & ComponentProps<graphical_display_menu_GraphicalDisplayMenu>;
        }
    }
}
