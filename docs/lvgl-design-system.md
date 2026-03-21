# 🧠 espcompose LVGL Design System — AI Guidance Prompt

## Purpose

You are working with **espcompose**, a TypeScript/TSX-based toolkit that compiles UI definitions into **ESPHome YAML using LVGL**.

This is **NOT a React runtime**.

It is a:

> **Declarative UI compiler that uses React-like syntax to generate an imperative embedded UI system.**

---

# ⚠️ Core Mental Model (Critical)

### ❌ This is NOT React

* No virtual DOM
* No re-rendering
* No component lifecycle
* No hooks like `useState` or `useEffect`

### ✅ This IS:

* A **compile-time DSL**
* Producing a **static widget tree**
* With **event-driven updates via bindings**

---

# 🔁 What “Reactivity” Means Here

Reactivity is **NOT rendering**.

It is:

> **Bindings → compiled into subscriptions → imperative widget updates**

### Example

```tsx
<Text value={sensor.temp} />
```

Compiles conceptually into:

```yaml
on_value:
  - lambda: lv_label_set_text(...)
```

### Key Idea

> UI updates happen by **mutating existing widgets**, not re-rendering them.

---

# 🧩 Design System Goals

The design system should:

1. Provide a **high-level, ergonomic API** (like Ant Design)
2. Hide LVGL complexity where possible
3. Still allow **low-level escape hatches**
4. Compile cleanly into:

   * LVGL widgets
   * ESPHome automations
   * C++ lambdas

---

# 🏗️ Architecture Overview

## Two Layers

### 1. Intrinsic Elements (Low-level)

Thin wrappers over LVGL:

```tsx
<lv-label />
<lv-button />
<lv-slider />
```

Used for:

* full control
* advanced cases

---

### 2. Design System Components (Preferred API)

High-level, semantic components:

```tsx
<Text />
<Button />
<Card />
<SliderField />
<VStack />
```

Used for:

* most UI authoring
* consistency
* simplicity

---

# 🧱 Core Concepts

## 1. Static Widget Tree

All components compile into a **fixed tree**.

```tsx
<VStack>
  <Text />
  <Button />
</VStack>
```

➡️ No dynamic insertion/removal at runtime
➡️ Only visibility/state changes

---

## 2. Bindings (Primary Dynamic Mechanism)

```tsx
<Text value={sensor.temp} />
```

Bindings:

* subscribe to data sources
* generate update handlers
* mutate widget properties

### Binding Sources

* sensors
* Home Assistant entities
* computed expressions

---

## 3. Event → Action Model

```tsx
<Button onPress={ha.toggle('light.kitchen')} />
```

Compiles to:

* LVGL event handler
* ESPHome action

👉 No state transitions or re-rendering

---

## 4. Visibility Instead of Conditional Rendering

❌ Do NOT do this:

```tsx
{isOn && <Light />}
```

✅ Do this:

```tsx
<Light show={sensor.isOn} />
```

Compiles to:

* LVGL hidden flag toggle

---

## 5. Styling Model (LVGL-native)

LVGL uses:

> **Parts + States (NOT CSS selectors)**

### Parts (examples)

* `main`
* `indicator`
* `knob`
* `items`

### States (examples)

* `default`
* `pressed`
* `focused`
* `checked`
* `disabled`

### Design System API

```tsx
<Slider
  partStyle={{
    knob: {
      default: { bg: 'primary' },
      pressed: { scale: 1.1 }
    }
  }}
/>
```

---

## 6. Design Tokens First

Use semantic tokens instead of raw styles:

```tsx
<Button status="primary" size="md" variant="solid" />
```

Instead of:

```tsx
<Button style={{ backgroundColor: '#123456' }} />
```

---

## 7. Layout Over Positioning

Prefer layout components:

```tsx
<VStack gap="md">
  <Text />
  <Button />
</VStack>
```

Instead of:

* x/y positioning

---

## 8. Fields Over Raw Inputs

Prefer:

```tsx
<SliderField label="Brightness" value={...} />
```

Over:

```tsx
<Slider />
<Text />
```

---

## 9. IDs Are Required for Updates

Every dynamic widget must have an ID:

```yaml
id: temp_label
```

Used by:

```cpp
lv_label_set_text(...)
```

AI should:

* auto-generate IDs when needed
* ensure uniqueness

---

## 10. Formatting Must Be Compilable

Allowed:

```tsx
(v) => `${v}°`
```

NOT allowed:

* arbitrary JS
* async logic
* closures with external state

All formatting must:

* be pure
* compile to C++

---

# 🧠 What the AI Should Optimize For

When generating or modifying code:

### ✅ Prefer:

* semantic components (`<Card>`, `<Text>`)
* bindings over manual updates
* tokens over raw styles
* layout components
* field abstractions

### ❌ Avoid:

* React mental model (state, re-render)
* dynamic tree mutation
* CSS-like styling
* complex inline logic
* unnecessary low-level LVGL usage

---

# 🧪 Example (Correct)

```tsx
<Screen id="home">
  <VStack gap="lg" padding="lg">
    <Card>
      <Text variant="title">Living Room</Text>

      <SliderField
        label="Brightness"
        value={ha.entity('light.brightness')}
        onChange={ha.setNumber('light.brightness')}
      />

      <SwitchField
        label="Lamp"
        value={ha.entity('switch.lamp')}
        onChange={ha.toggle('switch.lamp')}
      />
    </Card>
  </VStack>
</Screen>
```

---

# 🧪 Example (Incorrect)

```tsx
const [value, setValue] = useState(0);

return (
  <div>
    {value > 10 && <Text>{value}</Text>}
  </div>
);
```

❌ Invalid because:

* uses React state
* conditional rendering
* assumes re-rendering

---

# 🧾 Summary (One-liner)

> **espcompose is a declarative TSX UI compiler that generates a static LVGL widget tree with event-driven updates via bindings.**
