# Trigger Type Report: Reducing `unknown` Props

## Summary

This report documents the audit of `unknown` prop types across the espcompose
codebase and the introduction of the `Trigger<T>` type to formalize event
handler / ESPHome trigger props.

---

## The `TriggerHandler<T>` Type

### Definition

```typescript
type TriggerHandler<T = void> = (args: T) => void;
```

> **Naming note:** The type is named `TriggerHandler` rather than `Trigger`
> because the generated markers file already exports an `interface Trigger`
> phantom type representing ESPHome's C++ `::Trigger` base class.

- `TriggerHandler` (alias for `TriggerHandler<void>`) — triggers with no variables (`on_press`, `on_release`, `on_click`)
- `TriggerHandler<{ x: number }>` — numeric variable triggers (`sensor.on_value`, `lvgl_slider.on_value`)
- `TriggerHandler<{ x: boolean }>` — boolean variable triggers (`binary_sensor.on_state`, `switch.on_state`)
- `TriggerHandler<{ x: string }>` — string variable triggers (`text_sensor.on_value`)

### Motivation

Event handler props were typed inconsistently:

| Before | Where | Count |
|--------|-------|-------|
| `() => void` | Generated component props (codegen) | ~200 trigger props across 266 files |
| `unknown` | Hand-written UI components (Button, SliderField, etc.) | 7 occurrences |
| `unknown` | Generated action callback params (`onSuccess`, `onError`) | 12 occurrences |
| `unknown` | E2E test helper components | 2 occurrences |

All of these represent the same concept: an ESPHome trigger/automation callback.
The `TriggerHandler<T>` type unifies them under a single, parameterized type that
carries trigger variable metadata.

### Trigger Variable Inference

The trigger registry (`packages/sdk/src/trigger-registry.ts`) maps ESPHome
domains and trigger names to available lambda variables. The codegen pipeline
now uses this registry to emit correctly parameterized `TriggerHandler<T>` types:

| Domain | Trigger | Generated Type |
|--------|---------|---------------|
| `binary_sensor` | `on_press` | `TriggerHandler` (no variables) |
| `binary_sensor` | `on_state` | `TriggerHandler<{ x: boolean }>` |
| `sensor` | `on_value` | `TriggerHandler<{ x: number }>` |
| `text_sensor` | `on_value` | `TriggerHandler<{ x: string }>` |
| `lvgl_slider` | `on_value` | `TriggerHandler<{ x: number }>` |
| (unregistered) | any | `TriggerHandler` (safe fallback) |

---

## Findings: Other `unknown` Props (Non-Trigger)

Approximately 1,255 additional `unknown` occurrences exist in generated code.
These are **not** event handlers — they come from the `default` fallback in the
codegen type-mapper when the ESPHome schema field type is unrecognized.

### Generated Code Breakdown

| Category | Examples | ~Count | Root Cause |
|----------|----------|--------|------------|
| Time durations | `days`, `hours`, `seconds`, `milliseconds` | 80 | No handler for ESPHome `time_period` type |
| Entity metadata | `name`, `icon`, `entityCategory`, `deviceId` | 200+ | String fields lost during `extends` chain resolution |
| Templatable numbers | `sortingWeight`, `accuracyDecimals` | 200+ | `templatable: true` but no recognized base type |
| MQTT config | `topic`, `stateTopic`, `qos` | 100+ | String/enum types lost in schema merging |
| Color values | `red`, `green`, `blue`, `brightness` | 30 | Missing `color_channel` type handler |
| Numeric limits | `minPower`, `maxPower`, `minTemperature` | 50 | Numeric type absent in schema |
| IP addresses | `staticIp`, `gateway`, `subnet` | 15 | No `ip_address` type handler |
| Complex objects | `effects`, `filters` | 20 | Array/schema too complex to inline |

### Hand-Written SDK (~32 occurrences)

These are intentional design choices and do not need changes:

- **Generic defaults** (`BaseRef<T = unknown>`, `Expression<T = unknown>`) — standard TypeScript pattern
- **Type guards** (`isRef(val: unknown)`) — correct for narrowing functions
- **`x:custom` Record** — intentionally flexible escape hatch for unsupported props
- **`PinConfig` index signature** — extensibility for platform-specific pin options
- **`AnyProps`** — catch-all for untyped JSX elements

### Recommendations for Generated `unknown`

Improving these requires enhancing `type-mapper.ts` `resolveBaseType()` with
additional type cases. Priority targets for a separate effort:

1. **Time durations** → `string | number` (ESPHome accepts `"10s"`, `"500ms"`, or raw ms)
2. **Templatable fields** → `number | string` (template expressions are strings)
3. **String fields lost in extends** → better resolution of inherited types through `extends` chains

---

## Follow-Up: `Expression<T>` for Reactive Bindings

The `value?: unknown` props in form field components (SliderField, SwitchField,
DropdownField) represent **reactive bindings**, not triggers. These accept
`Expression<T>` instances created from `Ref<T>` reactive property access:

```tsx
const tempRef = useRef<sensor_Sensor>();
<SliderField label="Temperature" value={tempRef.value} />
//                                      ↑ Expression<number>
```

Currently typed as `unknown`, these could be formalized as:

| Component | Prop | Candidate Type |
|-----------|------|---------------|
| `SliderField` | `value` | `Expression<number>` |
| `SwitchField` | `value` | `Expression<boolean>` |
| `DropdownField` | `value` | `Expression<number>` (selection index) |

This is related but distinct from the `Trigger<T>` work. The `Expression<T>`
class already exists in the SDK and is well-typed; the improvement is about
using it in prop interfaces instead of `unknown`. This should be addressed in a
follow-up to avoid conflating two different type-safety improvements.

Key considerations for the `Expression<T>` follow-up:

- `Expression<T>` currently compiles to `!lambda` YAML scalars via the serializer
- The compiler's reactive-injector already understands `Expression<T>` dependencies
- Typing these props would enable better IDE autocomplete when binding refs to widgets
- May need union types like `Expression<number> | number` to allow both reactive and static values
