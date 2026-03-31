import { describe, it, expect, beforeEach } from 'vitest';
import { setPhase } from './phase';
import { _reactive } from './_reactive';
import { ReactiveNode, isReactiveNode } from './reactive-node';
import { withReactiveScope } from './hooks/useReactiveScope';

describe('_reactive', () => {
  beforeEach(() => {
    setPhase('render');
  });

  describe('_reactive.compiled()', () => {
    it('creates ReactiveNode from pre-computed metadata', () => {
      withReactiveScope(() => {
        const result = _reactive.compiled<string>({
          cpp: 'sig_ha_light_office.get() ? std::string("On") : std::string("Off")',
          type: 'std::string',
          deps: [{
            signalName: 'sig_ha_light_office',
            sourceId: 'ha_light_office',
            triggerType: 'on_state',
            sourceDomain: 'binary_sensor',
            cppType: 'bool',
          }],
        });

        expect(isReactiveNode(result)).toBe(true);
        expect(result.kind).toBe('memo');
        expect(result.dependencies).toHaveLength(1);
        expect(result.dependencies[0].sourceId).toBe('ha_light_office');
        expect(result.dependencies[0].cppSignalName).toBe('sig_ha_light_office');
        expect(result.cppExpression).toBe('sig_ha_light_office.get() ? std::string("On") : std::string("Off")');
        expect(result.cppReturnType).toBe('std::string');
      });
    });

    it('creates ReactiveNode with multiple dependencies', () => {
      withReactiveScope(() => {
        const result = _reactive.compiled<string>({
          cpp: 'sig_ha_light_office.get() && sig_ha_sensor_temp.get() > 72 ? std::string("Comfortable") : std::string("Adjust")',
          type: 'std::string',
          deps: [
            { signalName: 'sig_ha_light_office', sourceId: 'ha_light_office', triggerType: 'on_state', sourceDomain: 'binary_sensor', cppType: 'bool' },
            { signalName: 'sig_ha_sensor_temp', sourceId: 'ha_sensor_temp', triggerType: 'on_value', sourceDomain: 'sensor', cppType: 'float' },
          ],
        });

        expect(result.dependencies).toHaveLength(2);
        expect(result.cppExpression).toContain('sig_ha_light_office.get()');
        expect(result.cppExpression).toContain('sig_ha_sensor_temp.get()');
      });
    });
  });

  describe('_reactive.slotted()', () => {
    it('substitutes single slot placeholder with signal name', () => {
      withReactiveScope(() => {
        const signal = new ReactiveNode({
          kind: 'expression',
          dependencies: [{ sourceId: 'ha_temp', triggerType: 'on_value', sourceDomain: 'sensor', cppSignalName: 'sig_ha_temp', cppType: 'float' }],
          cppExpression: 'sig_ha_temp.get()',
          cppSignalName: 'sig_ha_temp',
          cppType: 'float',
        });

        const result = _reactive.slotted<number>(
          { cpp: '__$$SLOT_0$$__.get() * 2 + 80', type: 'float', slots: 1 },
          signal,
        );

        expect(isReactiveNode(result)).toBe(true);
        expect(result.cppExpression).toBe('sig_ha_temp.get() * 2 + 80');
        expect(result.cppReturnType).toBe('float');
        expect(result.dependencies).toHaveLength(1);
        expect(result.dependencies[0].cppSignalName).toBe('sig_ha_temp');
      });
    });

    it('substitutes multiple slot placeholders', () => {
      withReactiveScope(() => {
        const sigA = new ReactiveNode({
          kind: 'expression',
          dependencies: [{ sourceId: 'ha_a', triggerType: 'on_value', sourceDomain: 'sensor', cppSignalName: 'sig_a', cppType: 'float' }],
          cppExpression: 'sig_a.get()',
          cppSignalName: 'sig_a',
        });
        const sigB = new ReactiveNode({
          kind: 'expression',
          dependencies: [{ sourceId: 'ha_b', triggerType: 'on_state', sourceDomain: 'binary_sensor', cppSignalName: 'sig_b', cppType: 'bool' }],
          cppExpression: 'sig_b.get()',
          cppSignalName: 'sig_b',
        });

        const result = _reactive.slotted<string>(
          { cpp: '__$$SLOT_1$$__.get() ? std::string("on") : std::to_string(__$$SLOT_0$$__.get())', type: 'std::string', slots: 2 },
          sigA, sigB,
        );

        expect(result.cppExpression).toBe('sig_b.get() ? std::string("on") : std::to_string(sig_a.get())');
        expect(result.dependencies).toHaveLength(2);
      });
    });

    it('resolves type placeholder from signal cppType', () => {
      withReactiveScope(() => {
        const signal = new ReactiveNode({
          kind: 'expression',
          dependencies: [{ sourceId: '__theme__', triggerType: '__theme__', sourceDomain: '__theme__', cppSignalName: 'thm_colors_primary_bg', cppType: 'lv_color_t' }],
          cppExpression: 'thm_colors_primary_bg.get()',
          cppSignalName: 'thm_colors_primary_bg',
          cppType: 'lv_color_t',
        });

        const result = _reactive.slotted<unknown>(
          { cpp: '__$$SLOT_0$$__.get()', type: '__$$SLOT_TYPE_0$$__', slots: 1 },
          signal,
        );

        expect(result.cppReturnType).toBe('lv_color_t');
        expect(result.cppExpression).toBe('thm_colors_primary_bg.get()');
      });
    });

    it('collects dependencies from all signal arguments', () => {
      withReactiveScope(() => {
        const sig1 = new ReactiveNode({
          kind: 'expression',
          dependencies: [
            { sourceId: 's1', triggerType: 'on_value', sourceDomain: 'sensor', cppSignalName: 'sig_s1', cppType: 'float' },
          ],
          cppExpression: 'sig_s1.get()',
          cppSignalName: 'sig_s1',
        });
        const sig2 = new ReactiveNode({
          kind: 'expression',
          dependencies: [
            { sourceId: 's2', triggerType: 'on_state', sourceDomain: 'binary_sensor', cppSignalName: 'sig_s2', cppType: 'bool' },
            { sourceId: 's3', triggerType: 'on_value', sourceDomain: 'sensor', cppSignalName: 'sig_s3', cppType: 'float' },
          ],
          cppExpression: 'sig_s2.get()',
          cppSignalName: 'sig_s2',
        });

        const result = _reactive.slotted<number>(
          { cpp: '__$$SLOT_0$$__.get() + __$$SLOT_1$$__.get()', type: 'float', slots: 2 },
          sig1, sig2,
        );

        expect(result.dependencies).toHaveLength(3);
      });
    });
  });

  describe('_reactive.derivedMemo()', () => {
    it('creates derived memo with explicit C++ expression', () => {
      withReactiveScope(() => {
        const result = _reactive.derivedMemo<string>({
          cppExpression: 'resolve_font("montserrat", 28)',
          cppReturnType: 'const lv_font_t*',
          dependencies: [
            { sourceId: '__theme__', triggerType: '__theme__', sourceDomain: '__theme__', cppSignalName: 'thm_font', cppType: 'std::string' },
          ],
        });

        expect(isReactiveNode(result)).toBe(true);
        expect(result.kind).toBe('memo');
        expect(result.cppExpression).toBe('resolve_font("montserrat", 28)');
        expect(result.cppReturnType).toBe('const lv_font_t*');
      });
    });
  });
});
