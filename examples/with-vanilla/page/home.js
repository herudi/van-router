// deno-lint-ignore-file
function home({ html, useAfter }) {
  useAfter(() => {
    document.querySelector("#title").innerText = "Welcome Home";
  });
  return html`<h1 id="title"></h1>`;
}
