import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";
import { evalExp, expression } from "./math.ts";

const table = [
  {
    input: "1+3",
    expected: 4,
  },
];

const mathParser = expression();

table.forEach((v) =>
  Deno.test(v.input, () => {
    const output = mathParser(v.input);
    const tree = output[0][0];
    const val = evalExp(tree);
    assertEquals(val, v.expected);
  })
);
