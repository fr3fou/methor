import {
  bind,
  digit,
  many,
  Parser,
  result,
} from "https://raw.githubusercontent.com/fr3fou/djena/master/parse.ts";

interface Expression {
  expressionNode(): void;
}

class InfixExpression implements Expression {
  constructor(
    readonly operator: Operator,
    readonly lhs: Expression,
    readonly rhs: Expression
  ) {}

  expressionNode() {}
}

class Integer implements Expression {
  constructor(readonly value: number) {}
  expressionNode(): void {}
}

type Operator = "+" | "-" | "*" | "/";

export function integerParser(): Parser<Integer> {
  return bind(many(digit()), (v) => {
    return result(new Integer(Number(v.join(""))));
  });
}
