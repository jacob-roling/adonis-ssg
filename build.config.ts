import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    // default
    "./src/index",
    // mkdist builder transpiles file-to-file keeping original sources structure
    {
      builder: "mkdist",
      input: "./src/commands",
      outDir: "./dist/commands",
    },
  ],
  outDir: "dist",
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
