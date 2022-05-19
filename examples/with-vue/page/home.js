// deno-lint-ignore-file
function home({ html, useAfter }) {
  useAfter(() =>
    Vue.createApp({
      data() {
        return {
          title: "Welcome Home",
        };
      },
    }).mount("#app")
  );
  return html`<h1>{{title}}</h1>`;
}
