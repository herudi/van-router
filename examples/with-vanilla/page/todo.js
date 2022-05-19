// deno-lint-ignore-file
function todo({ html, useAfter }) {
  useAfter(() => {
    const $ = (v) => document.querySelector(v);
    const todos = [];
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
      <ul id="todos"></ul>
    </div>
  `;
}
