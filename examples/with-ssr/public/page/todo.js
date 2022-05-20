export default async function todo({ html, useAfter, useSSR }) {
  const data = await useSSR({
    head: html`<title>Hello Todo</title>`,
    data: async () => {
      const res = await fetch(
        "https://jsonplaceholder.typicode.com/todos?_limit=10",
      );
      const todos = (await res.json()).map((o) => o.title);
      return { todos };
    },
  });

  const todos = data.todos || [];

  useAfter(() => {
    const $ = (v) => document.querySelector(v);
    $("#todoText").onkeydown = (e) => {
      if (e.keyCode === 13) {
        todos.unshift($("#todoText").value);
        $("#todos").innerHTML = todos.map((todo) => html`<li>${todo}</li>`)
          .join("");
        $("#todoText").value = "";
      }
    };
  });
  return html`
    <div style="margin: 20px">
      <input id="todoText" placeholder="Enter Todo" />
      <ul id="todos">${
    todos.map((todo) => html`<li>${todo}</li>`).join("")
  }</ul>
    </div>
  `;
}
