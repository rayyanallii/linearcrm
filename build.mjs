import fs from "node:fs";
import { build } from "esbuild";

const experientialApiKey = (process.env.EXPLABS_API_KEY || "").trim();
const experientialBaseUrl =
  process.env.EXPERIENTIAL_BASE_URL || "https://api.experientiallabs.ai/v1";
const experientialModel = process.env.EXPERIENTIAL_MODEL || "clef-flash";
const experientialChatModel =
  process.env.EXPERIENTIAL_CHAT_MODEL || "gpt-6-luna";

fs.mkdirSync("public", { recursive: true });
fs.mkdirSync("public/brand", { recursive: true });
for (const name of [
  "brand-linear-crm-256.png",
  "brand-linear-crm-ink.png",
  "brand-linear-crm-purple.png",
  "brand-linear-crm-white.png",
]) {
  fs.copyFileSync(`local/brand/${name}`, `public/brand/${name}`);
}
fs.writeFileSync(
  "public/env.js",
  `globalThis.LINEAR_CRM_CONFIG = Object.freeze(${JSON.stringify(
    {
      experientialApiKey,
      experientialBaseUrl,
      experientialModel,
      experientialChatModel,
    },
    null,
    2,
  )});\n`,
);

if (!experientialApiKey) {
  console.warn(
    "EXPLABS_API_KEY is not set. The Assistant will show setup instructions until the app is rebuilt with the key.",
  );
}

const shared = {
  bundle: true,
  minify: true,
  jsx: "automatic",
  assetNames: "assets/[name]-[hash]",
  loader: { ".woff2": "file", ".woff": "file", ".svg": "file", ".png": "file" },
  define: { "process.env.NODE_ENV": '"production"' },
  legalComments: "linked",
  logLevel: "info",
};

await build({
  ...shared,
  entryPoints: ["local/Workspace.jsx"],
  outfile: "public/linear.js",
});

await build({
  ...shared,
  entryPoints: ["local/Landing.jsx"],
  outfile: "public/landing.js",
});
