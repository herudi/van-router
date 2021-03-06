// const { createRouter } = require("van-router");
const { createRouter } = require("../../npm/index.node.js");
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
