// deno-lint-ignore-file
function about({ html }) {
  window.data = {
    title: "Welcome About",
  };
  return html`
    <div x-data="data">
      <h1 x-text="title"></h1>
    </div>
  `;
}
