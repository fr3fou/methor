import { evalExp, expression } from "./math.ts";

const p = expression();

async function main() {
  while (true) {
    const input = await prompt("> ");
    const out = p(input);
    if (out.length == 0) {
      throw new Error("invalid expression");
    }
    console.log(evalExp(out[0][0]));
  }
}

async function prompt(message: string) {
  const buf = new Uint8Array(1024);
  await Deno.stdout.write(new TextEncoder().encode(message));
  const n = <number> await Deno.stdin.read(buf);
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

if (Deno.args.length < 1) {
  throw new Error(
    "not enough args, either provide 'repl' or a math expression as an argument",
  );
}

if (Deno.args[0] == "repl") {
  main();
} else {
  const out = p(Deno.args[0]);
  if (out.length == 0) {
    throw new Error("invalid expression");
  }
  console.log(evalExp(out[0][0]));
}
