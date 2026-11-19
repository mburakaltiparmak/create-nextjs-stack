#!/usr/bin/env node
/**
 * Admin parolası için bcrypt hash üretir.
 *
 *   npm run auth:hash -- "my-strong-password"
 *
 * Çıktıyı .env içindeki ADMIN_PASSWORD_HASH değişkenine yapıştır ve
 * düz metin ADMIN_PASSWORD satırını sil.
 */

import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('\n  ✖ Usage: npm run auth:hash -- "your-password"\n');
  process.exit(1);
}

if (password.length < 8) {
  console.error("\n  ✖ Password must be at least 8 characters.\n");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

console.log("\n  Add this to your .env:\n");
console.log(`  ADMIN_PASSWORD_HASH=${hash}\n`);
