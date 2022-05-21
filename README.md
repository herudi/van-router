## Van Router

[![ci](https://github.com/herudi/van-router/workflows/ci/badge.svg)](https://github.com/herudi/van-router)
[![npm version](https://img.shields.io/badge/npm-0.6.0-blue.svg)](https://npmjs.org/package/van-router)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![download-url](https://img.shields.io/npm/dm/van-router.svg)](https://npmjs.org/package/van-router)
[![minzip](https://img.shields.io/bundlephobia/minzip/van-router)](https://github.com/herudi/van-router)

A small router middleware for vanilla-js.

## Features

- `Easy to use`. you can use pure js everywhere or combine with other framework
  like [Alpinejs](https://alpinejs.dev/), [React](https://reactjs.org/) etc.
- `Middleware`. does your application have authentication? you can use
  middleware.
- `Lazy-Load`. this router support laze-load js/controller.
- `SSR`. support SSR / Deno / Nodejs.

## Installation

### Browser

```html
<!-- non module -->
<script src="//unpkg.com/van-router@0.6.0"></script>

<!-- es module -->
<script type="module">
  import { createRouter } from "https://unpkg.com/van-router@0.6.0/index.esm.js";
  // code here
</script>
```

> This library transpile to ES3.

### Nodejs

```bash
npm i van-router
```

```js
const { createRouter } = require("van-router");
```

### Deno

```ts
import { createRouter } from "https://deno.land/x/van_router@0.6.0/mod.ts";
```

## Usage

### Example in the browser

```html
...
<body>
  <nav>
    <a href="/home" van-link>Home</a>
    <a href="/about" van-link>About</a>
  </nav>
  <div id="app"></div>
  <script>

    const { createRouter } = Van;

    const router = createRouter({ 
      render: (elem) => {
        document.getElementById("app").innerHTML = elem;
      }
    });

    router.add("/", () => {
      return `<h1>Hello Home</h1>`;
    });

    router.add("/about", () => {
      return `<h1>Hello About</h1>`;
    });

    addEventListener("load", () => {
      router.resolve();
    });
  </script>
</body>
...
```

> note : extension vscode for literal html
> [lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html).

```js
router.add("/", ({ html }) => {
  return html`<h1>Hello Home</h1>`;
});
```

### With hash

```js
...
// html
<nav>
  <a href="#/home" van-link>Home</a>
  <a href="#/about" van-link>About</a>
</nav>
...

// js
const router = createRouter({ 
  // set hash to true
  hash: true,
  render: (elem) => {...}
});
...
```

### Middleware

```js
...

const foo_midd = (ctx, next) => {
  ctx.foo = "foo";
  return next();
}
const bar_midd = (ctx, next) => {
  ctx.bar = "bar";
  return next();
}

// global middleware
router.use(foo_midd);

// inline middleware
router.add("/", bar_midd, ({ foo, bar }) => {
  return `<h1>${foo}${bar}</h1>`;
  // => foobar
});

...
```

### Lazy-load

/router.js

```js
...
router.add("/", ({ lazy }) => {
  return lazy("/controller/home.js");
});
...
```

/controller/home.js

```js
function home() {
  return `<h1>Hello Home</h1>`;
}
```

### Route Paths

Route

```js
router.add("/", (ctx) => {...});
// or
router.on("GET", "/", (ctx) => {...});
```

Example

```js
// simple path
router.add("/", (ctx) => {...});

// with parameter
router.add("/user/:id/:name", (ctx) => {...});

// with optional parameter
router.add("/user/:id/:name?", (ctx) => {...});

// with ext
router.add("/image/:filename.(jpg|png)", (ctx) => {...});

// wildcard
router.add("*", (ctx) => {...});
router.add("/user/*", (ctx) => {...});

// with regex
router.add(/.*noop$/, (ctx) => {...});
```

## Config

Config for VanRouter

```js
// types
type Config = {
  render?: (elem: any) => void;
  base?: string;
  hash?: boolean;
}

const router = createRouter(config);
```

### Config.render

Render configs.

```js
const render = (elem) => {
  document.getElementById("app").innerHTML = elem;
  // or with React
  // ReactDOM.render(elem, document.getElementById("app"));
};
const router = createRouter({ render });
```

### Config.base

Base path/url like `<base href="/myapp" />`. default to undefined.

### Config.hash

optional hash true/false. default to false.

## Context (ctx)

Is an utility based on object.

```js
router.add("/", (context) => {...})
```

### Context.route

```ts
type CtxRoute = {
  url: string;
  pathname: string;
  params: Record<string, any>;
  go(url: string, type?: string): void;
};
```

### Context.route.params

Object query parameter from path.

```js
router.add("/user/:userId", ({ route }) => {
  console.log(route.params);
  // => { userId: "123" }
  return ``;
});
```

### Context.route.pathname

```js
router.add("/user", ({ route }) => {
  console.log(route.pathname);
  // url => /user?name=john
  // pathname => /user
  return ``;
});
```

### Context.route.url

```js
router.add("/user", ({ route }) => {
  console.log(route.url);
  return ``;
});
```

### Context.route.go

Go to pathname (client only).

```js
router.add("/user", ({ route }) => {
  route.go("/home");
  return ``;
});
```

### Context.useAfter

Turn on client-side effect with `useAfter`.

why `useAfter` ? because execute code after rendering element/view.

```js
...
useAfter(() => {
  // code here
  return () => {
    // cleanup here
  }
})
...
```

Example `useAfter`

```js
router.add("/", ({ useAfter }) => {
  useAfter(() => {
    window.myClick = () => {
      alert("Hello World");
    };
    return () => {
      delete window.myClick;
    };
  });

  return `<button onclick="myClick()">Click Me</button>`;
});
```

### Context.lazy

Lazy load js/controller

/router.js

```js
...
router.add("/", ({ lazy }) => {
  return lazy("/controller/home.js");
});
...
```

/controller/home.js

```js
function home() {
  return `<h1>Hello Home</h1>`;
}
```

### Context.html

for vscode literal html syntax highlight
[lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html).

```js
router.add("/", ({ html }) => {
  return html`<h1>Hello World</h1>`;
});
```

### Context.useData

support client-side and server-side.

```js
router.add("/", ({ html, useData }) => {
  const data = useData(() => {
    return { name: "john" };
  });
  return html`<h1>${data.name}</h1>`;
});
```

### Context.setHead

set head support client-side and server-side.

```js
router.add("/", ({ html, setHead }) => {
  setHead(html`<title>Name John</title>`);

  return html`<h1>Name John</h1>`;
});
```

### Context.getHandler

Call handler in handler. (server-side only).
`getHandler(url: string, method?: string) => Promise<any>`.

> note : requires return object directly on handler.

```ts
router.add("/api/user/:name", ({ html, route }) => {
  return { name: route.params.name };
});

router.add("/", ({ html, getHandler }) => {
  const data = await getHandler("/api/user/john");
  return html`<h1>${data.name}</h1>`;
  // => <h1>john</h1>
});
```

### Other context

- Context.isServer
- Context.isHydrate
- Context.request (SSR only)
- Context.response (SSR only)

## Handle error & not found

### Handle 404 not found

```js
router.add("*", () => {
  return `<h1>404 not found</h1>`;
});
```

### Handle error

```js
router.add("/", (ctx) => {
  ctx.noop();
  return `<h1>Noop</h1>`;
});
router.onError((err, ctx) => {
  console.log(err);
  return `<h1>${err.message}</h1>`;
  // message => ctx.noop is not a function
});
```

## With React (jsx)

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { createRouter } from "van-router";

// example components
import Home from "./components/home";
import About from "./components/about";

const render = (component) => {
  ReactDOM.render(component, document.getElementById("app"));
};

const router = createRouter({ render });

router.add("/", () => {
  return <Home />;
});

router.add("/about", () => {
  return <About />;
});

router.resolve();
```

## With Nodejs (Server-Rendered)

```js
const { createRouter } = require("van-router");
const http = require("http");

const port = 8080;

const router = createRouter();

router.add("/", ({ html, setHead }) => {
  setHead(html`<title>Hello from node</title>`);
  return html`<h1>Hello From Node</h1>`;
});

http.createServer(async (request, response) => {
  const van = router.resolve({ request, response });
  const elem = await van.out();
  const head = van.head();
  if (typeof elem === "string") {
    response.setHeader("Content-Type", "text/html");
    response.end(`
      <html>
        <head>
          <link rel="icon" href="data:,">
          ${head}
        </head>
        <body>
          ${elem}
        </body>
      </html>
    `);
  }
}).listen(port);
```

## With Deno (Server-Rendered)

```ts
import { createRouter } from "https://deno.land/x/van_router@0.6.0/mod.ts";
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

const port = 8080;

const router = createRouter();

router.add("/", ({ html, setHead }) => {
  setHead(html`<title>Hello from deno</title>`);
  return html`<h1>Hello From Deno</h1>`;
});

await serve(async (request: Request) => {
  const van = router.resolve({ request });
  const elem = await van.out();
  const head = van.head();
  if (elem instanceof Response) return elem;
  return new Response(
    `
    <html>
      <head>
        <link rel="icon" href="data:,">
        ${head}
      </head>
      <body>
        ${elem}
      </body>
    </html>
  `,
    {
      headers: { "Content-Type": "text/html" },
    },
  );
}, { port });
```

> It's Fun Project :).
