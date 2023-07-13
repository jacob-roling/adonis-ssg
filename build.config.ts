import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["./src/index", "./src/commands"],
  outDir: "dist",
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
