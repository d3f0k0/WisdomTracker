// @ts-check
import { defineConfig } from "astro/config";
import { resolve } from "path";
import svelte from "@astrojs/svelte";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  adapter: cloudflare(),
  output: "server",
  vite: {
    resolve: {
      alias: {
        "$lib": resolve("./src/lib"),
        "$utils": resolve("./src/utils"),
      },
    },
  },
});
