const router = createRouter({
  render: (elem) => {
    document.getElementById("app").innerHTML = elem;
  },
  hash: true,
});

router.add("/", ({ lazy }) => lazy("/page/home.js"));
router.add("/todo", ({ lazy }) => lazy("/page/todo.js"));

addEventListener("load", () => {
  router.resolve();
});
