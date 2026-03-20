/**
 * Manual overrides for ESPHome schema fields that are incorrectly tagged in
 * the JSON schema vs. what the Python validator actually enforces.
 *
 * A field can appear here when:
 *  - The JSON schema marks it `Required` but ESPHome auto-computes a default
 *    at the Python layer (not expressed in the JSON schema `default` field).
 *
 * Key format: `${PascalCaseInterfacePrefix}.${snake_case_yaml_key}`
 * e.g. "Esphome.build_path"
 */
export const OPTIONAL_FIELD_OVERRIDES = new Set<string>([
  // ESPHome auto-derives build_path from the node name (.esphome/build/<name>).
  // The JSON schema marks it Required, but it is never set in real-world configs.
  'Esphome.build_path',
]);
