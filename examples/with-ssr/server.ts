import router from "./public/router.js";
import { serveFile } from "https://deno.land/std@0.140.0/http/file_server.ts";
import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

const port = 8080;
const index = await Deno.readTextFile("./public/template.html");

await serve(async (request: Request) => {
  try {
    const path = new URL(request.url).pathname;
    return await serveFile(request, "./public/" + path);
  } catch (_e) { /* noop */ }
  const res = router.resolve({
    request: request,
    location: new URL(request.url),
    render: (elem: string) => {
      const html = index.replace("{{PAGE}}", elem);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
  });
  return res;
}, { port });
