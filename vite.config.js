import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * GitHub Pages serves project sites from https://<owner>.github.io/<repo>/,
 * so assets need a base of "/<repo>/". User and org sites (<owner>.github.io)
 * are served from the domain root and need "/".
 *
 * GITHUB_REPOSITORY is set automatically in Actions ("owner/repo"), so this
 * resolves correctly no matter what you name the repo, with no manual edit.
 * Locally it is unset and base falls back to "/".
 */
const repo = (process.env.GITHUB_REPOSITORY || "").split("/")[1] || "";
const inferred = !repo || repo.endsWith(".github.io") ? "/" : `/${repo}/`;
// BASE_PATH overrides the inference — the release workflow sets "./" so the
// zipped build works when served from any directory.
const base = process.env.BASE_PATH || inferred;

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
