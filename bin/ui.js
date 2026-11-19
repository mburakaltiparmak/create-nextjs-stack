/**
 * ui.js — Terminal UI helpers for create-nextjs-stack
 * Kullanım: const ui = require("./ui");
 *
 * Bağımlılıklar (package.json'a ekle):
 *   "figlet": "^1.7.0",
 *   "boxen": "^5.1.2",          ← v7+ ESM olduğu için v5 kullan
 *   "gradient-string": "^2.0.2",
 *   "chalk": "^4.1.2"            ← v5+ ESM, v4 kullan
 */

const figlet  = require("figlet");
const _boxen  = require("boxen");  const boxen = _boxen.default  || _boxen;
const _g      = require("gradient-string"); const g = _g.default  || _g;
const chalk   = require("chalk");

// ─── BRAND PALETI ────────────────────────────────────────────────────────────
const brand = g(["#FF6B6B", "#FFE66D", "#4ECDC4", "#45B7D1"]);
const hot   = g(["#FF6B6B", "#FF8E53"]);
const cool  = g(["#4ECDC4", "#45B7D1"]);
const gold  = g(["#FFE66D", "#F9A825"]);

// ─── YARDIMCI SABİTLER ───────────────────────────────────────────────────────
const dim   = chalk.gray;
const bold  = chalk.bold;
const tick  = chalk.green("✔");
const cross = chalk.red("✖");
const arrow = chalk.cyan("❯");
const star  = chalk.yellow("★");
const spark = "✦";

// ─── BANNER ──────────────────────────────────────────────────────────────────
// Başlangıçta gösterilir. version: packageJson.version gönder.
function showBanner(version) {
  const ascii = figlet.textSync("CNS", {
    font: "Big",
    horizontalLayout: "full",
  });
  console.log("\n" + brand(ascii));
  console.log(
    bold("  create-nextjs-stack") +
    dim(" v" + version) +
    "  " +
    gold(spark + " by Burak Altıparmak " + spark)
  );
  console.log(dim("  ─────────────────────────────────────────────\n"));
}

// ─── BÖLÜM BAŞLIĞI ───────────────────────────────────────────────────────────
// Her prompts adımı öncesinde çağır: sectionHeader(1, 3, "Project Setup")
function sectionHeader(step, total, label) {
  const progress = chalk.bgBlack.bold(` ${step}/${total} `);
  console.log(`\n  ${progress} ${cool(label)}`);
  console.log(dim("  " + "─".repeat(40)));
}

// ─── TEMPLATE KARTI ──────────────────────────────────────────────────────────
// templateCard("full-stack") → { emoji, label, desc, color }
function templateCard(type) {
  const cards = {
    "full-stack": { emoji: "🚀", label: "Full Stack",  desc: "Web + Admin — the whole deal", color: brand },
    web:          { emoji: "🌐", label: "Web Only",    desc: "Next.js landing page",          color: cool  },
    admin:        { emoji: "⚙️ ", label: "Admin Only", desc: "Headless admin panel",          color: hot   },
  };
  return cards[type] || cards["web"];
}

// ─── VERİ KAYNAĞI KARTI ────────────────────────────────────────────────────────
// cmsCard("contentful") → { emoji, label, desc, color }
function cmsCard(cms) {
  const cards = {
    supabase:   { emoji: "🗄️ ", label: "Supabase",   desc: "Postgres + Cloudinary images", color: cool },
    contentful: { emoji: "📝", label: "Contentful", desc: "Headless CMS + media library", color: gold },
  };
  return cards[cms] || cards["supabase"];
}

// ─── BAŞARI KUTUSU ───────────────────────────────────────────────────────────
// Proje oluşturulduktan sonra çağır.
const AUTH_LABELS = { credentials: "Credentials (single admin)", auth0: "Auth0 (roles + invitations)", supabase: "Supabase Auth" };
const LANG_LABELS = { en: "English", tr: "Türkçe" };

function showSuccess({ appName, templateType, cms, auth, lang, root, packageManager }) {
  const card = templateCard(templateType);
  const source = cmsCard(cms);
  const adminLines = templateType === "web" ? [] : [
    `  ${dim("sign-in")}   ${chalk.white(AUTH_LABELS[auth] || auth)}`,
    `  ${dim("admin ui")}  ${chalk.white(LANG_LABELS[lang] || lang)}`,
  ];
  const lines = [
    "",
    `  ${tick} ${bold("Project created successfully!")}`,
    "",
    `  ${dim("name")}      ${chalk.white.bold(appName)}`,
    `  ${dim("template")}  ${card.emoji}  ${card.color(card.label)} ${dim("— " + card.desc)}`,
    `  ${dim("data")}      ${source.emoji}  ${source.color(source.label)} ${dim("— " + source.desc)}`,
    ...adminLines,
    `  ${dim("path")}      ${dim(root)}`,
    `  ${dim("pkg mgr")}   ${chalk.cyan(packageManager || "npm")}`,
    "",
  ];
  const box = boxen(lines.join("\n"), {
    padding: { top: 0, bottom: 0, left: 1, right: 2 },
    margin: { top: 1, left: 2 },
    borderStyle: "round",
    borderColor: "cyan",
    title: gold(" " + spark + " ready to ship " + spark + " "),
    titleAlignment: "center",
  });
  console.log(box);
}

// ─── SONRAKI ADIMLAR ─────────────────────────────────────────────────────────
function showNextSteps({ appName, templateType, cms, auth, packageManager, installed }) {
  const pm = packageManager || "npm";
  const script = (name) => (pm === "yarn" ? `yarn ${name}` : `${pm} run ${name}`);
  const installCmd = pm === "yarn" ? "yarn" : `${pm} install`;
  const hasAdmin = templateType !== "web";
  const adminDir = templateType === "full-stack" ? "admin" : ".";

  console.log(`  ${bold(cool("Next steps:"))}\n`);
  const steps = [`cd ${appName}`];
  if (!installed) steps.push(templateType === "full-stack" ? `(cd web && ${installCmd}) && (cd admin && ${installCmd})` : installCmd);
  steps.push(`fill in ${templateType === "full-stack" ? "web/.env and admin/.env" : ".env"}`);
  if (hasAdmin && cms === "contentful") steps.push(adminDir === "." ? `${script("contentful:setup")} && ${script("contentful:seed")}` : `(cd admin && ${script("contentful:setup")} && ${script("contentful:seed")})`);
  if (hasAdmin && cms === "supabase") steps.push(`run ${adminDir === "." ? "" : "admin/"}supabase/schema.sql (and seed.sql) in the Supabase SQL editor`);
  if (hasAdmin && auth === "credentials") steps.push(adminDir === "." ? `${script("auth:hash")} -- "your-password"   → ADMIN_PASSWORD_HASH` : `(cd admin && ${script("auth:hash")} -- "your-password")   → ADMIN_PASSWORD_HASH`);
  steps.push(templateType === "full-stack" ? `(cd web && ${script("dev")}) & (cd admin && ${script("dev")})` : script("dev"));
  steps.forEach((step, index) => console.log(`  ${dim((index + 1) + ".")} ${chalk.cyan(step)}`));
  console.log("");

  if (hasAdmin) {
    if (auth === "auth0") console.log(`  ${dim("Auth0: create the applications, roles and the Post Login Action — see")} ${chalk.cyan("AUTH0.md")}`);
    if (auth === "supabase") console.log(`  ${dim("Supabase Auth: add users under Authentication → Users and list them in")} ${chalk.cyan("ADMIN_EMAILS")}`);
    console.log(`  ${dim("Admin runs on")} ${chalk.cyan("http://localhost:3001")}${templateType === "full-stack" ? dim(", the site on ") + chalk.cyan("http://localhost:3000") : ""}${dim(". Use the same PREVIEW_SECRET in both apps.")}\n`);
  }
}

// ─── SOSYAL FOOTER ───────────────────────────────────────────────────────────
function showFooter() {
  console.log(dim("  ─────────────────────────────────────────────"));
  console.log(`  ${star} ${dim("Loved it? Star on GitHub →")} ${chalk.underline.cyan("github.com/mburakaltiparmak")}`);
  console.log(`  ${spark} ${dim("Issues / PRs welcome at")} ${chalk.underline.cyan("github.com/mburakaltiparmak/create-nextjs-stack")}`);
  console.log(`\n  ${dim("Built with")} ${chalk.red("♥")} ${dim("by")} ${bold(hot("Burak Altıparmak"))}\n`);
}

// ─── HATA KUTUSU ─────────────────────────────────────────────────────────────
function showError(message) {
  const box = boxen(
    `\n  ${cross} ${chalk.red.bold("Oops! Something went wrong.")}\n\n  ${chalk.white(message)}\n`,
    {
      padding: { top: 0, bottom: 0, left: 1, right: 2 },
      margin: { top: 1, left: 2 },
      borderStyle: "round",
      borderColor: "red",
      title: chalk.red(" error "),
      titleAlignment: "center",
    }
  );
  console.log(box);
}

// ─── İPTAL MESAJI ────────────────────────────────────────────────────────────
function showCancelled() {
  console.log(`\n  ${cross} ${chalk.red("Operation cancelled.")} ${dim("See you next time!\n")}`);
}

// ─── KURULUM SONUCU ──────────────────────────────────────────────────────────
function showInstallResult(dirName, success, pm) {
  if (success) {
    console.log(`  ${tick} ${dim("Dependencies installed in")} ${chalk.cyan(dirName)}`);
  } else {
    console.log(`  ${cross} ${chalk.yellow("Skipped")} ${dim(dirName)} ${dim("— run")} ${chalk.cyan(pm === "yarn" ? "yarn" : `${pm} install`)} ${dim("manually")}`);
  }
}

module.exports = {
  showBanner,
  sectionHeader,
  templateCard,
  cmsCard,
  showSuccess,
  showNextSteps,
  showFooter,
  showError,
  showCancelled,
  showInstallResult,
  // renkler — gerekirse doğrudan kullan
  brand, hot, cool, gold,
  dim, bold, tick, cross, arrow, star, spark,
};
