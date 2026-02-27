#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");
const { program } = require("commander");
const prompts = require("prompts");
const chalk = require("chalk");
const ora = require("ora");
const { execSync } = require("child_process");

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
  console.log(chalk.red("\n\nOperation cancelled."));
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
  .description("Scaffold a new Next.js Project with Supabase Admin support")
  .argument("[project-directory]", "Directory to create the project in")
  .option("-t, --template <type>", "Template type: web, admin, or full-stack")
  .action(async (projectDirectory, options) => {
    const validTemplates = ["web", "admin", "full-stack"];
    if (options.template && !validTemplates.includes(options.template)) {
      console.log(
        chalk.red(
          `\nInvalid template: "${options.template}"\n` +
            `Valid options: ${validTemplates.join(", ")}\n`
        )
      );
      process.exit(1);
    }

    let targetDir = projectDirectory;

    // 1. Get Project Name / Directory
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
      console.log(chalk.red("Operation cancelled. No project name provided."));
      process.exit(1);
    }

    const root = path.resolve(targetDir);
    const appName = path.basename(root);

    // 2. Select Template Type
    let templateType = options.template;

    if (!templateType) {
      const res = await prompts({
        type: "select",
        name: "templateType",
        message: "Which template would you like to generate?",
        choices: [
          {
            title: "Full Stack (Web + Admin)",
            value: "full-stack",
            description:
              "Creates both web and admin projects in subdirectories",
          },
          {
            title: "Web Only (Next.js Landing)",
            value: "web",
            description: "Just the landing page/web application",
          },
          {
            title: "Admin Only (Supabase Admin)",
            value: "admin",
            description: "Just the admin panel",
          },
        ],
        initial: 0,
      });
      templateType = res.templateType;
    }

    if (!templateType) {
      console.log(chalk.red("Operation cancelled."));
      process.exit(1);
    }

    console.log(
      `\nCreating a new ${chalk.cyan(templateType)} project in ${chalk.green(root)}.\n`,
    );

    // 3. Ensure Directory exists
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
          console.log(chalk.red("Aborting installation."));
          process.exit(1);
        }
        fs.emptyDirSync(root);
      }
    } else {
      fs.ensureDirSync(root);
    }

    const spinner = ora(`Scaffolding ${templateType}...`).start();

    try {
      const templatesDir = path.join(__dirname, "..", "templates");

      // Helper function to copy a template
      const copyTemplate = (sourceName, destPath) => {
        const source = path.join(templatesDir, sourceName);
        fs.copySync(source, destPath, {
          filter: (src) => {
            const basename = path.basename(src);
            return (
              basename !== "node_modules" &&
              basename !== ".next" &&
              basename !== ".git" &&
              basename !== "package-lock.json" &&
              basename !== ".env" &&
              basename !== ".DS_Store"
            );
          },
        });

        // Handle .env.example -> .env
        const envExample = path.join(destPath, ".env.example");
        const envTarget = path.join(destPath, ".env");
        if (fs.existsSync(envExample)) {
          fs.copySync(envExample, envTarget);
        }

        // Update package.json name
        const pkgPath = path.join(destPath, "package.json");
        if (fs.existsSync(pkgPath)) {
          const pkg = fs.readJsonSync(pkgPath);
          pkg.name = path.basename(destPath);
          fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
        }
      };

      if (templateType === "full-stack") {
        // Create subdirectories
        const webDir = path.join(root, "web");
        const adminDir = path.join(root, "admin");

        fs.ensureDirSync(webDir);
        fs.ensureDirSync(adminDir);

        copyTemplate("web", webDir);
        copyTemplate("admin", adminDir);

        // Create a root package.json for convenience (workspaces)?
        // Optional, but let's at least leave a README
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
      if (process.env.NODE_ENV !== "test" && process.env.VITEST !== "true") {
        const detectedPm = detectPackageManager();

        const { packageManager } = await prompts({
          type: "select",
          name: "packageManager",
          message: "Which package manager would you like to use?",
          choices: [
            { title: "npm", value: "npm" },
            { title: "yarn", value: "yarn" },
            { title: "pnpm", value: "pnpm" },
            { title: "bun", value: "bun" },
          ].filter((choice) => isPackageManagerAvailable(choice.value)),
          initial: ["npm", "yarn", "pnpm", "bun"].indexOf(detectedPm) >= 0 ? ["npm", "yarn", "pnpm", "bun"].indexOf(detectedPm) : 0,
        });

        if (!packageManager) {
          console.log(chalk.red("\nOperation cancelled."));
          process.exit(1);
        }

        const { shouldInstall } = await prompts({
          type: "confirm",
          name: "shouldInstall",
          message: `Install dependencies with ${packageManager}?`,
          initial: true,
        });

        if (shouldInstall === undefined) {
          console.log(chalk.red("\nOperation cancelled."));
          process.exit(1);
        }

        if (shouldInstall) {
          const installTargets =
            templateType === "full-stack"
              ? [path.join(root, "web"), path.join(root, "admin")]
              : [root];

          for (const target of installTargets) {
            const dirName = path.basename(target);
            const installSpinner = ora(
              `Installing dependencies in ${dirName}...`,
            ).start();

            try {
              const installCmd =
                packageManager === "yarn" ? "yarn" : `${packageManager} install`;

              execSync(installCmd, {
                cwd: target,
                stdio: "pipe",
              });

              installSpinner.succeed(`Dependencies installed in ${dirName}`);
            } catch (error) {
              installSpinner.fail(`Failed to install dependencies in ${dirName}`);
              console.log(
                chalk.yellow(
                  `  You can install manually: cd ${dirName} && ${packageManager} install`,
                ),
              );
            }
          }
        }
        
        console.log(`\n${chalk.green("Success!")} Created project at ${root}\n`);
        console.log("Next steps:");
        console.log(chalk.cyan(`  cd ${appName}`));

        if (templateType === "full-stack") {
          console.log("  Then go to either web or admin folder:");
          console.log(chalk.cyan(`  cd web`));
          if (!shouldInstall) {
            console.log(chalk.cyan(`  ${packageManager || "npm"} install`));
          }
          console.log(chalk.cyan(`  ${packageManager || "npm"} run dev`));
        } else {
          if (!shouldInstall) {
            console.log(chalk.cyan(`  ${packageManager || "npm"} install`));
          }
          console.log(chalk.cyan(`  ${packageManager || "npm"} run dev`));
        }
      } else {
        // Fallback for tests
        console.log(`\nSuccess! Created project at ${root}\n`);
        console.log("Next steps:");
        console.log(chalk.cyan(`  cd ${appName}`));
        if (templateType === "full-stack") {
          console.log("  Then go to either web or admin folder:");
          console.log(chalk.cyan(`  cd web`));
          console.log(chalk.cyan(`  npm install`));
          console.log(chalk.cyan(`  npm run dev`));
        } else {
          console.log(chalk.cyan(`  npm install`));
          console.log(chalk.cyan(`  npm run dev`));
        }
      }
    } catch (error) {
      spinner.fail("Error scaffolding project.");

      if (error.code === "EACCES") {
        console.error(
          chalk.red("\nPermission denied. Try running with elevated privileges.")
        );
      } else if (error.code === "ENOSPC") {
        console.error(chalk.red("\nNo disk space available."));
      } else {
        console.error(chalk.red(`\n${error.message || error}`));
      }

      if (process.env.DEBUG) {
        console.error("\nFull error:", error);
      }

      process.exit(1);
    }
  });

program.parse();
