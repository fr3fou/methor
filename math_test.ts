import { assertEquals } from "https://deno.land/std@0.77.0/testing/asserts.ts";
import { evalExp, expression } from "./math.ts";

const table = [
  { input: "1+3", expected: 4 },
  { input: "5", expected: 5 },
  { input: "10", expected: 10 },
  { input: "-5", expected: -5 },
  { input: "-10", expected: -10 },
  { input: "5 + 5 + 5 + 5 - 10", expected: 10 },
  { input: "2 * 2 * 2 * 2 * 2", expected: 32 },
  { input: "-50 + 100 + -50", expected: 0 },
  { input: "5 * 2 + 10", expected: 20 },
  { input: "5 + 2 * 10", expected: 25 },
  { input: "20 + 2 * -10", expected: 0 },
  { input: "50 / 2 * 2 + 10", expected: 60 },
  { input: "2 * (5 + 10)", expected: 30 },
  { input: "3 * 3 * 3 + 10", expected: 37 },
  { input: "3 * (3 * 3) + 10", expected: 37 },
  { input: "(5 + 10 * 2 + 15 / 3) * 2 + -10", expected: 50 },
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
