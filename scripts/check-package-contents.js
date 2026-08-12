#!/usr/bin/env node

const fs = require("node:fs");

const reportPath = process.argv[2];

if (!reportPath) {
  console.error("Usage: node scripts/check-package-contents.js <npm-pack-report.json>");
  process.exit(1);
}

let reports;

try {
  reports = JSON.parse(fs.readFileSync(reportPath, "utf8"));
} catch (error) {
  console.error(`Could not read npm pack report: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(reports)) {
  console.error("Invalid npm pack report: expected an array.");
  process.exit(1);
}

const files = reports.flatMap((report) => report.files ?? []);

if (files.length === 0) {
  console.error("Invalid npm pack report: no files found.");
  process.exit(1);
}

const unwantedFiles = files.filter(({ path }) => {
  const segments = path.split(/[\\/]/);
  const basename = segments.at(-1);

  return (
    basename === "package-lock.json" ||
    basename === ".env" ||
    (basename.startsWith(".env.") && basename !== ".env.example") ||
    segments.includes("node_modules") ||
    segments.includes(".next") ||
    segments.includes(".git")
  );
});

if (unwantedFiles.length > 0) {
  console.error("❌ ERROR: Unwanted files found in package:");
  for (const { path } of unwantedFiles) {
    console.error(`  - ${path}`);
  }
  process.exit(1);
}

console.log(`✅ Package contents look clean (${files.length} files checked).`);
