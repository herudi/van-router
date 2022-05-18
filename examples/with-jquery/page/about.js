// deno-lint-ignore-file
function about({ html, useVanilla }) {
  useVanilla(() => {
    $("#title").text("Welcome About");
  });
  return html`<h1 id="title"></h1>`;
}
