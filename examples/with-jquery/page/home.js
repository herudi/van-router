// deno-lint-ignore-file
function home({ html, useAfter }) {
  useAfter(() => {
    $("#title").text("Welcome Home");
  });
  return html`<h1 id="title"></h1>`;
}
