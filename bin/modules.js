/**
 * modules.js — Overlay module engine for create-nextjs-stack
 *
 * Bir "module", templates/modules/<name>/ altında yaşar ve şu yapıya sahiptir:
 *
 *   templates/modules/<name>/
 *     module.json          ← manifest
 *     web/                 ← templates/web üzerine kopyalanacak dosyalar
 *     admin/               ← templates/admin üzerine kopyalanacak dosyalar
 *
 * manifest şeması:
 *   {
 *     "name": "contentful",
 *     "label": "Contentful",
 *     "targets": {
 *       "web":   { "remove": [...], "dependencies": {...}, "devDependencies": {...},
 *                  "removeDependencies": [...], "scripts": {...} },
 *       "admin": { ... }
 *     }
 *   }
 *
 * Uygulama sırası (copyTemplate içinden çağrılır):
 *   1. base template kopyalanır
 *   2. applyModule() → overlay dosyaları üzerine yazılır
 *   3. manifest'teki `remove` yolları silinir
 *   4. package.json bağımlılık/script merge'i yapılır
 *   5. .env.example → .env üretilir  (overlay kendi .env.example'ını getirebilir)
 */

const fs = require("fs-extra");
const path = require("path");

const MODULES_DIR = path.join(__dirname, "..", "templates", "modules");

// Base template kopyalamasıyla aynı filtre — overlay'de de node_modules vs. istemeyiz.
const IGNORED_BASENAMES = new Set([
  "node_modules",
  ".next",
  ".git",
  "package-lock.json",
  ".env",
  ".DS_Store",
]);

function moduleDir(moduleName) {
  return path.join(MODULES_DIR, moduleName);
}

function moduleExists(moduleName) {
  return fs.existsSync(path.join(moduleDir(moduleName), "module.json"));
}

function readManifest(moduleName) {
  return fs.readJsonSync(path.join(moduleDir(moduleName), "module.json"));
}

/**
 * package.json'a modülün bağımlılık / script katkısını işler.
 * Sıralama korunsun diye anahtarlar merge sonrası alfabetik yazılır —
 * npm'in kendi davranışıyla tutarlı olur ve diff'ler sakin kalır.
 */
function mergePackageJson(pkgPath, target) {
  if (!fs.existsSync(pkgPath)) return;

  const pkg = fs.readJsonSync(pkgPath);

  const sortKeys = (obj) =>
    Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {});

  for (const field of ["dependencies", "devDependencies"]) {
    const additions = target[field];
    if (!additions) continue;
    pkg[field] = sortKeys({ ...(pkg[field] || {}), ...additions });
  }

  for (const dep of target.removeDependencies || []) {
    if (pkg.dependencies) delete pkg.dependencies[dep];
    if (pkg.devDependencies) delete pkg.devDependencies[dep];
  }

  if (target.scripts) {
    pkg.scripts = { ...(pkg.scripts || {}), ...target.scripts };
  }

  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
}

/**
 * Bir modülü, kopyalanmış template'in üzerine uygular.
 *
 * @param {string} destPath     Kopyalanmış template'in kökü
 * @param {string} moduleName   templates/modules altındaki klasör adı
 * @param {string} targetName   "web" | "admin"
 * @returns {boolean}           Modül uygulandıysa true
 */
function applyModule(destPath, moduleName, targetName) {
  if (!moduleExists(moduleName)) {
    throw new Error(
      `Unknown module: "${moduleName}" (expected templates/modules/${moduleName}/module.json)`,
    );
  }

  const manifest = readManifest(moduleName);
  const target = (manifest.targets || {})[targetName];

  // Modül bu target'ı desteklemiyorsa sessizce geç — örn. sadece web'i etkileyen bir modül.
  if (!target) return false;

  const overlayDir = path.join(moduleDir(moduleName), targetName);
  if (fs.existsSync(overlayDir)) {
    fs.copySync(overlayDir, destPath, {
      overwrite: true,
      filter: (src) => !IGNORED_BASENAMES.has(path.basename(src)),
    });
  }

  for (const relative of target.remove || []) {
    fs.removeSync(path.join(destPath, relative));
  }

  mergePackageJson(path.join(destPath, "package.json"), target);

  return true;
}

module.exports = {
  MODULES_DIR,
  applyModule,
  moduleExists,
  readManifest,
};
