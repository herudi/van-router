import { createRouter } from "https://unpkg.com/van-router@0.6.0/index.esm.js";
import home from "./page/home.js";
import todo from "./page/todo.js";

const router = createRouter({
  render: (elem) => {
    document.getElementById("app").innerHTML = elem;
  },
});

router.add("/", home);
router.add("/todo", todo);

export default router;
