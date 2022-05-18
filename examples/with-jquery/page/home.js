// deno-lint-ignore-file
function home({ html, useVanilla }) {
  useVanilla(() => {
    $("#title").text("Welcome Home");
  });
  return html`<h1 id="title"></h1>`;
}
