const router = new VanRouter({
  render: (elem) => {
    document.getElementById("app").innerHTML = elem;
  },
  hash: true,
});

router.add("/", ({ lazy }) => lazy("/page/home.js"));
router.add("/about", ({ lazy }) => lazy("/page/about.js"));
router.resolve();
