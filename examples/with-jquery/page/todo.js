// deno-lint-ignore-file
function todo({ html, useAfter }) {
  useAfter(() => {
    $("#todoText").keyup((e) => {
      if (e.keyCode == 13) {
        const todo = $("#todoText").val();
        $("#todos").prepend(html`<li>${todo}</li>`);
        $("#todoText").val("");
      }
    });
  });
  return html`
    <div style="margin: 20px">
      <input id="todoText" placeholder="Enter Todo" />
      <ul id="todos"></ul>
    </div>
  `;
}
