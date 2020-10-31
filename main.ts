import { expressionParser } from "./math.ts";

function main() {
  const p = expressionParser();
  console.log(p("5+5+3+6"));
}

main();
