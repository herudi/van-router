export default async function todo({ html, useAfter, setHead, useData }) {
  const data = await useData(async () => {
    const res = await fetch(
      "https://jsonplaceholder.typicode.com/todos?_limit=10",
    );
    const todos = (await res.json()).map((o) => o.title);

    return { todos };
  });
  setHead(html`<title>Hello Todo</title>`);
  const todos = data.todos || [];

  const todos_template = () =>
    todos.map((todo) => html`<li>${todo}</li>`).join("");

  useAfter(() => {
    const $ = (v) => document.querySelector(v);
    $("#todoText").onkeydown = (e) => {
      if (e.keyCode === 13) {
        todos.unshift($("#todoText").value);
        $("#todos").innerHTML = todos_template();
        $("#todoText").value = "";
      }
    };
  });
  return html`
    <div style="margin: 20px">
      <input id="todoText" placeholder="Enter Todo" />
      <ul id="todos">${todos_template()}</ul>
    </div>
  `;
}
