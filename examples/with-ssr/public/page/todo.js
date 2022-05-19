export default function todo({ html, useAfter }) {
  // default todos
  const todos = ["Banana", "Apple"];

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
