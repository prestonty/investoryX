// eslint.config.ts (flat config, ESM)
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import type { Linter } from "eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use FlatCompat to reuse legacy shareable configs like "next/core-web-vitals"
const compat = new FlatCompat({ baseDirectory: __dirname });

const config: Linter.FlatConfig[] = [
    // Pull in Next.js' recommended rules (works for TS/JS)
    ...compat.extends("next/core-web-vitals"),

    // Optional: ignore build output & deps
    { ignores: ["**/.next/**", "**/node_modules/**"] },
];

export default config;
