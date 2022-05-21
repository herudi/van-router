import router from "./public/router.js";
import { serveFile } from "https://deno.land/std@0.140.0/http/file_server.ts";
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

const port = 8080;

await serve(async (request: Request) => {
  // static file
  try {
    const path = new URL(request.url).pathname;
    return await serveFile(request, "./public/" + path);
  } catch (_e) { /* noop */ }

  // response
  const van = router.resolve({ request });
  const page = await van.out();
  const data = await van.data();
  const head = van.head();
  if (page instanceof Response) return page;
  return new Response(
    `<html>
      <head>
        <link rel="icon" href="data:,">
        ${head}
      </head>
      <body>
        <nav>
          <a href="/" van-link>Home</a>
          <a href="/todo" van-link>Todo</a>
        </nav>
        <div id="app">${page}</div>
        <script type="module">
          import router from "./router.js";
          window.__VAN_DATA__ = ${JSON.stringify(data)};
          addEventListener("load", () => {
            router.resolve();
          });
        </script>
      </body>
    </html>`,
    {
      headers: { "Content-Type": "text/html" },
    },
  );
}, { port });
