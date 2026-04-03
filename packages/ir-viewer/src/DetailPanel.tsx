import React from 'react';
import { Box, Chip, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import type { TreeNode } from './types';

// ── Scalar extraction ──────────────────────────────────────────────────────
// Collects top-level key/value pairs where the value is a scalar (string,
// number, boolean, null). Objects and arrays are left to the TreeView.

type ScalarValue = string | number | boolean | null;

function isScalar(v: unknown): v is ScalarValue {
  return v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}

function extractScalars(data: unknown): [string, ScalarValue][] {
  if (data === null || typeof data !== 'object') {
    // The node itself is a scalar — show it under a single row.
    if (isScalar(data)) return [['value', data]];
    return [];
  }
  if (Array.isArray(data)) {
    // Show index/value pairs for scalar array items only.
    return (data as unknown[])
      .map((v, i): [string, ScalarValue] | null => isScalar(v) ? [String(i), v] : null)
      .filter((x): x is [string, ScalarValue] => x !== null);
  }
  return Object.entries(data as Record<string, unknown>)
    .filter((e): e is [string, ScalarValue] => isScalar(e[1]));
}

function renderScalar(v: ScalarValue): React.ReactNode {
  if (v === null) return <span style={{ color: '#585b70', fontStyle: 'italic' }}>null</span>;
  if (typeof v === 'boolean')
    return <span style={{ color: '#f38ba8' }}>{String(v)}</span>;
  if (typeof v === 'number')
    return <span style={{ color: '#fab387' }}>{v}</span>;
  return <span style={{ color: '#a6e3a1' }}>{String(v)}</span>;
}

// ── ScalarTable ────────────────────────────────────────────────────────────

function ScalarTable({ data }: { data: unknown }) {
  const rows = extractScalars(data);

  if (rows.length === 0) {
    return (
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
          No scalar properties — expand children in the tree.
        </Typography>
      </Box>
    );
  }

  return (
    <Table size="small" sx={{ tableLayout: 'fixed' }}>
      <TableBody>
        {rows.map(([key, val]) => (
          <TableRow key={key} sx={{ '&:last-child td': { borderBottom: 0 } }}>
            <TableCell
              sx={{
                width: '38%',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                color: '#89b4fa',
                py: 0.5,
                verticalAlign: 'top',
                borderColor: 'divider',
              }}
            >
              {key}
            </TableCell>
            <TableCell
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                wordBreak: 'break-all',
                py: 0.5,
                borderColor: 'divider',
              }}
            >
              {renderScalar(val)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── DetailPanel ────────────────────────────────────────────────────────────

interface DetailPanelProps {
  node: TreeNode | null;
}

export function DetailPanel({ node }: DetailPanelProps) {
  if (!node) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
        }}
      >
        <Typography variant="body2">Select a node to inspect its data</Typography>
      </Box>
    );
  }

  const hasNestedChildren = node.children && node.children.length > 0;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {node.label}
        </Typography>
        {node.chip && (
          <Chip
            size="small"
            label={node.chip}
            color={node.chipColor ?? 'default'}
            sx={{ height: 18, fontSize: '0.65rem', '& .MuiChip-label': { px: '6px' } }}
          />
        )}
      </Box>

      {/* Scalar properties table */}
      <Box sx={{ overflow: 'auto', flexShrink: 0 }}>
        <ScalarTable data={node.data} />
      </Box>

      {/* Hint when there are nested children */}
      {hasNestedChildren && (
        <Box sx={{ px: 2, pt: 0.5, pb: 1 }}>
          <Typography variant="caption" color="text.disabled">
            {node.children!.length} nested item{node.children!.length !== 1 ? 's' : ''} — expand in tree
          </Typography>
        </Box>
      )}
    </Box>
  );
}
