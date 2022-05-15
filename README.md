## Van Router

A small (1kb gzipped) router middleware for CSA (client-side app).

## Installation

### Browser

```html
<!-- non module -->
<script src="//unpkg.com/van-router@0.0.4"></script>

<!-- es module -->
<script type="module">
  import { VanRouter } from "https://unpkg.com/van-router@0.0.4/index.esm.js";
  // code here
</script>
```

### Nodejs

```bash
npm i van-router
```

### Deno

```ts
import { VanRouter } from "https://deno.land/x/van_router@0.0.4/mod.ts";
```

## Usage

### Browser

```html
...
<body>
  <nav>
    <a href="#/home" u-link>Home</a>
    <a href="#/about" u-link>About</a>
  </nav>
  <div id="app"></div>
  <script>
    const render = (html) => {
      document.getElementById("app").innerHTML = html;
    }
    const router = new VanRouter({ render });

    router.add("/", () => {
      return `<h1>Hello Home</h1>`;
    });

    router.add("/about", ({ html }) => {
      return html`<h1>Hello About</h1>`;
    });

    router.resolve();
  </script>
</body>
...
```

### React (jsx)

```jsx
import React from "react";
import ReactDOM from "react-dom";
import { VanRouter } from "van-router";

const render = (elem) => {
  ReactDOM.render(elem, document.getElementById("app"));
};
const router = new VanRouter({ render });

router.add("/", () => {
  return <h1>Hello Home</h1>;
});

router.add("/about", () => {
  return <h1>Hello About</h1>;
});

router.resolve();
```
### Middleware

```js
...
const router = new VanRouter({ render });
router.use((ctx, next) => {
  ctx.user = "van";
  next();
});
router.add("/", (ctx) => {
  if (!ctx.user) return ctx.go("#/login");
  return `Welcome Dashboard`;
});
...
```

> It's Fun Project :).
