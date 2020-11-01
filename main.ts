import { expression, Precedence } from "./math.ts";

function main() {
  const p = expression(Precedence.Lowest);
  console.log(JSON.stringify(p("5+8*3")[0][0], null, "  "));
}

main();
