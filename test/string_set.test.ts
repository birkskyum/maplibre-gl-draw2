import { test } from "vitest";
import {assert, assertEquals, assertNotStrictEquals, assertThrows} from "@std/assert";
import { StringSet } from "../src/lib/string_set.ts";

test("StringSet constructor and API", () => {
  const set = new StringSet();
  assertEquals(set.values(), [], "empty by default");
  assertEquals(
    Object.keys(set).filter((k) => k[0] !== "_").length,
    0,
    "no unexpected properties",
  );
  // Methods
  assertEquals(typeof StringSet.prototype.add, "function", "exposes set.add");
  assertEquals(
    typeof StringSet.prototype.delete,
    "function",
    "exposes set.delete",
  );
  assertEquals(typeof StringSet.prototype.has, "function", "exposes set.has");
  assertEquals(
    typeof StringSet.prototype.values,
    "function",
    "exposes set.values",
  );
  assertEquals(
    typeof StringSet.prototype.clear,
    "function",
    "exposes set.clear",
  );
  assertEquals(
    Object.getOwnPropertyNames(StringSet.prototype).filter((k) => k[0] !== "_")
      .length,
    6,
    "no unexpected methods",
  );

  const populatedSet = new StringSet(["a", 4, "b"]);
  assertEquals(
    populatedSet.values(),
    ["a", 4, "b"],
    "populated by constructor arg",
  );
});

test("StringSet#add", () => {
  const set = new StringSet();
  assertEquals(set.values(), []);
  set.add("a");
  assertEquals(set.values(), ["a"]);
  set.add("b");
  assertEquals(set.values(), ["a", "b"]);
  set.add("a");
  assertEquals(set.values(), ["a", "b"]);
  set.add(3);
  assertEquals(set.values(), ["a", "b", 3]);
});

test("StringSet#delete", () => {
  const subject = ["a", "b", 2];
  const set = new StringSet(subject);
  set.delete("a");
  assertEquals(set.values(), ["b", 2]);
  set.delete("a");
  assertEquals(set.values(), ["b", 2]);
  set.delete();
  assertEquals(set.values(), ["b", 2]);
  set.delete("b");
  assertEquals(set.values(), [2]);
  set.delete(2);
  assertEquals(set.values(), []);
  assertEquals(subject, ["a", "b", 2], "source array not mutated");
});

test("StringSet#has", () => {
  const set = new StringSet(["a", "b", 2]);
  assertEquals(set.has("a"), true);
  assertEquals(set.has("b"), true);
  assertEquals(set.has(2), true);
  assertEquals(set.has("c"), false);
  assertEquals(set.has(4), false);
});

test("StringSet#values", () => {
  const subject = ["a", "b"];
  const set = new StringSet(subject);
  assertEquals(set.values(), ["a", "b"]);
  assertNotStrictEquals(
    set.values(),
    subject,
    "array is copied, so source array is not mutable",
  );
});

test("StringSet#clear", () => {
  const set = new StringSet(["a", "b"]);
  set.clear();
  assertEquals(set.values(), []);
});
