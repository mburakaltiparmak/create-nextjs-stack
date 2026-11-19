#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const { program } = require("commander");
const prompts = require("prompts");
const chalk = require("chalk");
const ora = require("ora");
const { execSync } = require("child_process");
const ui = require("./ui");
const { applyModules, incompatibility, modulesFor, shouldCopy } = require("./modules");

// Prompt'ları atlamamız gereken ortamlar (CI test koşusu gibi).
const isInteractive =
  process.env.NODE_ENV !== "test" && process.env.VITEST !== "true";

function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent || "";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("bun")) return "bun";
  return "npm";
}

function isPackageManagerAvailable(pm) {
  try {
    execSync(`${pm} --version`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Read version from package.json
const packageJson = require("../package.json");

process.on("SIGINT", () => {
  ui.showCancelled();
  process.exit(1);
});

const updateNotifier = require("update-notifier");
const notifier = updateNotifier({ pkg: packageJson, updateCheckInterval: 1000 * 60 * 60 * 24 });
if (notifier.update) {
  notifier.notify();
}

program
  .name("create-nextjs-stack")
  .version(packageJson.version, "-v, --version", "Output the current version")
  .description("Scaffold a Next.js site and admin panel with a Supabase or Contentful backend")
  .argument("[project-directory]", "Directory to create the project in")
  .option("-t, --template <type>", "Template type: web, admin, or full-stack")
  .option("-c, --cms <type>", "Data source: supabase or contentful")
  .option("-a, --auth <type>", "Admin sign-in: credentials, auth0, or supabase (supabase data source only)")
  .option("-l, --lang <code>", "Admin interface language: en or tr")
  .action(async (projectDirectory, options) => {

    // Banner — en başta göster
    ui.showBanner(packageJson.version);

    const validTemplates = ["web", "admin", "full-stack"];
    if (options.template && !validTemplates.includes(options.template)) {
      ui.showError(`Invalid template: "${options.template}"\nValid options: ${validTemplates.join(", ")}`);
      process.exit(1);
    }

    const validCms = ["supabase", "contentful"];
    if (options.cms && !validCms.includes(options.cms)) {
      ui.showError(`Invalid data source: "${options.cms}"\nValid options: ${validCms.join(", ")}`);
      process.exit(1);
    }

    const validAuth = ["credentials", "auth0", "supabase"];
    if (options.auth && !validAuth.includes(options.auth)) {
      ui.showError(`Invalid sign-in method: "${options.auth}"\nValid options: ${validAuth.join(", ")}`);
      process.exit(1);
    }

    const validLang = ["en", "tr"];
    if (options.lang && !validLang.includes(options.lang)) {
      ui.showError(`Invalid admin language: "${options.lang}"\nValid options: ${validLang.join(", ")}`);
      process.exit(1);
    }

    let targetDir = projectDirectory;

    // 1. Get Project Name / Directory
    ui.sectionHeader(1, 6, "Project Setup");
    if (!targetDir) {
      const res = await prompts({
        type: "text",
        name: "value",
        message: "What is your project named?",
        initial: "my-awesome-project",
      });
      targetDir = res.value;
    }

    if (!targetDir) {
      ui.showCancelled();
      process.exit(1);
    }

    const root = path.resolve(targetDir);
    const appName = path.basename(root);

    // 2. Select Template Type
    let templateType = options.template;

    ui.sectionHeader(2, 6, "Choose Template");
    if (!templateType) {
      const res = await prompts({
        type: "select",
        name: "templateType",
        message: "Which template would you like to generate?",
        choices: [
          {
            title: "🚀  Full Stack (Web + Admin)",
            value: "full-stack",
            description: "Creates both web and admin projects in subdirectories",
          },
          {
            title: "🌐  Web Only (Next.js Landing)",
            value: "web",
            description: "Just the landing page/web application",
          },
          {
            title: "⚙️   Admin Only (Admin Panel)",
            value: "admin",
            description: "Just the admin panel",
          },
        ],
        initial: 0,
      });
      templateType = res.templateType;
    }

    if (!templateType) {
      ui.showCancelled();
      process.exit(1);
    }

    // 3. Select Data Source (CMS)
    let cms = options.cms;

    if (!cms) {
      if (isInteractive) {
        ui.sectionHeader(3, 6, "Choose Data Source");
        const res = await prompts({
          type: "select",
          name: "cms",
          message: "Where should your content live?",
          choices: [
            {
              title: "🗄️   Supabase (Postgres)",
              value: "supabase",
              description: "Relational tables, SQL schema included, images on Cloudinary",
            },
            {
              title: "📝  Contentful (Headless CMS)",
              value: "contentful",
              description: "Content model + migrations, media library, preview + webhooks",
            },
          ],
          initial: 0,
        });
        cms = res.cms;

        if (!cms) {
          ui.showCancelled();
          process.exit(1);
        }
      } else {
        // Non-interactive (CI / test): mevcut davranışı koru.
        cms = "supabase";
      }
    }

    const includesAdmin = templateType !== "web";

    // 4. Admin sign-in method
    let auth = options.auth;
    if (!auth) {
      if (isInteractive && includesAdmin) {
        ui.sectionHeader(4, 6, "Admin Sign-in");
        const res = await prompts({
          type: "select",
          name: "auth",
          message: "How should editors sign in to the admin panel?",
          choices: [
            { title: "🔑  Credentials (single admin)", value: "credentials", description: "Auth.js, one admin account from .env — simplest setup" },
            { title: "🛡️   Auth0 (roles + invitations)", value: "auth0", description: "Editor / publisher / administrator roles, user management, MFA" },
            ...(cms === "supabase" ? [{ title: "🗄️   Supabase Auth", value: "supabase", description: "Supabase users; access limited by ADMIN_EMAILS" }] : []),
          ],
          initial: 0,
        });
        auth = res.auth;
        if (!auth) {
          ui.showCancelled();
          process.exit(1);
        }
      } else {
        auth = "credentials";
      }
    }

    // 5. Admin interface language
    let lang = options.lang;
    if (!lang) {
      if (isInteractive && includesAdmin) {
        ui.sectionHeader(5, 6, "Admin Language");
        const res = await prompts({
          type: "select",
          name: "lang",
          message: "Which language should the admin interface use?",
          choices: [
            { title: "🇬🇧  English", value: "en" },
            { title: "🇹🇷  Türkçe", value: "tr" },
          ],
          initial: 0,
        });
        lang = res.lang;
        if (!lang) {
          ui.showCancelled();
          process.exit(1);
        }
      } else {
        lang = "en";
      }
    }

    const choices = { cms, auth, lang };
    const modules = modulesFor(choices);
    for (const name of modules) {
      const problem = incompatibility(name, choices);
      if (problem) {
        ui.showError(problem);
        process.exit(1);
      }
    }

    // 6. Ensure Directory exists
    if (fs.existsSync(root)) {
      const files = fs.readdirSync(root);
      if (files.length > 0) {
        const { shouldOverwrite } = await prompts({
          type: "confirm",
          name: "shouldOverwrite",
          message: `Directory ${appName} is not empty. Overwrite?`,
          initial: false,
        });

        if (!shouldOverwrite) {
          ui.showCancelled();
          process.exit(1);
        }
        fs.emptyDirSync(root);
      }
    } else {
      fs.ensureDirSync(root);
    }

    const spinner = ora(`Scaffolding ${templateType} with ${cms}${includesAdmin ? ` · ${auth} · ${lang}` : ""}...`).start();

    try {
      const templatesDir = path.join(__dirname, "..", "templates");

      const copyTemplate = (sourceName, destPath) => {
        const source = path.join(templatesDir, sourceName);
        // Overlay ile aynı filtre: node_modules/.next/.git ve .env.example dışındaki tüm .env* dosyaları atlanır.
        fs.copySync(source, destPath, { filter: shouldCopy });

        // Base template = Supabase + credentials + English; seçilen modüller sırayla üzerine uygulanır
        // (modülün o target için tanımı yoksa atlanır). .env üretiminden önce çalışmalı — overlay
        // kendi .env.example'ını getirebilir.
        applyModules(destPath, modules, sourceName);

        // Admin şablonu .env.example'ı bölümler hâlinde taşır (env-example.d/NN-*.env): veri kaynağı ve giriş
        // modülleri yalnız kendi bölümünü değiştirir. Bölümler sırayla birleştirilip klasör silinir.
        const envParts = path.join(destPath, "env-example.d");
        if (fs.existsSync(envParts)) {
          const sections = fs.readdirSync(envParts).filter((file) => file.endsWith(".env")).sort()
            .map((file) => fs.readFileSync(path.join(envParts, file), "utf8").trim());
          fs.writeFileSync(path.join(destPath, ".env.example"), `${sections.join("\n\n")}\n`);
          fs.removeSync(envParts);
        }

        const envExample = path.join(destPath, ".env.example");
        const envTarget = path.join(destPath, ".env");
        if (fs.existsSync(envExample)) {
          fs.copySync(envExample, envTarget);
        }

        const pkgPath = path.join(destPath, "package.json");
        if (fs.existsSync(pkgPath)) {
          const pkg = fs.readJsonSync(pkgPath);
          pkg.name = path.basename(destPath);
          fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
        }
      };

      if (templateType === "full-stack") {
        const webDir = path.join(root, "web");
        const adminDir = path.join(root, "admin");
        fs.ensureDirSync(webDir);
        fs.ensureDirSync(adminDir);
        copyTemplate("web", webDir);
        copyTemplate("admin", adminDir);
        fs.writeFileSync(
          path.join(root, "README.md"),
          `# ${appName}\n\nThis project contains both Web and Admin applications.\n\n- [Web](./web)\n- [Admin](./admin)`,
        );
      } else if (templateType === "web") {
        copyTemplate("web", root);
      } else if (templateType === "admin") {
        copyTemplate("admin", root);
      }

      spinner.succeed("Scaffolding complete!");

      // Skip install prompts if testing
      if (isInteractive) {
        const detectedPm = detectPackageManager();

        ui.sectionHeader(6, 6, "Package Manager");
        const { packageManager } = await prompts({
          type: "select",
          name: "packageManager",
          message: "Which package manager would you like to use?",
          choices: [
            { title: "npm",  value: "npm"  },
            { title: "yarn", value: "yarn" },
            { title: "pnpm", value: "pnpm" },
            { title: "bun",  value: "bun"  },
          ].filter((choice) => isPackageManagerAvailable(choice.value)),
          initial: ["npm", "yarn", "pnpm", "bun"].indexOf(detectedPm) >= 0
            ? ["npm", "yarn", "pnpm", "bun"].indexOf(detectedPm)
            : 0,
        });

        if (!packageManager) {
          ui.showCancelled();
          process.exit(1);
        }

        const { shouldInstall } = await prompts({
          type: "confirm",
          name: "shouldInstall",
          message: `Install dependencies with ${packageManager}?`,
          initial: true,
        });

        if (shouldInstall === undefined) {
          ui.showCancelled();
          process.exit(1);
        }

        if (shouldInstall) {
          const installTargets =
            templateType === "full-stack"
              ? [path.join(root, "web"), path.join(root, "admin")]
              : [root];

          for (const target of installTargets) {
            const dirName = path.basename(target);
            const installSpinner = ora(`Installing dependencies in ${dirName}...`).start();

            try {
              const installCmd =
                packageManager === "yarn" ? "yarn" : `${packageManager} install`;
              execSync(installCmd, { cwd: target, stdio: "pipe" });
              installSpinner.stop();
              ui.showInstallResult(dirName, true, packageManager);
            } catch (err) {
              installSpinner.stop();
              ui.showInstallResult(dirName, false, packageManager);
            }
          }
        }

        ui.showSuccess({ appName, templateType, cms, auth, lang, root, packageManager });
        ui.showNextSteps({ appName, templateType, cms, auth, packageManager, installed: shouldInstall });
        ui.showFooter();

      } else {
        // Fallback for tests
        ui.showSuccess({ appName, templateType, cms, auth, lang, root, packageManager: "npm" });
        ui.showNextSteps({ appName, templateType, cms, auth, packageManager: "npm", installed: false });
      }

    } catch (error) {
      spinner.fail("Error scaffolding project.");

      if (error.code === "EACCES") {
        ui.showError("Permission denied. Try running with elevated privileges.");
      } else if (error.code === "ENOSPC") {
        ui.showError("No disk space available.");
      } else {
        ui.showError(error.message || String(error));
      }

      if (process.env.DEBUG) {
        console.error("\nFull error:", error);
      }

      process.exit(1);
    }
  });

program.parse();