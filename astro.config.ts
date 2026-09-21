import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import remarkMermaid from "./src/plugins/remark-mermaid.js";
import config from "./astro-paper.config";

/** @param {string | undefined} url */
function normalizeSite(url: string | undefined) {
  if (!url) {
    return undefined;
  }

  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;
}

const isPreviewDeployment =
  Boolean(process.env.CF_PAGES_BRANCH) && process.env.CF_PAGES_BRANCH !== "main";

const site =
  normalizeSite(process.env.SITE_URL) ??
  (isPreviewDeployment ? normalizeSite(process.env.CF_PAGES_URL) : undefined) ??
  config.site.url;

export default defineConfig({
  site,
  integrations: [
    mdx(),
    sitemap({
      filter: page => {
        if (config.features?.showArchives === false && page.endsWith("/archives/")) {
          return false;
        }
        if (/\/posts\/\d+\/$/.test(page) || /\/tags\/[^/]+\/\d+\/$/.test(page)) {
          return false;
        }
        return true;
      },
    }),
  ],
  i18n: {
    locales: ["zh", "en"],
    defaultLocale: "zh",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
        remarkMermaid,
      ],
      rehypePlugins: [rehypeCallouts],
    }),
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
