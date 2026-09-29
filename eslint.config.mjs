import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Sisa folder build. Di D: (FAT32) folder "types" di dalamnya rusak dan
    // tidak bisa dihapus sampai chkdsk /F dijalankan, jadi diabaikan dulu.
    ".next-build/**",
    // File tooling CommonJS (bukan kode aplikasi). Memakai require() itu wajar,
    // jadi tidak perlu ikut aturan lint TypeScript/ESM aplikasi.
    ".opencode/**",
    "jest.config.js",
    "jest.setup.ts",
  ]),
]);

export default eslintConfig;
