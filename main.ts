import { evalExp, expression } from "./math.ts";

function main() {
  const p = expression();
  console.log(evalExp(p("2 +   5  * ( 8+   3  )")[0][0]));
}

main();
