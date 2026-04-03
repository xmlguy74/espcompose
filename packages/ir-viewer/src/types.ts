// ── IR Data shapes (match the serialized output from ir-debug.ts) ──────────

export interface IRValue {
  kind: string;
  [key: string]: unknown;
}

export interface IRSection {
  key: string;
  value: IRValue;
}

export interface HAEntityRegistration {
  entityId: string;
  domain: string;
  sensorType: 'binary_sensor' | 'sensor' | 'text_sensor';
  generatedId: string;
  attribute?: string;
}

export interface ComponentRegistration {
  section: string;
  id: string;
  config: Record<string, unknown>;
}

export interface IRScriptDefinition {
  id: string;
  then: unknown[];
}

export interface ReactiveBinding {
  targetId: string;
  targetType: string;
  targetProp: string;
  expression: unknown;
  part?: string;
  state?: string;
}

export interface IRESPHomeData {
  sections: IRSection[];
  haEntities: HAEntityRegistration[];
  components: ComponentRegistration[];
  scripts: IRScriptDefinition[];
}

export interface IRThemeData {
  themeNames: string[];
  defaultIndex: number;
  leafData: Record<string, { values: unknown[]; valueType: string }>;
}

export interface IRESPComposeData {
  reactive: {
    bindings: ReactiveBinding[];
    memos: unknown[];
    effects: unknown[];
  };
  themes?: IRThemeData;
}

export interface IRData {
  esphome: IRESPHomeData;
  espcompose: IRESPComposeData;
}

// ── Tree model ─────────────────────────────────────────────────────────────

export interface TreeNode {
  /** Unique ID used by MUI SimpleTreeView */
  id: string;
  /** Primary label text */
  label: string;
  /** Optional small annotation chip next to the label */
  chip?: string;
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /** Raw data for the detail panel */
  data: unknown;
  children?: TreeNode[];
}
