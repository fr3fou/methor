import { expression } from "./math.ts";

function main() {
  const p = expression();
  console.log(JSON.stringify(p("2+5*(8+3)")[0][0], null, "  "));
}

main();
