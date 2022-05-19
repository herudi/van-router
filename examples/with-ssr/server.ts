import router from "./public/router.js";
import staticFiles from "https://deno.land/x/static_files@1.1.6/mod.ts";
import { NHttp } from "https://deno.land/x/nhttp@1.1.11/mod.ts";

const port = 8080;

new NHttp()
  .use("/assets", staticFiles("public"))
  .get("*", async ({ request, response }) => {
    const index = await Deno.readTextFile("./public/index.html");
    return router.resolve({
      request: request,
      location: new URL(request.url),
      render: (elem: string) => {
        response.type("text/html");
        return index.replace("{{PAGE}}", elem);
      },
    });
  })
  .listen(port);
