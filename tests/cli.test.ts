import { describe, it, expect, afterEach } from "vitest";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";

const CLI_PATH = path.resolve(__dirname, "../bin/cli.js");
const TEST_DIR = path.resolve(__dirname, "../test-output");

describe("CLI Integration Tests", () => {
  // Clean up test directory after each test
  afterEach(async () => {
    await fs.remove(TEST_DIR);
  });

  describe("Basic Commands", () => {
    it("should display version number when running --version", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "--version"]);
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it("should display usage information when running --help", async () => {
      const { stdout } = await execa("node", [CLI_PATH, "--help"]);
      expect(stdout).toContain("Usage: create-nextjs-stack");
      expect(stdout).toContain("Scaffold a new Next.js Project");
    });
  });

  describe("Project Scaffolding", () => {
    it("should successfully scaffold a Web-only project", async () => {
      const projectName = "test-web-app";
      const projectPath = path.join(TEST_DIR, projectName);

      console.log(`Testing Web Template generation at ${projectPath}...`);
      await execa("node", [CLI_PATH, projectPath, "--template", "web"]);

      // Validation
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, "package.json"))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, ".env"))).toBe(true);
      
      const pkg = fs.readJsonSync(path.join(projectPath, "package.json"));
      expect(pkg.name).toBe(projectName);
    });

    it("should successfully scaffold an Admin-only project", async () => {
      const projectName = "test-admin-panel";
      const projectPath = path.join(TEST_DIR, projectName);

      console.log(`Testing Admin Template generation at ${projectPath}...`);
      await execa("node", [CLI_PATH, projectPath, "--template", "admin"]);

      // Validation
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, "middleware.ts"))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, ".env"))).toBe(true);

      const pkg = fs.readJsonSync(path.join(projectPath, "package.json"));
      expect(pkg.name).toBe(projectName);
    });

    it("should successfully scaffold a Full-Stack project", async () => {
      const projectName = "test-full-stack";
      const projectPath = path.join(TEST_DIR, projectName);

      console.log(`Testing Full Stack generation at ${projectPath}...`);
      await execa("node", [CLI_PATH, projectPath, "--template", "full-stack"]);

      // Validation
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, "web"))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, "admin"))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, "README.md"))).toBe(true);
    });
  });
});
