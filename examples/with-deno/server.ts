import { VanRouter } from "../../index.ts";
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

const port = 8080;

const router = new VanRouter();

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
