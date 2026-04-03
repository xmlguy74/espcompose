// ────────────────────────────────────────────────────────────────────────────
// IR Debug — Serialize SemanticIR to JSON and generate an interactive HTML viewer.
//
// When --debug is passed to the CLI, the compiler writes:
//   .espcompose-build/ir-debug.json  — raw JSON representation
//   .espcompose-build/ir-debug.html  — self-contained interactive tree viewer
// ────────────────────────────────────────────────────────────────────────────

import * as fs from 'fs';
import * as path from 'path';
import type { SemanticIR } from '@esphome/compose/internals';

// ────────────────────────────────────────────────────────────────────────────
// Serialization
// ────────────────────────────────────────────────────────────────────────────

/**
 * Produce a JSON-safe plain object from a SemanticIR.
 *
 * Handles:
 *   - ReactiveNode.jsClosure  → stripped (functions are not serializable)
 *   - ReactiveNode.jsValue    → best-effort via replacer (could be arbitrary)
 *   - IRThemeData.leafData    → Map converted to a plain object
 *   - ReactiveBinding.expression → sanitized ReactiveNode
 *
 * Everything else (IRValue tree, ExprNode ASTs, scalars) passes through.
 */
export function serializeIR(ir: SemanticIR): Record<string, unknown> {
  return {
    sections: ir.sections,
    bindings: ir.bindings.map(b => ({
      ...b,
      expression: sanitizeReactiveNode(b.expression),
    })),
    entities: ir.entities,
    components: ir.components,
    scripts: ir.scripts,
    reactiveNodes: ir.reactiveNodes.map(sanitizeReactiveNode),
    themes: ir.themes
      ? {
          themeNames: ir.themes.themeNames,
          defaultIndex: ir.themes.defaultIndex,
          leafData: Object.fromEntries(ir.themes.leafData),
        }
      : undefined,
  };
}

/** Strip non-serializable fields from a ReactiveNode instance. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitizeReactiveNode(node: any): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { jsClosure, jsValue, valueOf, toString, isSingleSource, __reactive_node__, ...rest } = node as Record<string, unknown>;
  return {
    ...rest,
    // Best-effort for jsValue: stringify then parse to drop non-JSON types
    ...(jsValue !== undefined ? { jsValue: safeJsonClone(jsValue) } : {}),
  };
}

/**
 * Clone a value via JSON round-trip, returning undefined if it can't be serialized.
 */
function safeJsonClone(value: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(value, circularReplacer()));
  } catch {
    return '[unserializable]';
  }
}

/**
 * JSON.stringify replacer that detects true circular references.
 *
 * Uses an ancestor stack so that shared references (the same object
 * reachable from multiple paths) are serialized fully each time.
 * Only objects forming an actual cycle in the current path are
 * replaced with '[circular]'.
 */
function circularReplacer() {
  const ancestors: object[] = [];
  return function (this: unknown, _key: string, value: unknown) {
    if (typeof value === 'function') return undefined;
    if (typeof value !== 'object' || value === null) return value;

    // Pop ancestors until we find our parent (this === the object that owns _key)
    while (ancestors.length > 0 && ancestors[ancestors.length - 1] !== this) {
      ancestors.pop();
    }
    if (ancestors.includes(value)) return '[circular]';
    ancestors.push(value);
    return value;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// File writing
// ────────────────────────────────────────────────────────────────────────────

/**
 * Write ir-debug.json and ir-debug.html to the build directory.
 * Returns the absolute path to the HTML file.
 */
export function writeIRDebugFiles(ir: SemanticIR, buildDir: string): string {
  const serialized = serializeIR(ir);
  const json = JSON.stringify(serialized, circularReplacer(), 2);

  fs.mkdirSync(buildDir, { recursive: true });
  fs.writeFileSync(path.join(buildDir, 'ir-debug.json'), json, 'utf8');

  const htmlPath = path.join(buildDir, 'ir-debug.html');
  fs.writeFileSync(htmlPath, generateHTML(json), 'utf8');

  return htmlPath;
}

// ────────────────────────────────────────────────────────────────────────────
// HTML viewer generation
// ────────────────────────────────────────────────────────────────────────────

function generateHTML(irJson: string): string {
  // The JSON is embedded as a JS variable. We escape </script> to prevent
  // premature tag closure, and escape <!-- to prevent comment injection.
  const safeJson = irJson
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ESPCompose IR Debug Viewer</title>
<style>
${CSS}
</style>
</head>
<body>
<header>
  <h1>ESPCompose Semantic IR</h1>
  <div class="toolbar">
    <input type="text" id="search" placeholder="Search keys and values…" autocomplete="off">
    <button onclick="expandAll()">Expand All</button>
    <button onclick="collapseAll()">Collapse All</button>
  </div>
</header>
<div id="stats"></div>
<div id="tree"></div>
<script>
const IR_DATA = ${safeJson};
${VIEWER_JS}
</script>
</body>
</html>`;
}

// ── Embedded CSS ─────────────────────────────────────────────────────────────

const CSS = /* css */ `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'SF Mono', 'Menlo', 'Consolas', monospace; font-size: 13px; background: #1e1e2e; color: #cdd6f4; padding: 0; }
header { position: sticky; top: 0; z-index: 10; background: #1e1e2e; padding: 12px 16px; border-bottom: 1px solid #313244; }
header h1 { font-size: 16px; font-weight: 600; color: #cba6f7; margin-bottom: 8px; }
.toolbar { display: flex; gap: 8px; align-items: center; }
#search { flex: 1; padding: 6px 10px; background: #313244; border: 1px solid #45475a; border-radius: 4px; color: #cdd6f4; font-family: inherit; font-size: 13px; outline: none; }
#search:focus { border-color: #cba6f7; }
button { padding: 5px 12px; background: #45475a; border: none; border-radius: 4px; color: #cdd6f4; cursor: pointer; font-family: inherit; font-size: 12px; }
button:hover { background: #585b70; }
#stats { padding: 8px 16px; background: #181825; border-bottom: 1px solid #313244; display: flex; gap: 16px; flex-wrap: wrap; font-size: 12px; color: #a6adc8; }
.stat { display: flex; gap: 4px; }
.stat-val { color: #89b4fa; font-weight: 600; }
#tree { padding: 12px 16px; }

/* Tree nodes */
.node { margin-left: 16px; }
.node-row { display: flex; align-items: flex-start; padding: 1px 4px; border-radius: 3px; cursor: default; line-height: 1.5; }
.node-row:hover { background: #313244; }
.node-row.match { background: #45475a; }
.toggle { width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; color: #6c7086; user-select: none; margin-top: 1px; }
.toggle.collapsed::before { content: '▶'; font-size: 9px; }
.toggle.expanded::before { content: '▼'; font-size: 9px; }
.toggle.leaf::before { content: ''; }
.key { color: #89b4fa; margin-right: 6px; }
.key::after { content: ':'; color: #6c7086; }

/* Value kinds */
.kind-tag { font-size: 10px; padding: 1px 5px; border-radius: 3px; margin-right: 6px; font-weight: 600; text-transform: uppercase; flex-shrink: 0; }
.kind-scalar { background: #1e6632; color: #a6e3a1; }
.kind-object { background: #1e4066; color: #89b4fa; }
.kind-array { background: #4e3a66; color: #cba6f7; }
.kind-null { background: #45475a; color: #6c7086; }
.kind-reactive { background: #664e1e; color: #f9e2af; }
.kind-ref { background: #66301e; color: #fab387; }
.kind-action { background: #661e3a; color: #f38ba8; }
.kind-secret { background: #4e1e66; color: #b4befe; }
.kind-trigger_var { background: #1e6660; color: #94e2d5; }
.kind-section { background: #313244; color: #cdd6f4; }
.kind-binding { background: #45475a; color: #f5c2e7; }
.kind-entity { background: #1e4066; color: #74c7ec; }
.kind-component { background: #45475a; color: #a6e3a1; }
.kind-script { background: #4e3a66; color: #b4befe; }
.kind-theme { background: #664e1e; color: #f9e2af; }
.kind-reactiveNode { background: #664e1e; color: #f9e2af; }

.val { color: #a6e3a1; }
.val-str { color: #a6e3a1; }
.val-num { color: #fab387; }
.val-bool { color: #f38ba8; }
.val-null { color: #6c7086; font-style: italic; }
.children { overflow: hidden; }
.children.hidden { display: none; }
.count { color: #6c7086; font-size: 11px; margin-left: 4px; }
`;

// ── Embedded JavaScript ──────────────────────────────────────────────────────

const VIEWER_JS = /* js */ `
(function() {
  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = document.getElementById('stats');
  const data = IR_DATA;
  const pairs = [
    ['Sections', (data.sections || []).length],
    ['Bindings', (data.bindings || []).length],
    ['Reactive Nodes', (data.reactiveNodes || []).length],
    ['Entities', (data.entities || []).length],
    ['Components', (data.components || []).length],
    ['Scripts', (data.scripts || []).length],
    ['Themes', data.themes ? data.themes.themeNames.length : 0],
  ];
  stats.innerHTML = pairs.map(function(p) {
    return '<span class="stat"><span>' + p[0] + '</span> <span class="stat-val">' + p[1] + '</span></span>';
  }).join('');

  // ── Tree renderer ──────────────────────────────────────────────────────
  var treeEl = document.getElementById('tree');

  function isIRValue(obj) {
    return obj && typeof obj === 'object' && typeof obj.kind === 'string';
  }

  function kindTag(kind) {
    return '<span class="kind-tag kind-' + kind + '">' + kind + '</span>';
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderValue(val) {
    if (val === null || val === undefined) return '<span class="val-null">null</span>';
    if (typeof val === 'string') return '<span class="val-str">"' + escHtml(val) + '"</span>';
    if (typeof val === 'number') return '<span class="val-num">' + val + '</span>';
    if (typeof val === 'boolean') return '<span class="val-bool">' + val + '</span>';
    return '<span class="val">' + escHtml(JSON.stringify(val)) + '</span>';
  }

  function hasChildren(val) {
    if (!val || typeof val !== 'object') return false;
    if (Array.isArray(val)) return val.length > 0;
    return Object.keys(val).length > 0;
  }

  function childCount(val) {
    if (Array.isArray(val)) return val.length;
    if (val && typeof val === 'object') return Object.keys(val).length;
    return 0;
  }

  function buildNode(key, value, depth) {
    var wrap = document.createElement('div');
    wrap.className = 'node';

    var row = document.createElement('div');
    row.className = 'node-row';
    row.dataset.depth = depth;

    var isComplex = hasChildren(value) && typeof value === 'object';
    var irKind = isIRValue(value) ? value.kind : null;

    // Determine if expandable
    var expandable = false;
    if (irKind) {
      // IR nodes: expand if they have interesting children beyond 'kind'
      var irKeys = Object.keys(value).filter(function(k) { return k !== 'kind'; });
      expandable = irKeys.length > 0;
    } else if (isComplex) {
      expandable = true;
    }

    var toggle = document.createElement('span');
    toggle.className = 'toggle ' + (expandable ? 'collapsed' : 'leaf');
    row.appendChild(toggle);

    if (key !== null) {
      var keyEl = document.createElement('span');
      keyEl.className = 'key';
      keyEl.textContent = key;
      row.appendChild(keyEl);
    }

    // Show kind tag for IR nodes
    if (irKind) {
      row.insertAdjacentHTML('beforeend', kindTag(irKind));
    }

    // Inline value for simple types
    if (!expandable) {
      if (irKind === 'scalar') {
        row.insertAdjacentHTML('beforeend', renderValue(value.value));
      } else if (irKind === 'null') {
        row.insertAdjacentHTML('beforeend', '<span class="val-null">null</span>');
      } else if (irKind === 'secret') {
        row.insertAdjacentHTML('beforeend', renderValue(value.key));
      } else if (irKind === 'trigger_var') {
        row.insertAdjacentHTML('beforeend', renderValue(value.name));
      } else if (!isComplex && value !== null && value !== undefined) {
        row.insertAdjacentHTML('beforeend', renderValue(value));
      }
    } else {
      // Show child count
      var n = irKind === 'object' ? (value.entries || []).length
            : irKind === 'array' ? (value.items || []).length
            : childCount(value);
      if (n > 0) {
        row.insertAdjacentHTML('beforeend', '<span class="count">(' + n + ')</span>');
      }
    }

    wrap.appendChild(row);

    if (expandable) {
      var children = document.createElement('div');
      children.className = 'children hidden';

      if (irKind === 'object') {
        (value.entries || []).forEach(function(entry) {
          children.appendChild(buildNode(entry.key, entry.value, depth + 1));
        });
      } else if (irKind === 'array') {
        (value.items || []).forEach(function(item, i) {
          children.appendChild(buildNode('[' + i + ']', item, depth + 1));
        });
      } else if (irKind === 'reactive') {
        Object.keys(value).filter(function(k) { return k !== 'kind'; }).forEach(function(k) {
          children.appendChild(buildNode(k, value[k], depth + 1));
        });
      } else if (irKind === 'ref') {
        Object.keys(value).filter(function(k) { return k !== 'kind'; }).forEach(function(k) {
          children.appendChild(buildNode(k, value[k], depth + 1));
        });
      } else if (irKind === 'action') {
        Object.keys(value).filter(function(k) { return k !== 'kind'; }).forEach(function(k) {
          children.appendChild(buildNode(k, value[k], depth + 1));
        });
      } else if (Array.isArray(value)) {
        value.forEach(function(item, i) {
          children.appendChild(buildNode('[' + i + ']', item, depth + 1));
        });
      } else {
        Object.keys(value).forEach(function(k) {
          children.appendChild(buildNode(k, value[k], depth + 1));
        });
      }

      wrap.appendChild(children);

      toggle.addEventListener('click', function() {
        var isCollapsed = toggle.classList.contains('collapsed');
        toggle.className = 'toggle ' + (isCollapsed ? 'expanded' : 'collapsed');
        children.className = 'children' + (isCollapsed ? '' : ' hidden');
      });
    }

    return wrap;
  }

  // ── Build top-level sections ───────────────────────────────────────────
  function renderTree() {
    treeEl.innerHTML = '';

    // Sections
    if (data.sections && data.sections.length) {
      var sectionsWrap = buildNode('sections', data.sections, 0);
      // Replace the generic treatment: render each section with its key
      treeEl.appendChild(buildTopGroup('sections', 'section', data.sections, function(s) { return s.key; }, function(s) { return s.value; }));
    }

    ['bindings', 'reactiveNodes', 'entities', 'components', 'scripts'].forEach(function(field) {
      if (data[field] && data[field].length) {
        treeEl.appendChild(buildTopGroup(field, field === 'reactiveNodes' ? 'reactiveNode' : field.replace(/s$/, ''), data[field], null, null));
      }
    });

    if (data.themes) {
      treeEl.appendChild(buildNode('themes', data.themes, 0));
    }
  }

  function buildTopGroup(label, kindClass, items, keyFn, valFn) {
    var wrap = document.createElement('div');
    wrap.className = 'node';
    var row = document.createElement('div');
    row.className = 'node-row';

    var toggle = document.createElement('span');
    toggle.className = 'toggle collapsed';
    row.appendChild(toggle);

    var keyEl = document.createElement('span');
    keyEl.className = 'key';
    keyEl.textContent = label;
    row.appendChild(keyEl);

    row.insertAdjacentHTML('beforeend', '<span class="count">(' + items.length + ')</span>');
    wrap.appendChild(row);

    var children = document.createElement('div');
    children.className = 'children hidden';

    items.forEach(function(item, i) {
      var k = keyFn ? keyFn(item) : '[' + i + ']';
      var v = valFn ? valFn(item) : item;
      children.appendChild(buildNode(k, v, 1));
    });

    wrap.appendChild(children);

    toggle.addEventListener('click', function() {
      var isCollapsed = toggle.classList.contains('collapsed');
      toggle.className = 'toggle ' + (isCollapsed ? 'expanded' : 'collapsed');
      children.className = 'children' + (isCollapsed ? '' : ' hidden');
    });

    return wrap;
  }

  renderTree();

  // ── Search ─────────────────────────────────────────────────────────────
  var searchInput = document.getElementById('search');
  var debounceTimer;
  searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applySearch, 200);
  });

  function applySearch() {
    var query = searchInput.value.trim().toLowerCase();
    var rows = treeEl.querySelectorAll('.node-row');
    if (!query) {
      rows.forEach(function(r) { r.classList.remove('match'); });
      return;
    }
    rows.forEach(function(r) {
      var text = r.textContent.toLowerCase();
      r.classList.toggle('match', text.indexOf(query) !== -1);
      // expand parent nodes to show matches
      if (text.indexOf(query) !== -1) {
        var el = r.parentElement;
        while (el && el !== treeEl) {
          if (el.classList.contains('children') && el.classList.contains('hidden')) {
            el.classList.remove('hidden');
            var t = el.previousElementSibling && el.previousElementSibling.querySelector('.toggle');
            if (t) { t.className = 'toggle expanded'; }
          }
          el = el.parentElement;
        }
      }
    });
  }

  // ── Expand / Collapse All ──────────────────────────────────────────────
  window.expandAll = function() {
    treeEl.querySelectorAll('.toggle.collapsed').forEach(function(t) {
      t.className = 'toggle expanded';
      var ch = t.closest('.node').querySelector('.children');
      if (ch) ch.classList.remove('hidden');
    });
  };
  window.collapseAll = function() {
    treeEl.querySelectorAll('.toggle.expanded').forEach(function(t) {
      // Don't collapse root-level nodes
      var depth = t.parentElement.dataset.depth;
      if (depth === '0') return;
      t.className = 'toggle collapsed';
      var ch = t.closest('.node').querySelector(':scope > .children');
      if (ch) ch.classList.add('hidden');
    });
  };
})();`;
