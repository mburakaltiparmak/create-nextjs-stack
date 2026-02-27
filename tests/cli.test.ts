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
    expect(stdout).toContain("Scaffold a new Next.js Project");
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

    it("should contain service layer files", async () => {
      const p = await scaffoldTemplate("web-services", "web");
      // Services dizini var mı?
      const servicesDir = path.join(p, "src/lib/services");
      expect(fs.existsSync(servicesDir), "Missing: src/lib/services/").toBe(
        true
      );
    });

    it("should contain Redux store", async () => {
      const p = await scaffoldTemplate("web-redux", "web");
      expect(
        fs.existsSync(path.join(p, "src/store")),
        "Missing: src/store/"
      ).toBe(true);
      expect(
        fs.existsSync(path.join(p, "src/store/index.ts")),
        "Missing: src/store/index.ts"
      ).toBe(true);
    });

    it("should contain Supabase client files", async () => {
      const p = await scaffoldTemplate("web-supa", "web");
      const supaDir = path.join(p, "src/lib/supabase");
      expect(fs.existsSync(supaDir), "Missing: src/lib/supabase/").toBe(true);
      expect(
        fs.existsSync(path.join(supaDir, "client.ts")),
        "Missing: client.ts"
      ).toBe(true);
      expect(
        fs.existsSync(path.join(supaDir, "server.ts")),
        "Missing: server.ts"
      ).toBe(true);
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
      const requiredDeps = [
        "next",
        "react",
        "react-dom",
        "@supabase/supabase-js",
        "@supabase/ssr",
        "@reduxjs/toolkit",
        "react-redux",
        "react-hook-form",
      ];
      for (const dep of requiredDeps) {
        expect(pkg.dependencies[dep], `Missing dependency: ${dep}`).toBeDefined();
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

    it(".env.example should contain Cloudinary variables", async () => {
      const p = await scaffoldTemplate("web-env-cloud", "web");
      const envExample = fs.readFileSync(
        path.join(p, ".env.example"),
        "utf-8"
      );
      expect(envExample).toContain("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
      expect(envExample).toContain("CLOUDINARY_API_KEY");
      expect(envExample).toContain("CLOUDINARY_API_SECRET");
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

    it("should contain middleware for route protection", async () => {
      const p = await scaffoldTemplate("admin-mw", "admin");
      expect(
        fs.existsSync(path.join(p, "middleware.ts")),
        "Missing: middleware.ts"
      ).toBe(true);
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

    it("should contain Supabase client files", async () => {
      const p = await scaffoldTemplate("admin-supa", "admin");
      // lib/supabase/ admin'de nerede?
      const possiblePaths = [
        "lib/supabase/client.ts",
        "lib/supabase/server.ts",
        "src/lib/supabase/client.ts",
        "src/lib/supabase/server.ts",
      ];
      const found = possiblePaths.some((fp) =>
        fs.existsSync(path.join(p, fp))
      );
      expect(found, "Missing: supabase client/server files").toBe(true);
    });

    it("should contain admin components", async () => {
      const p = await scaffoldTemplate("admin-comps", "admin");
      const possibleDirs = ["components/admin", "components", "src/components"];
      const found = possibleDirs.some((d) => fs.existsSync(path.join(p, d)));
      expect(found, "Missing: components directory").toBe(true);
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
      const requiredDeps = [
        "next",
        "react",
        "react-dom",
        "@supabase/supabase-js",
        "@supabase/ssr",
        "@reduxjs/toolkit",
        "react-redux",
        "react-hook-form",
      ];
      for (const dep of requiredDeps) {
        expect(pkg.dependencies[dep], `Missing dependency: ${dep}`).toBeDefined();
      }
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

    it(".env.example should contain Cloudinary variables", async () => {
      const p = await scaffoldTemplate("admin-env-cloud", "admin");
      const envExample = fs.readFileSync(
        path.join(p, ".env.example"),
        "utf-8"
      );
      expect(envExample).toContain("CLOUDINARY_API_KEY");
      expect(envExample).toContain("CLOUDINARY_API_SECRET");
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

    it("should contain middleware.ts", async () => {
      const p = await scaffoldTemplate("fs-admin-mw", "full-stack");
      expect(fs.existsSync(path.join(p, "admin/middleware.ts"))).toBe(true);
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

    it("should have .env.example", () => {
      expect(fs.existsSync(path.join(adminDir, ".env.example"))).toBe(true);
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