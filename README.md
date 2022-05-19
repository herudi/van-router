## Van Router

[![ci](https://github.com/herudi/van-router/workflows/ci/badge.svg)](https://github.com/herudi/van-router)
[![npm version](https://img.shields.io/badge/npm-0.5.4-blue.svg)](https://npmjs.org/package/van-router)
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)
[![download-url](https://img.shields.io/npm/dm/van-router.svg)](https://npmjs.org/package/van-router)
[![minzip](https://img.shields.io/bundlephobia/minzip/van-router?style=plastic)](https://github.com/herudi/van-router)

A small (1kb gzipped) router middleware for vanilla-js.

## Features

- `Easy to use`. you can use pure js everywhere or combine with other framework
  like [Alpinejs](https://alpinejs.dev/), [React](https://reactjs.org/) etc.
- `Small`. this library is small (just 1kb gzipped).
- `Middleware`. does your application have authentication? you can use
  middleware.
- `Lazy-Load`. this router support laze-load js/controller.

## Installation

### Browser

```html
<!-- non module -->
<script src="//unpkg.com/van-router@0.5.4"></script>

<!-- es module -->
<script type="module">
  import { VanRouter } from "https://unpkg.com/van-router@0.5.4/index.esm.js";
  // code here
</script>
```

> cause transpile to ES3, old browser is supported.

### Nodejs

```bash
npm i van-router
```

### Deno

```ts
import { VanRouter } from "https://deno.land/x/van_router@0.5.4/mod.ts";
```

## Usage

### Example

```html
...
<body>
  <nav>
    <a href="/home" van-link>Home</a>
    <a href="/about" van-link>About</a>
  </nav>
  <div id="app"></div>
  <script>
    // initial router.
    const router = new VanRouter({ 
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

    router.resolve();
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
const router = new VanRouter({ 
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
  next();
}
const bar_midd = (ctx, next) => {
  ctx.bar = "bar";
  next();
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

### Interaction

Interaction with native vanilla or other framework using `useAfter`.

why `useAfter` ? because execute code after rendering element/view.

```js
...
// example simple counter app
router.add("/", ({ useAfter, html }) => {

  useAfter(() => {
    const $ = (v) => document.querySelector(v);

    const onCounter = (numb) => {
      $("#counter").innerText = parseInt($("#counter").innerText) + numb;
    }

    $("#btn-plus").onclick = () => onCounter(1);
    $("#btn-min").onclick = () => onCounter(-1);

    // cleanup here if needed.
    // return () => {...}
  });

  return html`
    <button id="btn-plus">+</button>
    <button id="btn-min">-</button>
    <label id="counter">0</label>
  `;
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

// without path.
router.add(void 0, (ctx) => {...});
```

## Config

Config for VanRouter

```js
// types
type Config = {
  render: (elem: any) => void;
  base?: string;
  hash?: boolean;
}

const router = new VanRouter(config);
```

### Config.render

Render configs.

```js
const render = (elem) => {
  document.getElementById("app").innerHTML = elem;
  // or with React
  // ReactDOM.render(elem, document.getElementById("app"));
};
const router = new VanRouter({ render });
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

### Context.params

Object query parameter from path.

```js
router.add("/user/:userId", (ctx) => {
  console.log(ctx.params);
  // => { userId: "123" }
  return ``;
});
```

### Context.useAfter

Interaction with native vanilla or other framework using `useAfter`.

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

### Context.go

go to state/path.

```js
router.add("/", (ctx) => {
  ctx.go("/home");
});
```

### Context.html

for vscode literal html syntax highlight
[lit-html](https://marketplace.visualstudio.com/items?itemName=bierner.lit-html).

```js
router.add("/", ({ html }) => {
  return html`<h1>Hello World</h1>`;
});
```

### Other context

- Context.pathname
- Context.url

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
import { VanRouter } from "van-router";

// example components
import Home from "./components/home";
import About from "./components/about";

const render = (component) => {
  ReactDOM.render(component, document.getElementById("app"));
};

const router = new VanRouter({ render });

router.add("/", () => {
  return <Home />;
});

router.add("/about", () => {
  return <About />;
});

router.resolve();
```

> It's Fun Project :).
