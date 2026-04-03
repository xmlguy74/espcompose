import type {
  IRData,
  IRSection,
  HAEntityRegistration,
  ComponentRegistration,
  IRScriptDefinition,
  ReactiveBinding,
  TreeNode,
} from './types';

let _idSeq = 0;
function uid(prefix: string) {
  return `${prefix}_${_idSeq++}`;
}

// ── Generic recursive builder ──────────────────────────────────────────────
// Walks any JSON-like value and produces tree children for objects and arrays.
// Scalars become leaf nodes (chip shows the value). Objects and arrays become
// parent nodes whose children are recursively built.

function buildValueChildren(data: unknown, idPrefix: string): TreeNode[] | undefined {
  if (data === null || typeof data !== 'object') return undefined;

  const entries: [string, unknown][] = Array.isArray(data)
    ? (data as unknown[]).map((v, i) => [String(i), v])
    : Object.entries(data as Record<string, unknown>);

  if (entries.length === 0) return undefined;

  return entries.map(([key, val]) => buildValueNode(key, val, `${idPrefix}_${key}`));
}

function buildValueNode(label: string, val: unknown, idSuffix: string): TreeNode {
  const isArr = Array.isArray(val);
  const isObj = typeof val === 'object' && val !== null && !isArr;

  let chip: string | undefined;
  if (typeof val === 'string') chip = val.length > 40 ? val.slice(0, 40) + '…' : val;
  else if (typeof val === 'number' || typeof val === 'boolean') chip = String(val);
  else if (val === null) chip = 'null';
  else if (isArr) chip = `[${(val as unknown[]).length}]`;
  else if (isObj) chip = `{${Object.keys(val as Record<string, unknown>).length}}`;

  return {
    id: uid(idSuffix),
    label,
    chip,
    data: val,
    children: isArr || isObj ? buildValueChildren(val, idSuffix) : undefined,
  };
}

// ── Top-level builder ──────────────────────────────────────────────────────

export function buildTree(data: IRData, showInternal = false): TreeNode[] {
  _idSeq = 0;
  // showInternal is reserved for future use (filtering __ fields inside node.data
  // shown in the detail panel). The tree structure itself is not filtered.
  void showInternal;
  const roots: TreeNode[] = [];

  if (data.esphome) {
    roots.push(buildEsphome(data.esphome));
  }
  if (data.espcompose) {
    roots.push(buildEspcompose(data.espcompose));
  }

  return roots;
}

// ── esphome subtree ────────────────────────────────────────────────────────

function buildEsphome(esphome: IRData['esphome']): TreeNode {
  const children: TreeNode[] = [];

  if (esphome.sections?.length) {
    children.push({
      id: uid('sections'),
      label: 'sections',
      chip: String(esphome.sections.length),
      data: esphome.sections,
      children: esphome.sections.map(buildSection),
    });
  }

  if (esphome.haEntities?.length) {
    children.push({
      id: uid('haEntities'),
      label: 'haEntities',
      chip: String(esphome.haEntities.length),
      data: esphome.haEntities,
      children: esphome.haEntities.map(buildHAEntity),
    });
  }

  if (esphome.components?.length) {
    children.push({
      id: uid('components'),
      label: 'components',
      chip: String(esphome.components.length),
      data: esphome.components,
      children: esphome.components.map(buildComponent),
    });
  }

  if (esphome.scripts?.length) {
    children.push({
      id: uid('scripts'),
      label: 'scripts',
      chip: String(esphome.scripts.length),
      data: esphome.scripts,
      children: esphome.scripts.map(buildScript),
    });
  }

  return {
    id: uid('esphome'),
    label: 'esphome',
    data: esphome,
    children,
  };
}

function buildSection(section: IRSection): TreeNode {
  return {
    id: uid(`section_${section.key}`),
    label: section.key,
    chip: section.value?.kind,
    chipColor: 'primary',
    data: section,
    children: buildValueChildren(section.value, `section_${section.key}_value`),
  };
}

function buildHAEntity(entity: HAEntityRegistration): TreeNode {
  return {
    id: uid(`entity_${entity.generatedId}`),
    label: entity.entityId,
    chip: entity.sensorType,
    chipColor: 'success',
    data: entity,
    children: buildValueChildren(entity, `entity_${entity.generatedId}`),
  };
}

function buildComponent(comp: ComponentRegistration): TreeNode {
  return {
    id: uid(`comp_${comp.id}`),
    label: comp.section,
    chip: comp.id,
    chipColor: 'info',
    data: comp,
    children: buildValueChildren(comp, `comp_${comp.id}`),
  };
}

function buildScript(script: IRScriptDefinition): TreeNode {
  return {
    id: uid(`script_${script.id}`),
    label: script.id,
    chip: `${script.then.length} action${script.then.length !== 1 ? 's' : ''}`,
    chipColor: 'warning',
    data: script,
    children: buildValueChildren(script, `script_${script.id}`),
  };
}

// ── espcompose subtree ─────────────────────────────────────────────────────

function buildEspcompose(espcompose: IRData['espcompose']): TreeNode {
  const children: TreeNode[] = [];

  const { reactive } = espcompose;
  if (reactive) {
    const reactiveChildren: TreeNode[] = [];

    if (reactive.bindings?.length) {
      reactiveChildren.push({
        id: uid('bindings'),
        label: 'bindings',
        chip: String(reactive.bindings.length),
        data: reactive.bindings,
        children: reactive.bindings.map(buildBinding),
      });
    }
    if (reactive.memos?.length) {
      reactiveChildren.push({
        id: uid('memos'),
        label: 'memos',
        chip: String(reactive.memos.length),
        data: reactive.memos,
        children: reactive.memos.map((m, i) => ({
          id: uid(`memo_${i}`),
          label: `memo ${i}`,
          chipColor: 'info' as const,
          data: m,
          children: buildValueChildren(m, `memo_${i}`),
        })),
      });
    }
    if (reactive.effects?.length) {
      reactiveChildren.push({
        id: uid('effects'),
        label: 'effects',
        chip: String(reactive.effects.length),
        data: reactive.effects,
        children: reactive.effects.map((e, i) => ({
          id: uid(`effect_${i}`),
          label: `effect ${i}`,
          chipColor: 'info' as const,
          data: e,
          children: buildValueChildren(e, `effect_${i}`),
        })),
      });
    }

    children.push({
      id: uid('reactive'),
      label: 'reactive',
      data: reactive,
      children: reactiveChildren,
    });
  }

  if (espcompose.themes) {
    const { themes } = espcompose;
    children.push({
      id: uid('themes'),
      label: 'themes',
      chip: themes.themeNames.join(' / '),
      chipColor: 'secondary',
      data: themes,
      children: [
        {
          id: uid('theme_names'),
          label: 'themeNames',
          data: themes.themeNames,
          children: buildValueChildren(themes.themeNames, 'theme_names'),
        },
        {
          id: uid('theme_default'),
          label: 'defaultIndex',
          chip: String(themes.defaultIndex),
          data: themes.defaultIndex,
        },
        {
          id: uid('theme_leafData'),
          label: 'leafData',
          chip: `${Object.keys(themes.leafData).length} tokens`,
          data: themes.leafData,
          children: Object.entries(themes.leafData).map(([key, val]) => ({
            id: uid(`leaf_${key}`),
            label: key,
            chip: val.valueType,
            chipColor: 'default' as const,
            data: val,
            children: buildValueChildren(val, `leaf_${key}`),
          })),
        },
      ],
    });
  }

  return {
    id: uid('espcompose'),
    label: 'espcompose',
    data: espcompose,
    children,
  };
}

function buildBinding(binding: ReactiveBinding, i: number): TreeNode {
  // Label: targetId.targetProp (+ part/state if present)
  const parts = [binding.targetId, binding.targetProp];
  if (binding.part) parts.push(binding.part);
  if (binding.state) parts.push(binding.state);
  return {
    id: uid(`binding_${i}`),
    label: parts.join('.'),
    chip: binding.targetType,
    chipColor: 'info',
    data: binding,
    children: buildValueChildren(binding, `binding_${i}`),
  };
}
