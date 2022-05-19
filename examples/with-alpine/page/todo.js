// deno-lint-ignore-file
function todo({ html, useAfter }) {
  useAfter(() => {
    Alpine.data("my_todo_data", () => ({
      todos: [],
      todoText: "",
      addTodo() {
        this.todos.unshift(this.todoText);
        this.todoText = "";
      },
    }));
  });
  return html`
    <div x-data="my_todo_data" style="margin: 20px">
      <input x-model="todoText" placeholder="Enter Todo" @keydown.enter="addTodo" />
      <ul>
        <template x-for="todo in todos">
          <li x-text="todo"></li>
        </template>
      </ul>
    </div>
  `;
}
