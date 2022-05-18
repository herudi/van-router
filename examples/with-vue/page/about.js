// deno-lint-ignore-file
function about({ html, useVanilla }) {
  const { createApp } = Vue;
  useVanilla(() => {
    createApp({
      data() {
        return {
          title: "Welcome About",
        };
      },
    }).mount("#app");
  });
  return html`<h1>{{title}}</h1>`;
}
