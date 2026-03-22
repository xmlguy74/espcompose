/**
 * Design tokens for the LVGL design system.
 *
 * Tokens are compile-time constants that resolve to LVGL-compatible values.
 * No runtime theme switching — embedded devices don't hot-swap themes.
 */

// ────────────────────────────────────────────────────────────────────────────
// Spacing scale (pixels)
// ────────────────────────────────────────────────────────────────────────────

export type SpacingToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SPACING: Record<SpacingToken, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export function resolveSpacing(value: SpacingToken | number): number {
  if (typeof value === 'number') return value;
  return SPACING[value];
}

// ────────────────────────────────────────────────────────────────────────────
// Size scale (used for component sizing)
// ────────────────────────────────────────────────────────────────────────────

export type SizeToken = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface SizeDimensions {
  height: number;
  fontSize: number;
  paddingX: number;
  paddingY: number;
}

const SIZE_DIMENSIONS: Record<SizeToken, SizeDimensions> = {
  xs: { height: 28, fontSize: 12, paddingX: 8, paddingY: 4 },
  sm: { height: 36, fontSize: 14, paddingX: 12, paddingY: 6 },
  md: { height: 44, fontSize: 16, paddingX: 16, paddingY: 8 },
  lg: { height: 52, fontSize: 18, paddingX: 20, paddingY: 10 },
  xl: { height: 64, fontSize: 22, paddingX: 24, paddingY: 12 },
};

export function resolveSize(value: SizeToken): SizeDimensions {
  return SIZE_DIMENSIONS[value];
}

// ────────────────────────────────────────────────────────────────────────────
// Color tokens (hex format for LVGL)
// ────────────────────────────────────────────────────────────────────────────

export type StatusToken = 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

export interface StatusColors {
  bg: string;
  text: string;
  bgPressed: string;
}

const STATUS_COLORS: Record<StatusToken, StatusColors> = {
  primary: { bg: '0x2196F3', text: '0xFFFFFF', bgPressed: '0x1976D2' },
  secondary: { bg: '0x607D8B', text: '0xFFFFFF', bgPressed: '0x455A64' },
  success: { bg: '0x4CAF50', text: '0xFFFFFF', bgPressed: '0x388E3C' },
  warning: { bg: '0xFF9800', text: '0x000000', bgPressed: '0xF57C00' },
  danger: { bg: '0xF44336', text: '0xFFFFFF', bgPressed: '0xD32F2F' },
};

export function resolveStatus(value: StatusToken): StatusColors {
  return STATUS_COLORS[value];
}

// ────────────────────────────────────────────────────────────────────────────
// Typography tokens
// ────────────────────────────────────────────────────────────────────────────

export type TextVariant = 'title' | 'subtitle' | 'body' | 'caption';

export interface TypographyDef {
  textFont: string;
}

const TYPOGRAPHY: Record<TextVariant, TypographyDef> = {
  title: { textFont: 'montserrat_28' },
  subtitle: { textFont: 'montserrat_20' },
  body: { textFont: 'montserrat_16' },
  caption: { textFont: 'montserrat_12' },
};

export function resolveTypography(variant: TextVariant): TypographyDef {
  return TYPOGRAPHY[variant];
}

// ────────────────────────────────────────────────────────────────────────────
// Radius tokens
// ────────────────────────────────────────────────────────────────────────────

export type RadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'full';

const RADIUS: Record<RadiusToken, number> = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
};

export function resolveRadius(value: RadiusToken | number): number {
  if (typeof value === 'number') return value;
  return RADIUS[value];
}
