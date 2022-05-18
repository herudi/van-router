// deno-lint-ignore-file
function home({ html }) {
  window.data = {
    title: "Welcome Home",
  };
  return html`
    <div x-data="data">
      <h1 x-text="title"></h1>
    </div>
  `;
}
