## Van Router

A small (1kb gzipped) router middleware for vanilla-js.

## Features

- `Easy to use`. you can use pure js everywhere or combine with other framework
  like [Alpinejs](https://alpinejs.dev/), [React](https://reactjs.org/) etc.
- `Small`. this library is small (just 1kb gzipped and 250B transfered).
- `Middleware`. does your application have authentication? you can use
  middleware.
- `Lazy-Load`. this router support laze-load js/controller.

## Installation

### Browser

```html
<!-- non module -->
<script src="//unpkg.com/van-router@0.4.5"></script>

<!-- es module -->
<script type="module">
  import { VanRouter } from "https://unpkg.com/van-router@0.4.5/index.esm.js";
  // code here
</script>
```

### Nodejs

```bash
npm i van-router
```

### Deno

```ts
import { VanRouter } from "https://deno.land/x/van_router@0.4.5/mod.ts";
```

## Usage

### Example

```html
...
<body>
  <nav>
    <a href="#/home" u-link>Home</a>
    <a href="#/about" u-link>About</a>
  </nav>
  <div id="app"></div>
  <script>
    const render = (elem) => {
      document.getElementById("app").innerHTML = elem;
    }
    const router = new VanRouter({ render });

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

use mount for javascript to document interaction or DOM manipulation.

```js
...
router.add("/", ({ mount }) => {

  mount(() => {
    const btn = document.getElementById("btn");
    btn.onclick = () => {
      alert("Hello from button");
    };
  });

  return `<button id="btn">Click Me</button>`;
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

## Config

Config for VanRouter

```js
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

Base path/url like `<base href="/myapp" />`.

```js
const router = new VanRouter({ base: "/myfolder" });
```

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

### Context.mount

use mount for javascript to document interaction or DOM manipulation.

```js
router.add("/", ({ mount }) => {
  mount(() => {
    const btn = document.getElementById("btn");
    btn.onclick = () => {
      alert("Hello from button");
    };
  });

  return `<button id="btn">Click Me</button>`;
});
```

### Context.unmount

use unmount for cleanup listener or global variable.

```js
router.add("/", ({ mount, unmount }) => {
  mount(() => {
    window.myClick = () => {
      alert("hello from global window");
    };
  });

  unmount(() => {
    delete window.myClick;
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
  ctx.go("#/home");
  // or without hash
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
