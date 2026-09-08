// Lets `node --experimental-strip-types` load the app's lib modules, which use
// Next.js-style extensionless relative imports (`./trade-grouper`). Test-harness
// plumbing only — the app itself is bundled by Next and needs none of this.
//   node --import ./scripts/review/ts-resolve.mjs --experimental-strip-types <script>
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      try {
        const url = new URL(specifier + ".ts", context.parentURL);
        if (existsSync(fileURLToPath(url))) return next(specifier + ".ts", context);
      } catch { /* fall through to the default resolver */ }
    }
    return next(specifier, context);
  },
});
