import {
  BaseCommand,
  HttpContext,
  flags,
} from "@adonisjs/core/build/standalone";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

export default class Prerender extends BaseCommand {
  public static commandName = "prerender:routes";

  public static description = "Prerender routes";

  public static settings = {
    loadApp: true,
    stayAlive: false,
  };

  // @flags.string({
  //   alias: "o",
  //   description:
  //     "Output directory relative to project base path. Defaults to public path.",
  // })
  public output: string;

  private ensureDirectoryExistence(filePath: string) {
    let dirname = path.dirname(filePath);
    if (existsSync(dirname)) {
      return true;
    }
    this.ensureDirectoryExistence(dirname);
    mkdirSync(dirname);
  }

  private async writeRoute(path: string, ctx: HttpContext, handler: any) {
    await handler(ctx);
    const html = ctx.response.getBody();
    this.ensureDirectoryExistence(path);
    writeFileSync(path, html);
  }

  public async run() {
    if (!this.output) {
      this.output = this.application.directoriesMap.get("public") as any;
    }

    const { getStaticPaths } = await import(
      this.application.makePath(
        this.application.directoriesMap.get("staticPaths") as any
      ) as any
    );

    const staticPaths = getStaticPaths();

    const Router = this.application.container.use("Adonis/Core/Route");
    Router.commit();

    const routes = Router.toJSON().root.filter(
      ({ pattern, methods }) =>
        !pattern.includes("*") &&
        methods.includes("GET") &&
        Object.keys(staticPaths).includes(pattern.slice(1))
    );

    const HttpContext = this.application.container.use(
      "Adonis/Core/HttpContext"
    );

    await Promise.all(
      routes.map(async (route) => {
        const { pattern, meta } = route;
        const { params } = route as any;
        if (params.length > 0) {
          const paths = await staticPaths[pattern.slice(1)]();

          for (let i = 0; i < paths.length; i++) {
            const ctx = HttpContext.create(pattern, paths[i].params);
            ctx.route = route as any;
            let path = pattern.replace(
              `:${params[0]}`,
              paths[i].params[params[0]]
            );
            for (let j = 1; j < params.length; j++) {
              path = pattern.replace(
                `:${params[j]}`,
                paths[i].params[params[j]]
              );
            }
            this.logger.info(`Prerendering ${path}`);
            await this.writeRoute(
              this.application.makePath(this.output, path, "index.html"),
              ctx,
              meta.finalHandler
            );
            return Promise.resolve(() => {});
          }
        }
        const ctx = HttpContext.create(pattern, new Map());
        ctx.route = route as any;
        await this.writeRoute(
          this.application.makePath(this.output, pattern, "index.html"),
          ctx,
          meta.finalHandler
        );
        return Promise.resolve(() => {});
      })
    );
  }
}
