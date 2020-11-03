import { evalExp, expression } from "./math.ts";

async function main() {
  const p = expression();
  while (true) {
    const input = await prompt("> ");
    console.log(evalExp(p(input)[0][0]));
  }
}

async function prompt(message: string) {
  const buf = new Uint8Array(1024);
  await Deno.stdout.write(new TextEncoder().encode(message));
  const n = <number>await Deno.stdin.read(buf);
  return new TextDecoder().decode(buf.subarray(0, n)).trim();
}

main();
