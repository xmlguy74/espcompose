/**
 * Asset resolution and copying for the ESPHome Compose compiler.
 *
 * Walks a rendered config object looking for props whose YAML key is a known
 * filesystem path (e.g. `file` on image/font components).  For each relative
 * path found, the file is copied into the build output directory and the path
 * is rewritten so it is relative to the emitted YAML file.
 *
 * Skips absolute paths, URLs, and MDI/MDIL/Memory icon references.
 */

import * as fs from 'fs';
import * as path from 'path';

/** YAML keys whose values represent filesystem paths. */
const FILE_PATH_YAML_KEYS = new Set<string>([
  'file',
]);

/**
 * Returns true if the value looks like a non-filesystem reference that
 * should be left as-is (URLs, MDI icons, etc.).
 */
function isNonFilePath(value: string): boolean {
  return /^https?:\/\//.test(value)
    || /^mdi:/.test(value)
    || /^mdil:/.test(value)
    || /^memory:/.test(value);
}

/**
 * Walk the config tree, resolve relative file paths, copy assets, and rewrite
 * paths in-place.
 *
 * @param config     The rendered config object (snake_case keys, pre-toYAML).
 * @param sourceDir  The directory of the original TSX entry file.
 * @param outDir     The build output directory (where esphome.yaml lives).
 * @returns          List of asset files that were copied.
 */
export function resolveAssets(
  config: Record<string, unknown>,
  sourceDir: string,
  outDir: string,
): string[] {
  const assetsDir = path.join(outDir, 'assets');
  const copied: string[] = [];
  const usedNames = new Set<string>();

  walkAndRewrite(config, sourceDir, assetsDir, outDir, copied, usedNames);

  return copied;
}

function walkAndRewrite(
  obj: unknown,
  sourceDir: string,
  assetsDir: string,
  outDir: string,
  copied: string[],
  usedNames: Set<string>,
): void {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      walkAndRewrite(item, sourceDir, assetsDir, outDir, copied, usedNames);
    }
    return;
  }

  if (obj == null || typeof obj !== 'object') return;

  const record = obj as Record<string, unknown>;
  for (const [key, value] of Object.entries(record)) {
    if (FILE_PATH_YAML_KEYS.has(key) && typeof value === 'string') {
      // Skip non-filesystem references
      if (isNonFilePath(value)) continue;

      // Skip absolute paths — user has explicitly managed them
      if (path.isAbsolute(value)) continue;

      const absSource = path.resolve(sourceDir, value);

      if (!fs.existsSync(absSource)) {
        console.warn(
          `[espcompose] Asset not found: ${value} (resolved to ${absSource})`
        );
        continue;
      }

      // Ensure assets directory exists
      fs.mkdirSync(assetsDir, { recursive: true });

      // Pick a unique destination name (handle collisions)
      const destName = uniqueName(path.basename(absSource), usedNames);
      const destPath = path.join(assetsDir, destName);

      fs.copyFileSync(absSource, destPath);
      copied.push(destPath);

      // Rewrite the value to be relative from the YAML output directory
      record[key] = path.relative(outDir, destPath);
    } else if (typeof value === 'object' && value != null) {
      walkAndRewrite(value, sourceDir, assetsDir, outDir, copied, usedNames);
    }
  }
}

/** Generate a unique filename, appending a numeric suffix on collision. */
function uniqueName(basename: string, used: Set<string>): string {
  if (!used.has(basename)) {
    used.add(basename);
    return basename;
  }

  const ext = path.extname(basename);
  const stem = path.basename(basename, ext);
  let i = 2;
  while (used.has(`${stem}_${i}${ext}`)) i++;

  const name = `${stem}_${i}${ext}`;
  used.add(name);
  return name;
}
