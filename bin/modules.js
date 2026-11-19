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
 *     "kind": "cms" | "auth" | "lang",      ← CLI seçeneğinin türü (her türden en fazla bir modül)
 *     "requires": { "cms": ["supabase"] },  ← isteğe bağlı: yalnız bu seçimlerle uygulanabilir
 *     "targets": {
 *       "web":   { "remove": [...], "dependencies": {...}, "devDependencies": {...},
 *                  "removeDependencies": [...], "scripts": {...}, "removeScripts": [...] },
 *       "admin": { ... }
 *     }
 *   }
 *
 * Base template = Supabase + credentials (Auth.js) + English. Seçilen modüller sırayla (cms → auth → lang)
 * uygulanır; her biri için (copyTemplate içinden):
 *   1. overlay dosyaları üzerine yazılır
 *   2. manifest'teki `remove` yolları silinir
 *   3. package.json bağımlılık/script merge'i yapılır
 * Sonra .env.example → .env üretilir (overlay kendi .env.example'ını getirebilir).
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
  ".DS_Store",
]);

/**
 * Template'ten kopyalanacak mı? `.env.example` dışındaki tüm `.env*` dosyaları
 * (.env, .env.local, .env.backup …) gerçek anahtar içerebilir — asla kopyalanmaz.
 */
function shouldCopy(src) {
  const basename = path.basename(src);
  if (IGNORED_BASENAMES.has(basename)) return false;
  // macOS AppleDouble dosyaları (harici disklerde her dosyanın yanında oluşur).
  if (basename.startsWith("._")) return false;
  if (basename.startsWith(".env") && basename !== ".env.example") return false;
  return true;
}

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

  for (const script of target.removeScripts || []) {
    if (pkg.scripts) delete pkg.scripts[script];
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
      filter: shouldCopy,
    });
  }

  for (const relative of target.remove || []) {
    fs.removeSync(path.join(destPath, relative));
  }

  mergePackageJson(path.join(destPath, "package.json"), target);

  return true;
}

/**
 * Seçimlere karşılık gelen modül listesi (sırayla uygulanır). Base template'in varsayılanları
 * (supabase, credentials, en) modül değildir.
 *
 * @param {{ cms: string, auth: string, lang: string }} choices
 * @returns {string[]}
 */
function modulesFor({ cms, auth, lang }) {
  const names = [];
  if (cms && cms !== "supabase") names.push(cms);
  if (auth && auth !== "credentials") names.push(`auth-${auth}`);
  if (lang && lang !== "en") names.push(`lang-${lang}`);
  return names;
}

/**
 * Bir modülün `requires` koşulunu denetler; uymuyorsa açıklayıcı bir hata metni döndürür.
 *
 * @param {string} moduleName
 * @param {{ cms: string, auth: string, lang: string }} choices
 * @returns {string | null}
 */
function incompatibility(moduleName, choices) {
  if (!moduleExists(moduleName)) return `Unknown module: "${moduleName}"`;
  const { requires = {}, label = moduleName } = readManifest(moduleName);
  for (const [option, allowed] of Object.entries(requires)) {
    if (!allowed.includes(choices[option])) {
      return `${label} requires --${option} ${allowed.join(" or ")} (got "${choices[option]}")`;
    }
  }
  return null;
}

/**
 * Modülleri sırayla uygular.
 *
 * @param {string} destPath
 * @param {string[]} moduleNames
 * @param {string} targetName   "web" | "admin"
 */
function applyModules(destPath, moduleNames, targetName) {
  for (const name of moduleNames) applyModule(destPath, name, targetName);
}

module.exports = {
  MODULES_DIR,
  applyModule,
  applyModules,
  modulesFor,
  incompatibility,
  shouldCopy,
  moduleExists,
  readManifest,
};
