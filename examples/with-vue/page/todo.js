// deno-lint-ignore-file
function todo({ html, useAfter }) {
  useAfter(() =>
    Vue.createApp({
      data() {
        return {
          todos: [],
          todoText: "",
        };
      },
      methods: {
        addTodo() {
          this.todos.unshift(this.todoText);
          this.todoText = "";
        },
      },
    }).mount("#app")
  );
  return html`
    <div style="margin: 20px">
      <input v-model="todoText" placeholder="Enter Todo" @keyup.enter="addTodo" />
      <ul><li v-for="todo in todos">{{todo}}</li></ul>
    </div>
  `;
}
