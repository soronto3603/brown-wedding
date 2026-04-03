export { default } from "./main.mjs";
export const config = {
  name: "server handler",
  generator: "nuxt@3.21.2",
  path: "/*",
  nodeBundler: "none",
  includedFiles: ["**"],
  excludedPath: ["/.netlify/*","/_nuxt/*"],
  preferStatic: true,
};