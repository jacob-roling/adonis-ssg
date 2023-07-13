# Adonis Static Site Generation (SSG)

Prerender routes to static HTML for AdonisJS enabling Adonis sites to follow the [Jamstack](https://jamstack.org/) architectural approach.

## Install

```
npm i adonis-ssg
yarn add adonis-ssg
pnpm add adonis-ssg
```

## Features

- Simply adds a `node ace prerender:routes` command
- Follows a similar prerendering pattern to [Astro](https://docs.astro.build/en/core-concepts/routing/#static-ssg-mode)
- Enables prerendering for dynamic routes
- Mix prerendered and non prerendered
- Application wide prerendering can be defined in one `getStaticPaths` function

## Usage

Create a function `getStaticPaths` and export it from any file. `getStaticPaths` will be used to determine what routes will be prerendered and provide parameters for dynamic paths.

```js
// ./start/routes.ts

// Define your routes as you would normally...

// Add
export function getStaticPaths() {
    return {
        // Routes you want prerendered
        // Eg. [/route_pattern]: null for a static route,
        // Eg. [/route_pattern_with_some/:parameter]: async () => { return [array of parameter objects]} for a dynamic route
    },
};
```

Add the file exporting `getStaticPaths` to `directories` in `.adonisrc.json` under the key `ssg`

```json
{
  "directories": {
    "ssg": "start/routes"
  }
}
```

Run `node ace configure adonis-ssg` to add adonis-ssg commands to `.adonisrc.json`

It will make the following change.

```json
{
  "commands": ["adonis-ssg/dist/index.cjs"]
}
```

Finally call `prerender:routes`. By default this will render your HTML files to the public directory as specified in your `.adonisrc.json` although you can change this with the `--output` or `-o` flag.

```
node ace prerender:routes
```

## Examples

Example prerendered "home", "todo" and "todos/:id" pages with a dynamic "about" page.

```js
// ./start/routes.ts
import Route from "@ioc:Adonis/Core/Route";
import Todo from "./app/Models/Todo";

Route.get("/", async ({ view }) => {
  return view.render("home");
});

Route.get("/about", async ({ view }) => {
  return view.render("about");
});

Route.get("todos", "TodosController.getAll");
Route.get("todos/:id", "TodosController.getById");

export function getStaticPaths() {
  return {
    "/": null,
    "/todos": null,
    "/todos/:id": async () => {
      const todos = await Todo.all();
      return todos.map((todo) => ({
        params: {
          id: todo.id,
        },
      }));
    },
    // We ignore "/about" because we dont want to prerender it
  };
}
```

Add prerender to build command to `package.json`

```json
{
  "scripts": {
    "build": "node ace prerender:routes && node ace build --production"
  }
}
```
