import { assertEquals } from "https://deno.land/std@0.139.0/testing/asserts.ts";
import { VanRouter } from "./index.ts";

const render = () => {};

Deno.test("router verb test", async (t) => {
  const van = new VanRouter({ render, base: "/app" });
  van.add("/user", () => "user");
  van.add("/user/:id", () => "user_id");
  van.add(/.*ball$/, () => "football");
  van.add("*", () => "all");

  await t.step("/user", () => {
    const m = van.match("/app/user");
    assertEquals(m.fns.length, 1);
    assertEquals(m.params, {});
  });
  await t.step("/user/:id", () => {
    const m = van.match("/app/user/123");
    assertEquals(m.fns.length, 1);
    assertEquals(m.params, { id: "123" });
  });
  await t.step("regex /football", () => {
    const m = van.match("/app/football");
    assertEquals(m.fns.length, 1);
    assertEquals(m.params, {});
  });
  await t.step("exact /all/all", () => {
    const m = van.match("/app/all/all");
    assertEquals(m.fns.length, 1);
    assertEquals(m.params, {});
  });
});

// more test soon
