// deno-lint-ignore-file
function home({ html, useAfter }) {
  useAfter(() => {
    Alpine.data("my_home_data", () => ({
      title: "Welcome Home",
    }));
  });
  return html`
    <div x-data="my_home_data">
      <h1 x-text="title"></h1>
    </div>
  `;
}
