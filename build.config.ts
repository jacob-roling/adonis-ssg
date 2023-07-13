import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: [
    "./src/index",
    {
      builder: "mkdist",
      input: "./src/commands/",
      outDir: "./dist/commands",
    },
  ],
  outDir: "dist",
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
