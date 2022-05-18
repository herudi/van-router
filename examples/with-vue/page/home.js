// deno-lint-ignore-file
function home({ html, useVanilla }) {
  const { createApp } = Vue;
  useVanilla(() => {
    createApp({
      data() {
        return {
          title: "Welcome Home",
        };
      },
    }).mount("#app");
  });
  return html`<h1>{{title}}</h1>`;
}
