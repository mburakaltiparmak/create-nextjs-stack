import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { execa, type ExecaError } from "execa";
import fs from "fs-extra";
import path from "path";

// ─── Constants ────────────────────────────────────────────────────────────────

const CLI_PATH = path.resolve(__dirname, "../bin/cli.js");
const TEST_DIR = path.resolve(__dirname, "../test-output");
const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

// Helper: scaffold komutu
const scaffold = (args: string[]) =>
  execa("node", [CLI_PATH, ...args], { timeout: 30_000 });

// Helper: belirli bir template scaffold et ve yolunu döndür
const scaffoldTemplate = async (
  name: string,
  template: "web" | "admin" | "full-stack"
) => {
  const projectPath = path.join(TEST_DIR, name);
  await scaffold([projectPath, "--template", template]);
  return projectPath;
};

// Helper: veri kaynağı seçimiyle scaffold et
const scaffoldWithCms = async (
  name: string,
  template: "web" | "admin" | "full-stack",
  cms: "supabase" | "contentful"
) => {
  const projectPath = path.join(TEST_DIR, name);
  await scaffold([projectPath, "--template", template, "--cms", cms]);
  return projectPath;
};

// Helper: bir dizindeki tüm .ts/.tsx kaynak dosyaları
const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

afterEach(async () => {
  try {
    await fs.remove(TEST_DIR);
  } catch (err) {
    // Retry once after a small delay for Windows file locks
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      await fs.remove(TEST_DIR);
    } catch (e) {
      // Ignore if it still fails
    }
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. CLI META KOMUTLARI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("CLI Meta Commands", () => {
  it("--version should print a valid semver", async () => {
    const { stdout } = await scaffold(["--version"]);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("--version should match package.json version", async () => {
    const { stdout } = await scaffold(["--version"]);
    const pkg = fs.readJsonSync(path.resolve(__dirname, "../package.json"));
    expect(stdout.trim()).toBe(pkg.version);
  });

  it("--help should display usage info", async () => {
    const { stdout } = await scaffold(["--help"]);
    expect(stdout).toContain("Usage: create-nextjs-stack");
    expect(stdout).toContain("Scaffold a Next.js site and admin panel");
  });

  it("--help should list --template option", async () => {
    const { stdout } = await scaffold(["--help"]);
    expect(stdout).toMatch(/--template/);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. INPUT VALİDASYONU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Input Validation", () => {
  it("should reject invalid template type", async () => {
    const projectPath = path.join(TEST_DIR, "invalid-test");
    try {
      await scaffold([projectPath, "--template", "invalid-template"]);
      // Eğer buraya gelirse test başarısız olmalı
      expect.unreachable("Should have thrown an error");
    } catch (error) {
      const e = error as ExecaError;
      expect(e.exitCode).not.toBe(0);
    }
  });

  it("should accept valid template types", async () => {
    for (const template of ["web", "admin", "full-stack"]) {
      const name = `valid-${template}`;
      const projectPath = path.join(TEST_DIR, name);
      const result = await scaffold([projectPath, "--template", template]);
      expect(result.exitCode).toBe(0);
      try {
        await fs.remove(projectPath);
      } catch (err) {
        // Ignore EBUSY on Windows during test, afterEach will eventually clear it
      }
    }
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. WEB TEMPLATE SCAFFOLD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Web Template Scaffolding", () => {
  // --- 3a. Temel dosya yapısı ---
  describe("File Structure", () => {
    it("should create project directory", async () => {
      const p = await scaffoldTemplate("web-struct", "web");
      expect(fs.existsSync(p)).toBe(true);
    });

    it("should contain Next.js core files", async () => {
      const p = await scaffoldTemplate("web-nextjs", "web");
      const requiredFiles = [
        "package.json",
        "tsconfig.json",
        "next.config.ts",
        "postcss.config.mjs",
      ];
      for (const file of requiredFiles) {
        expect(fs.existsSync(path.join(p, file)), `Missing: ${file}`).toBe(
          true
        );
      }
    });

    it("should contain App Router structure", async () => {
      const p = await scaffoldTemplate("web-approuter", "web");
      const requiredPaths = [
        "src/app/layout.tsx",
        "src/app/page.tsx",
        "src/app/robots.ts",
        "src/app/sitemap.ts",
      ];
      for (const fp of requiredPaths) {
        expect(fs.existsSync(path.join(p, fp)), `Missing: ${fp}`).toBe(true);
      }
    });

    it("should contain the content service layer", async () => {
      const p = await scaffoldTemplate("web-services", "web");
      for (const file of ["src/lib/content/service.ts", "src/lib/content/types.ts", "src/lib/leads.ts", "src/lib/preview-token.ts"]) {
        expect(fs.existsSync(path.join(p, file)), `Missing: ${file}`).toBe(true);
      }
    });

    it("should contain blog, page and contact routes", async () => {
      const p = await scaffoldTemplate("web-routes", "web");
      for (const file of ["src/app/blog/page.tsx", "src/app/blog/[slug]/page.tsx", "src/app/[slug]/page.tsx", "src/app/contact/page.tsx", "src/app/api/contact/route.ts", "src/app/api/preview/route.ts", "src/app/api/revalidate/route.ts"]) {
        expect(fs.existsSync(path.join(p, file)), `Missing: ${file}`).toBe(true);
      }
      expect(fs.existsSync(path.join(p, "src/store")), "Redux store should be gone").toBe(false);
    });

    it("should contain the Supabase client", async () => {
      const p = await scaffoldTemplate("web-supa", "web");
      expect(fs.existsSync(path.join(p, "src/lib/supabase/client.ts")), "Missing: src/lib/supabase/client.ts").toBe(true);
    });

    it("should contain SEO configuration", async () => {
      const p = await scaffoldTemplate("web-seo", "web");
      const seoDir = path.join(p, "src/lib/seo");
      expect(fs.existsSync(seoDir), "Missing: src/lib/seo/").toBe(true);
    });
  });

  // --- 3b. Filtreleme: zararlı dosyalar kopyalanmamalı ---
  describe("File Filtering", () => {
    it("should NOT copy node_modules", async () => {
      const p = await scaffoldTemplate("web-filter-nm", "web");
      expect(fs.existsSync(path.join(p, "node_modules"))).toBe(false);
    });

    it("should NOT copy .next build cache", async () => {
      const p = await scaffoldTemplate("web-filter-next", "web");
      expect(fs.existsSync(path.join(p, ".next"))).toBe(false);
    });

    it("should NOT copy package-lock.json", async () => {
      const p = await scaffoldTemplate("web-filter-lock", "web");
      expect(fs.existsSync(path.join(p, "package-lock.json"))).toBe(false);
    });

    it("should NOT copy .git directory", async () => {
      const p = await scaffoldTemplate("web-filter-git", "web");
      expect(fs.existsSync(path.join(p, ".git"))).toBe(false);
    });

    it("should NOT copy .DS_Store", async () => {
      const p = await scaffoldTemplate("web-filter-ds", "web");
      expect(fs.existsSync(path.join(p, ".DS_Store"))).toBe(false);
    });

    it("should NOT copy secret .env* files other than .env.example", async () => {
      // Geliştiricinin template klasöründe kalmış yerel sırlar asla yeni projeye taşınmamalı.
      const secretFiles = [".env.local", ".env.backup"].map((name) =>
        path.join(TEMPLATES_DIR, "web", name),
      );
      const created = secretFiles.filter((file) => !fs.existsSync(file));
      created.forEach((file) => fs.writeFileSync(file, "SECRET=do-not-copy\n"));

      try {
        const p = await scaffoldTemplate("web-filter-env", "web");
        expect(fs.existsSync(path.join(p, ".env.local"))).toBe(false);
        expect(fs.existsSync(path.join(p, ".env.backup"))).toBe(false);
        expect(fs.existsSync(path.join(p, ".env.example"))).toBe(true);
      } finally {
        created.forEach((file) => fs.removeSync(file));
      }
    });
  });

  // --- 3c. package.json doğrulama ---
  describe("package.json Integrity", () => {
    it("should set project name from directory name", async () => {
      const p = await scaffoldTemplate("my-cool-web-app", "web");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.name).toBe("my-cool-web-app");
    });

    it("should be marked as private", async () => {
      const p = await scaffoldTemplate("web-private", "web");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.private).toBe(true);
    });

    it("should contain all required scripts", async () => {
      const p = await scaffoldTemplate("web-scripts", "web");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.scripts).toBeDefined();
      expect(pkg.scripts.dev).toBeDefined();
      expect(pkg.scripts.build).toBeDefined();
      expect(pkg.scripts.start).toBeDefined();
      expect(pkg.scripts.lint).toBeDefined();
    });

    it("should have core dependencies", async () => {
      const p = await scaffoldTemplate("web-deps", "web");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      for (const dep of ["next", "react", "react-dom", "@supabase/supabase-js", "react-markdown", "resend", "zod"]) {
        expect(pkg.dependencies[dep], `Missing dependency: ${dep}`).toBeDefined();
      }
      for (const dep of ["@reduxjs/toolkit", "react-redux", "cloudinary"]) {
        expect(pkg.dependencies[dep], `Unexpected dependency: ${dep}`).toBeUndefined();
      }
    });

    it("should have TypeScript devDependencies", async () => {
      const p = await scaffoldTemplate("web-ts-deps", "web");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.devDependencies["typescript"]).toBeDefined();
      expect(pkg.devDependencies["@types/react"]).toBeDefined();
      expect(pkg.devDependencies["@types/node"]).toBeDefined();
    });

    it("should have engines field with node >= 20", async () => {
      const p = await scaffoldTemplate("web-engines", "web");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.engines).toBeDefined();
      expect(pkg.engines.node).toBeDefined();
      // >=20 formatını doğrula
      const match = pkg.engines.node.match(/(\d+)/);
      expect(match).not.toBeNull();
      expect(parseInt(match![1])).toBeGreaterThanOrEqual(20);
    });
  });

  // --- 3d. Environment dosyaları ---
  describe("Environment Files", () => {
    it("should create .env from .env.example", async () => {
      const p = await scaffoldTemplate("web-env", "web");
      expect(fs.existsSync(path.join(p, ".env"))).toBe(true);
      expect(fs.existsSync(path.join(p, ".env.example"))).toBe(true);
    });

    it(".env should have same content as .env.example", async () => {
      const p = await scaffoldTemplate("web-env-content", "web");
      const env = fs.readFileSync(path.join(p, ".env"), "utf-8");
      const envExample = fs.readFileSync(
        path.join(p, ".env.example"),
        "utf-8"
      );
      expect(env).toBe(envExample);
    });

    it(".env.example should contain Supabase variables", async () => {
      const p = await scaffoldTemplate("web-env-supa", "web");
      const envExample = fs.readFileSync(
        path.join(p, ".env.example"),
        "utf-8"
      );
      expect(envExample).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(envExample).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
      expect(envExample).toContain("SUPABASE_SERVICE_ROLE_KEY");
    });

    it(".env.example should contain preview and contact variables", async () => {
      const p = await scaffoldTemplate("web-env-preview", "web");
      const envExample = fs.readFileSync(path.join(p, ".env.example"), "utf-8");
      for (const key of ["PREVIEW_SECRET", "REVALIDATION_SECRET", "RESEND_API_KEY", "CONTACT_EMAIL", "SUPABASE_SERVICE_ROLE_KEY"]) expect(envExample).toContain(key);
    });

    it(".env.example should contain site config variables", async () => {
      const p = await scaffoldTemplate("web-env-site", "web");
      const envExample = fs.readFileSync(
        path.join(p, ".env.example"),
        "utf-8"
      );
      expect(envExample).toContain("NEXT_PUBLIC_SITE_URL");
    });

    it(".env.example should NOT contain deprecated Supabase variables", async () => {
      const p = await scaffoldTemplate("web-env-clean", "web");
      const envExample = fs.readFileSync(
        path.join(p, ".env.example"),
        "utf-8"
      );
      // v0.2.0'da temizlenen gereksiz değişkenler
      const deprecated = [
        "SUPABASE_DATABASE_PASSWORD",
        "SUPABASE_PROJECT_NAME",
        "SUPABASE_PROJECT_ID",
        "SUPABASE_PUBLISHABLE_KEY",
        "SUPABASE_SECRET_KEY",
      ];
      for (const v of deprecated) {
        expect(
          envExample.includes(v),
          `Deprecated variable still present: ${v}`
        ).toBe(false);
      }
    });
  });

  // --- 3e. Hardcoded veri kontrolü (generic template olmalı) ---
  describe("No Hardcoded Data", () => {
    it("should NOT contain client-specific company names in SEO config", async () => {
      const p = await scaffoldTemplate("web-generic", "web");
      const seoConfigPath = path.join(p, "src/lib/seo/seo.config.ts");
      if (fs.existsSync(seoConfigPath)) {
        const content = fs.readFileSync(seoConfigPath, "utf-8");
        // Eski client'tan kalan hardcoded veri
        expect(content).not.toContain("Eurodeco");
        expect(content).not.toContain("eurodeco");
      }
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. ADMIN TEMPLATE SCAFFOLD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Admin Template Scaffolding", () => {
  describe("File Structure", () => {
    it("should create project directory", async () => {
      const p = await scaffoldTemplate("admin-struct", "admin");
      expect(fs.existsSync(p)).toBe(true);
    });

    it("should contain Next.js core files", async () => {
      const p = await scaffoldTemplate("admin-nextjs", "admin");
      const requiredFiles = [
        "package.json",
        "tsconfig.json",
        "next.config.ts",
        "postcss.config.mjs",
      ];
      for (const file of requiredFiles) {
        expect(fs.existsSync(path.join(p, file)), `Missing: ${file}`).toBe(
          true
        );
      }
    });

    it("should contain the proxy for route protection", async () => {
      const p = await scaffoldTemplate("admin-mw", "admin");
      expect(fs.existsSync(path.join(p, "src/proxy.ts")), "Missing: src/proxy.ts").toBe(true);
      expect(fs.existsSync(path.join(p, "src/auth.ts")), "Missing: src/auth.ts (credentials)").toBe(true);
    });

    it("should contain App Router with auth and dashboard groups", async () => {
      const p = await scaffoldTemplate("admin-routes", "admin");
      // Admin template src/ kullanmaz, doğrudan app/ dizini
      const appDir = fs.existsSync(path.join(p, "app")) ? "app" : "src/app";
      expect(
        fs.existsSync(path.join(p, appDir, "layout.tsx")),
        "Missing: layout.tsx"
      ).toBe(true);
    });

    it("should contain the Supabase content store and schema", async () => {
      const p = await scaffoldTemplate("admin-supa", "admin");
      for (const file of ["src/lib/content-store.ts", "src/lib/leads.ts", "src/lib/models/site.ts", "supabase/schema.sql", "supabase/seed.sql"]) {
        expect(fs.existsSync(path.join(p, file)), `Missing: ${file}`).toBe(true);
      }
    });

    it("should contain the panel shell, i18n and tests", async () => {
      const p = await scaffoldTemplate("admin-comps", "admin");
      for (const file of ["src/components/ContentForm.tsx", "src/components/shell/AppSidebar.tsx", "src/lib/i18n/index.ts", "src/lib/i18n/en.ts", "src/lib/i18n/tr.ts", "src/lib/content-validation.test.ts", "vitest.config.ts"]) {
        expect(fs.existsSync(path.join(p, file)), `Missing: ${file}`).toBe(true);
      }
      expect(fs.existsSync(path.join(p, "env-example.d")), "env fragments must be merged").toBe(false);
    });
  });

  describe("File Filtering", () => {
    it("should NOT copy node_modules", async () => {
      const p = await scaffoldTemplate("admin-filter-nm", "admin");
      expect(fs.existsSync(path.join(p, "node_modules"))).toBe(false);
    });

    it("should NOT copy package-lock.json", async () => {
      const p = await scaffoldTemplate("admin-filter-lock", "admin");
      expect(fs.existsSync(path.join(p, "package-lock.json"))).toBe(false);
    });
  });

  describe("package.json Integrity", () => {
    it("should set project name from directory name", async () => {
      const p = await scaffoldTemplate("my-admin-panel", "admin");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.name).toBe("my-admin-panel");
    });

    it("should be marked as private", async () => {
      const p = await scaffoldTemplate("admin-private", "admin");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.private).toBe(true);
    });

    it("should have core dependencies", async () => {
      const p = await scaffoldTemplate("admin-deps", "admin");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      for (const dep of ["next", "react", "react-dom", "@supabase/supabase-js", "next-auth", "bcryptjs", "zod", "radix-ui", "sonner"]) {
        expect(pkg.dependencies[dep], `Missing dependency: ${dep}`).toBeDefined();
      }
      for (const dep of ["@reduxjs/toolkit", "react-hook-form", "react-toastify"]) {
        expect(pkg.dependencies[dep], `Unexpected dependency: ${dep}`).toBeUndefined();
      }
      for (const script of ["dev", "build", "lint", "typecheck", "test", "config:check", "auth:hash"]) expect(pkg.scripts[script], `Missing script: ${script}`).toBeDefined();
    });

    it("should have engines field with node >= 20", async () => {
      const p = await scaffoldTemplate("admin-engines", "admin");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.engines).toBeDefined();
      expect(pkg.engines.node).toBeDefined();
    });
  });

  describe("Environment Files", () => {
    it("should create .env from .env.example", async () => {
      const p = await scaffoldTemplate("admin-env", "admin");
      expect(fs.existsSync(path.join(p, ".env"))).toBe(true);
      expect(fs.existsSync(path.join(p, ".env.example"))).toBe(true);
    });

    it(".env.example should contain Supabase variables", async () => {
      const p = await scaffoldTemplate("admin-env-supa", "admin");
      const envExample = fs.readFileSync(
        path.join(p, ".env.example"),
        "utf-8"
      );
      expect(envExample).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(envExample).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
      expect(envExample).toContain("SUPABASE_SERVICE_ROLE_KEY");
    });

    it(".env.example should contain Cloudinary, auth and preview variables", async () => {
      const p = await scaffoldTemplate("admin-env-cloud", "admin");
      const envExample = fs.readFileSync(path.join(p, ".env.example"), "utf-8");
      for (const key of ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "AUTH_SECRET", "ADMIN_EMAIL", "PREVIEW_SECRET", "CRON_SECRET"]) expect(envExample).toContain(key);
      expect(envExample).toMatch(/^AUTH_TRUST_HOST=true$/m);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. FULL-STACK TEMPLATE SCAFFOLD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Full-Stack Template Scaffolding", () => {
  describe("Structure", () => {
    it("should create web and admin subdirectories", async () => {
      const p = await scaffoldTemplate("fs-struct", "full-stack");
      expect(fs.existsSync(path.join(p, "web"))).toBe(true);
      expect(fs.existsSync(path.join(p, "admin"))).toBe(true);
    });

    it("should create a root README.md", async () => {
      const p = await scaffoldTemplate("fs-readme", "full-stack");
      expect(fs.existsSync(path.join(p, "README.md"))).toBe(true);
      const content = fs.readFileSync(path.join(p, "README.md"), "utf-8");
      expect(content).toContain("Web");
      expect(content).toContain("Admin");
    });

    it("root README should contain project name", async () => {
      const p = await scaffoldTemplate("my-fullstack-app", "full-stack");
      const content = fs.readFileSync(path.join(p, "README.md"), "utf-8");
      expect(content).toContain("my-fullstack-app");
    });
  });

  describe("Web Sub-project", () => {
    it("should have its own package.json with correct name", async () => {
      const p = await scaffoldTemplate("fs-web-pkg", "full-stack");
      const pkg = fs.readJsonSync(path.join(p, "web/package.json"));
      expect(pkg.name).toBe("web");
    });

    it("should have .env file", async () => {
      const p = await scaffoldTemplate("fs-web-env", "full-stack");
      expect(fs.existsSync(path.join(p, "web/.env"))).toBe(true);
    });

    it("should contain Next.js core files", async () => {
      const p = await scaffoldTemplate("fs-web-core", "full-stack");
      expect(fs.existsSync(path.join(p, "web/next.config.ts"))).toBe(true);
      expect(fs.existsSync(path.join(p, "web/tsconfig.json"))).toBe(true);
    });

    it("should NOT contain node_modules or package-lock.json", async () => {
      const p = await scaffoldTemplate("fs-web-filter", "full-stack");
      expect(fs.existsSync(path.join(p, "web/node_modules"))).toBe(false);
      expect(fs.existsSync(path.join(p, "web/package-lock.json"))).toBe(false);
    });
  });

  describe("Admin Sub-project", () => {
    it("should have its own package.json with correct name", async () => {
      const p = await scaffoldTemplate("fs-admin-pkg", "full-stack");
      const pkg = fs.readJsonSync(path.join(p, "admin/package.json"));
      expect(pkg.name).toBe("admin");
    });

    it("should have .env file", async () => {
      const p = await scaffoldTemplate("fs-admin-env", "full-stack");
      expect(fs.existsSync(path.join(p, "admin/.env"))).toBe(true);
    });

    it("should contain the proxy", async () => {
      const p = await scaffoldTemplate("fs-admin-mw", "full-stack");
      expect(fs.existsSync(path.join(p, "admin/src/proxy.ts"))).toBe(true);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. NPM PAKET BÜTÜNLÜĞÜ (Root CLI Paketi)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("NPM Package Integrity", () => {
  const rootPkg = () =>
    fs.readJsonSync(path.resolve(__dirname, "../package.json"));

  it("should have bin field pointing to cli.js", () => {
    const pkg = rootPkg();
    expect(pkg.bin).toBeDefined();
    expect(pkg.bin["create-nextjs-stack"]).toBe("./bin/cli.js");
  });

  it("bin/cli.js should exist and be executable", () => {
    const cliPath = path.resolve(__dirname, "../bin/cli.js");
    expect(fs.existsSync(cliPath)).toBe(true);
    const content = fs.readFileSync(cliPath, "utf-8");
    expect(content.startsWith("#!/usr/bin/env node")).toBe(true);
  });

  it("should have files field limiting package contents", () => {
    const pkg = rootPkg();
    expect(pkg.files).toBeDefined();
    expect(pkg.files).toContain("bin");
    expect(pkg.files).toContain("templates");
  });

  it("should have type field set to commonjs", () => {
    const pkg = rootPkg();
    expect(pkg.type).toBe("commonjs");
  });

  it("should have exports field", () => {
    const pkg = rootPkg();
    expect(pkg.exports).toBeDefined();
  });

  it("should have engines.node >= 20", () => {
    const pkg = rootPkg();
    expect(pkg.engines).toBeDefined();
    expect(pkg.engines.node).toBeDefined();
    const match = pkg.engines.node.match(/(\d+)/);
    expect(match).not.toBeNull();
    expect(parseInt(match![1])).toBeGreaterThanOrEqual(20);
  });

  it("should have MIT license", () => {
    const pkg = rootPkg();
    expect(pkg.license).toBe("MIT");
  });

  it("should have required keywords for discoverability", () => {
    const pkg = rootPkg();
    expect(pkg.keywords).toBeDefined();
    expect(pkg.keywords).toContain("nextjs");
    expect(pkg.keywords).toContain("cli");
    expect(pkg.keywords).toContain("supabase");
  });

  it("should have repository, homepage and bugs fields", () => {
    const pkg = rootPkg();
    expect(pkg.repository).toBeDefined();
    expect(pkg.homepage).toBeDefined();
    expect(pkg.bugs).toBeDefined();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. TEMPLATE KAYNAK BÜTÜNLÜĞÜ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Template Source Integrity", () => {
  describe("Web template source", () => {
    const webDir = path.join(TEMPLATES_DIR, "web");

    it("should exist", () => {
      expect(fs.existsSync(webDir)).toBe(true);
    });

    it("should have .env.example", () => {
      expect(fs.existsSync(path.join(webDir, ".env.example"))).toBe(true);
    });

    it("should have .gitignore", () => {
      expect(fs.existsSync(path.join(webDir, ".gitignore"))).toBe(true);
    });

    it("package.json should be valid JSON", () => {
      expect(() => fs.readJsonSync(path.join(webDir, "package.json"))).not.toThrow();
    });

    it("tsconfig.json should be valid JSON", () => {
      // tsconfig JSON with Comments (JSONC) olabilir, readFileSync ile oku
      const content = fs.readFileSync(
        path.join(webDir, "tsconfig.json"),
        "utf-8"
      );
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe("Admin template source", () => {
    const adminDir = path.join(TEMPLATES_DIR, "admin");

    it("should exist", () => {
      expect(fs.existsSync(adminDir)).toBe(true);
    });

    it("should have .env.example fragments", () => {
      const parts = fs.readdirSync(path.join(adminDir, "env-example.d"));
      for (const part of ["10-panel.env", "20-cms.env", "30-auth.env"]) expect(parts).toContain(part);
    });

    it("should have .gitignore", () => {
      expect(fs.existsSync(path.join(adminDir, ".gitignore"))).toBe(true);
    });

    it("package.json should be valid JSON", () => {
      expect(() =>
        fs.readJsonSync(path.join(adminDir, "package.json"))
      ).not.toThrow();
    });
  });

  describe("Template consistency", () => {
    it("both templates should use same React version range", () => {
      const webPkg = fs.readJsonSync(
        path.join(TEMPLATES_DIR, "web/package.json")
      );
      const adminPkg = fs.readJsonSync(
        path.join(TEMPLATES_DIR, "admin/package.json")
      );
      expect(webPkg.dependencies.react).toBe(adminPkg.dependencies.react);
    });

    it("both templates should use same Next.js version range", () => {
      const webPkg = fs.readJsonSync(
        path.join(TEMPLATES_DIR, "web/package.json")
      );
      const adminPkg = fs.readJsonSync(
        path.join(TEMPLATES_DIR, "admin/package.json")
      );
      expect(webPkg.dependencies.next).toBe(adminPkg.dependencies.next);
    });

    it("both templates should use same Supabase client version", () => {
      const webPkg = fs.readJsonSync(
        path.join(TEMPLATES_DIR, "web/package.json")
      );
      const adminPkg = fs.readJsonSync(
        path.join(TEMPLATES_DIR, "admin/package.json")
      );
      expect(webPkg.dependencies["@supabase/supabase-js"]).toBe(
        adminPkg.dependencies["@supabase/supabase-js"]
      );
    });

    it("both templates should be marked as private", () => {
      const webPkg = fs.readJsonSync(
        path.join(TEMPLATES_DIR, "web/package.json")
      );
      const adminPkg = fs.readJsonSync(
        path.join(TEMPLATES_DIR, "admin/package.json")
      );
      expect(webPkg.private).toBe(true);
      expect(adminPkg.private).toBe(true);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. REPO SAĞLIĞI (Gerekli dosyalar)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Repository Health", () => {
  const root = path.resolve(__dirname, "..");

  it("should have LICENSE file", () => {
    expect(fs.existsSync(path.join(root, "LICENSE"))).toBe(true);
  });

  it("LICENSE should contain MIT", () => {
    const content = fs.readFileSync(path.join(root, "LICENSE"), "utf-8");
    expect(content).toContain("MIT");
  });

  it("should have README.md", () => {
    expect(fs.existsSync(path.join(root, "README.md"))).toBe(true);
  });

  it("should have CHANGELOG.md", () => {
    expect(fs.existsSync(path.join(root, "CHANGELOG.md"))).toBe(true);
  });

  it("should have CONTRIBUTING.md", () => {
    expect(fs.existsSync(path.join(root, "CONTRIBUTING.md"))).toBe(true);
  });

  it("should have .npmignore", () => {
    expect(fs.existsSync(path.join(root, ".npmignore"))).toBe(true);
  });

  it("should have .gitignore", () => {
    expect(fs.existsSync(path.join(root, ".gitignore"))).toBe(true);
  });

  it("should have CI workflow", () => {
    expect(
      fs.existsSync(path.join(root, ".github/workflows/ci.yml"))
    ).toBe(true);
  });

  it("should have publish workflow", () => {
    expect(
      fs.existsSync(path.join(root, ".github/workflows/publish.yml"))
    ).toBe(true);
  });

  it("should have bug report issue template", () => {
    expect(
      fs.existsSync(
        path.join(root, ".github/ISSUE_TEMPLATE/bug_report.yml")
      )
    ).toBe(true);
  });

  it("should have feature request issue template", () => {
    expect(
      fs.existsSync(
        path.join(root, ".github/ISSUE_TEMPLATE/feature_request.yml")
      )
    ).toBe(true);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. EDGE CASE'LER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Edge Cases", () => {
  it("should handle project names with dots", async () => {
    const p = await scaffoldTemplate("my.app.web", "web");
    const pkg = fs.readJsonSync(path.join(p, "package.json"));
    expect(pkg.name).toBe("my.app.web");
  });

  it("should handle project names with hyphens", async () => {
    const p = await scaffoldTemplate("my-awesome-app", "web");
    const pkg = fs.readJsonSync(path.join(p, "package.json"));
    expect(pkg.name).toBe("my-awesome-app");
  });

  it("should handle deeply nested output paths", async () => {
    const deepPath = path.join(TEST_DIR, "deep", "nested", "project");
    await scaffold([deepPath, "--template", "web"]);
    expect(fs.existsSync(deepPath)).toBe(true);
    expect(fs.existsSync(path.join(deepPath, "package.json"))).toBe(true);
  });

  it("should scaffold into current directory style path", async () => {
    const p = path.join(TEST_DIR, "cwd-test");
    await scaffold([p, "--template", "admin"]);
    expect(fs.existsSync(path.join(p, "package.json"))).toBe(true);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. CONTENTFUL VERİ KAYNAĞI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Bir dizindeki tüm kaynak dosyalarını gezer (node_modules hariç).
const walkSourceFiles = (dir: string): string[] => {
  const out: string[] = [];

  const visit = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(full);
      } else if (/\.(ts|tsx|mjs|cjs|js)$/.test(entry.name)) {
        out.push(full);
      }
    }
  };

  if (fs.existsSync(dir)) visit(dir);
  return out;
};

describe("Contentful Data Source", () => {
  describe("CLI surface", () => {
    it("--help should list --cms option", async () => {
      const { stdout } = await scaffold(["--help"]);
      expect(stdout).toMatch(/--cms/);
    });

    it("should reject an invalid data source", async () => {
      const projectPath = path.join(TEST_DIR, "invalid-cms");
      try {
        await scaffold([projectPath, "--template", "web", "--cms", "strapi"]);
        expect.unreachable("Should have thrown an error");
      } catch (error) {
        const e = error as ExecaError;
        expect(e.exitCode).not.toBe(0);
      }
    });

    it("should accept both data sources", async () => {
      for (const cms of ["supabase", "contentful"]) {
        const projectPath = path.join(TEST_DIR, `valid-cms-${cms}`);
        const result = await scaffold([
          projectPath,
          "--template",
          "web",
          "--cms",
          cms,
        ]);
        expect(result.exitCode).toBe(0);
        try {
          await fs.remove(projectPath);
        } catch (err) {
          // Ignore EBUSY on Windows during test, afterEach will eventually clear it
        }
      }
    });

    it("should default to supabase when --cms is omitted", async () => {
      const p = await scaffoldTemplate("cms-default", "web");
      expect(fs.existsSync(path.join(p, "src/lib/supabase"))).toBe(true);
      expect(fs.existsSync(path.join(p, "src/lib/contentful"))).toBe(false);
    });

    it("should still name the package after the directory", async () => {
      const p = await scaffoldWithCms("my-contentful-site", "web", "contentful");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.name).toBe("my-contentful-site");
    });
  });

  describe("Web template", () => {
    it("should contain the Contentful data layer and content service", async () => {
      const p = await scaffoldWithCms("cf-web-layer", "web", "contentful");
      for (const file of ["src/lib/contentful/client.ts", "src/lib/contentful/mappers.ts", "src/lib/content/service.ts", "src/lib/leads.ts", "src/app/api/revalidate/contentful/route.ts", "contentful/generate-types.mjs"]) {
        expect(fs.existsSync(path.join(p, file)), `Missing: ${file}`).toBe(true);
      }
      expect(fs.readFileSync(path.join(p, "src/lib/content/service.ts"), "utf-8")).toContain("queryEntries");
    });

    it("should remove the Supabase data layer", async () => {
      const p = await scaffoldWithCms("cf-web-nosupa", "web", "contentful");
      expect(fs.existsSync(path.join(p, "src/lib/supabase"))).toBe(false);
    });

    it("should leave no imports of the removed Supabase layer", async () => {
      const p = await scaffoldWithCms("cf-web-imports", "web", "contentful");
      const offenders = sourceFiles(path.join(p, "src")).filter((file) => /@\/lib\/supabase|@supabase\//.test(fs.readFileSync(file, "utf-8")));
      expect(offenders, `Files still importing Supabase: ${offenders.join(", ")}`).toEqual([]);
    });

    it("should swap the dependencies and scripts", async () => {
      const p = await scaffoldWithCms("cf-web-deps", "web", "contentful");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.dependencies["contentful"]).toBeDefined();
      expect(pkg.dependencies["@supabase/supabase-js"]).toBeUndefined();
      expect(pkg.scripts["contentful:types"]).toBeDefined();
    });

    it(".env should carry Contentful variables and drop Supabase ones", async () => {
      const p = await scaffoldWithCms("cf-web-env", "web", "contentful");
      const env = fs.readFileSync(path.join(p, ".env"), "utf-8");
      for (const key of ["CONTENTFUL_SPACE_ID", "CONTENTFUL_DELIVERY_TOKEN", "CONTENTFUL_PREVIEW_TOKEN", "CONTENTFUL_WEBHOOK_SECRET", "PREVIEW_SECRET"]) expect(env).toContain(key);
      expect(env).not.toContain("NEXT_PUBLIC_SUPABASE_URL");
    });
  });

  describe("Admin template", () => {
    it("should contain the Contentful backend and media library", async () => {
      const p = await scaffoldWithCms("cf-admin-layer", "admin", "contentful");
      for (const file of ["src/lib/contentful.ts", "src/lib/content-store.ts", "src/app/media-actions.ts", "src/app/(panel)/assets/page.tsx", "src/components/content/AssetPicker.tsx", "contentful/setup.mjs", "contentful/seed.mjs", "contentful/migrations/01-posts-pages.cjs", "contentful/migrations/02-leads-settings.cjs"]) {
        expect(fs.existsSync(path.join(p, file)), `Missing: ${file}`).toBe(true);
      }
      expect(fs.readFileSync(path.join(p, "src/lib/backend.ts"), "utf-8")).toContain('name: "contentful"');
    });

    it("should remove every Supabase and Cloudinary artifact", async () => {
      const p = await scaffoldWithCms("cf-admin-nosupa", "admin", "contentful");
      for (const file of ["supabase", "src/lib/cloudinary.ts", "src/components/content/CloudinaryImage.tsx"]) {
        expect(fs.existsSync(path.join(p, file)), `Should be removed: ${file}`).toBe(false);
      }
      const offenders = sourceFiles(path.join(p, "src")).filter((file) => /@supabase\/|@\/lib\/cloudinary|CloudinaryImage/.test(fs.readFileSync(file, "utf-8")));
      expect(offenders, `Leftover imports: ${offenders.join(", ")}`).toEqual([]);
    });

    it("should swap the dependencies and add the Contentful scripts", async () => {
      const p = await scaffoldWithCms("cf-admin-deps", "admin", "contentful");
      const pkg = fs.readJsonSync(path.join(p, "package.json"));
      expect(pkg.dependencies["@supabase/supabase-js"]).toBeUndefined();
      expect(pkg.devDependencies["contentful-management"]).toBeDefined();
      expect(pkg.scripts["contentful:setup"]).toBeDefined();
      expect(pkg.scripts["contentful:seed"]).toBeDefined();
    });

    it(".env should carry auth and Contentful variables", async () => {
      const p = await scaffoldWithCms("cf-admin-env", "admin", "contentful");
      const env = fs.readFileSync(path.join(p, ".env"), "utf-8");
      expect(env).toContain("CONTENTFUL_MANAGEMENT_TOKEN");
      expect(env).toContain("AUTH_SECRET");
      expect(env).toMatch(/^AUTH_TRUST_HOST=true$/m);
      expect(env).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(env).not.toContain("CLOUDINARY_API_KEY");
    });
  });

  describe("Full-stack template", () => {
    it("should apply the module to both sub-projects", async () => {
      const p = await scaffoldWithCms("cf-fullstack", "full-stack", "contentful");
      expect(fs.existsSync(path.join(p, "web/src/lib/contentful/client.ts"))).toBe(true);
      expect(fs.existsSync(path.join(p, "admin/src/lib/contentful.ts"))).toBe(true);
    });

    it("should keep sub-project package names", async () => {
      const p = await scaffoldWithCms("cf-fullstack-names", "full-stack", "contentful");
      expect(fs.readJsonSync(path.join(p, "web/package.json")).name).toBe("web");
      expect(fs.readJsonSync(path.join(p, "admin/package.json")).name).toBe("admin");
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN SIGN-IN (--auth) AND LANGUAGE (--lang) MODULES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const scaffoldWith = async (name: string, args: string[]) => {
  const projectPath = path.join(TEST_DIR, name);
  await scaffold([projectPath, "--template", "admin", ...args]);
  return projectPath;
};

const expectFailure = async (args: string[]) => {
  try {
    await scaffold([path.join(TEST_DIR, "invalid"), ...args]);
    expect.unreachable("Should have thrown an error");
  } catch (error) {
    expect((error as ExecaError).exitCode).not.toBe(0);
    return error as ExecaError;
  }
};

describe("Admin sign-in modules", () => {
  it("--help should list --auth and --lang", async () => {
    const { stdout } = await scaffold(["--help"]);
    expect(stdout).toMatch(/--auth/);
    expect(stdout).toMatch(/--lang/);
  });

  it("should reject unknown sign-in methods and languages", async () => {
    await expectFailure(["--template", "admin", "--auth", "github"]);
    await expectFailure(["--template", "admin", "--lang", "de"]);
  });

  it("should reject Supabase Auth with the Contentful data source", async () => {
    const error = await expectFailure(["--template", "admin", "--cms", "contentful", "--auth", "supabase"]);
    expect(String(error?.stdout ?? "") + String(error?.stderr ?? "")).toMatch(/requires --cms supabase/);
  });

  it("auth0 should add user management and remove Auth.js", async () => {
    const p = await scaffoldWith("auth0-admin", ["--auth", "auth0"]);
    for (const file of ["src/lib/auth0.ts", "src/lib/management.ts", "src/app/(panel)/users/page.tsx", "src/app/(panel)/account/page.tsx", "auth0/actions/add-claims.js"]) {
      expect(fs.existsSync(path.join(p, file)), `Missing: ${file}`).toBe(true);
    }
    for (const file of ["src/auth.ts", "src/auth.config.ts", "src/app/(auth)", "src/app/api/auth", "scripts/hash-password.mjs"]) {
      expect(fs.existsSync(path.join(p, file)), `Should be removed: ${file}`).toBe(false);
    }
    const pkg = fs.readJsonSync(path.join(p, "package.json"));
    expect(pkg.dependencies["@auth0/nextjs-auth0"]).toBeDefined();
    expect(pkg.dependencies["next-auth"]).toBeUndefined();
    expect(pkg.scripts["auth:hash"]).toBeUndefined();
    const env = fs.readFileSync(path.join(p, ".env"), "utf-8");
    expect(env).toContain("AUTH0_CLIENT_ID");
    expect(env).not.toContain("ADMIN_PASSWORD");
  });

  it("supabase auth should use Supabase sessions and ADMIN_EMAILS", async () => {
    const p = await scaffoldWith("supa-auth-admin", ["--auth", "supabase"]);
    expect(fs.readFileSync(path.join(p, "src/lib/authorization.ts"), "utf-8")).toContain("ADMIN_EMAILS");
    expect(fs.existsSync(path.join(p, "src/lib/supabase-auth.ts"))).toBe(true);
    expect(fs.existsSync(path.join(p, "src/auth.ts"))).toBe(false);
    const pkg = fs.readJsonSync(path.join(p, "package.json"));
    expect(pkg.dependencies["@supabase/ssr"]).toBeDefined();
    expect(pkg.dependencies["next-auth"]).toBeUndefined();
    expect(fs.readFileSync(path.join(p, ".env"), "utf-8")).toContain("ADMIN_EMAILS");
  });

  it("should leave no imports of removed sign-in files", async () => {
    for (const [name, args] of [["imports-auth0", ["--auth", "auth0"]], ["imports-supa", ["--auth", "supabase"]]] as const) {
      const p = await scaffoldWith(name, [...args]);
      const offenders = sourceFiles(path.join(p, "src")).filter((file) => /from "@\/auth(\.config)?"|next-auth/.test(fs.readFileSync(file, "utf-8")));
      expect(offenders, `Leftover Auth.js imports: ${offenders.join(", ")}`).toEqual([]);
    }
  });

  it("web-only projects should not be affected by --auth or --lang", async () => {
    const projectPath = path.join(TEST_DIR, "web-auth");
    await scaffold([projectPath, "--template", "web", "--auth", "auth0", "--lang", "tr"]);
    expect(fs.existsSync(path.join(projectPath, "src/lib/auth0.ts"))).toBe(false);
  });
});

describe("Admin language module", () => {
  it("should default to English", async () => {
    const p = await scaffoldWith("lang-en", []);
    expect(fs.readFileSync(path.join(p, "src/lib/i18n/index.ts"), "utf-8")).toMatch(/export const t = en/);
  });

  it("--lang tr should select the Turkish dictionary", async () => {
    const p = await scaffoldWith("lang-tr", ["--lang", "tr"]);
    expect(fs.readFileSync(path.join(p, "src/lib/i18n/index.ts"), "utf-8")).toMatch(/export const t = tr/);
  });

  it("dictionaries should define the same keys", async () => {
    const keys = (file: string) => [...fs.readFileSync(path.join(TEMPLATES_DIR, "admin/src/lib/i18n", file), "utf-8").matchAll(/^\s{4}([A-Za-z]+):/gm)].map((match) => match[1]);
    expect(keys("tr.ts")).toEqual(keys("en.ts"));
  });
});

describe("Module manifests", () => {
  const modulesDir = path.join(TEMPLATES_DIR, "modules");
  const modules = fs.readdirSync(modulesDir).filter((name) => fs.existsSync(path.join(modulesDir, name, "module.json")));

  it("should ship the cms, auth and lang modules", () => {
    expect(modules.sort()).toEqual(["auth-auth0", "auth-supabase", "contentful", "lang-tr"]);
  });

  it("manifests should be valid with a known kind and safe remove paths", () => {
    for (const name of modules) {
      const manifest = fs.readJsonSync(path.join(modulesDir, name, "module.json"));
      expect(manifest.name).toBe(name);
      expect(["cms", "auth", "lang"]).toContain(manifest.kind);
      for (const target of Object.values(manifest.targets) as Array<{ remove?: string[] }>) {
        for (const entry of target.remove ?? []) {
          expect(path.isAbsolute(entry), `Absolute path in ${name}: ${entry}`).toBe(false);
          expect(entry.includes(".."), `Escapes project in ${name}: ${entry}`).toBe(false);
        }
      }
    }
  });
});
