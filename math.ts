import {
  bind,
  charP,
  digit,
  either,
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

export const enum Precedence {
  Lowest = 0,
  Sum = 1,
  Product = 2,
}

const precedences: { [key in Operator]: Precedence } = {
  "+": Precedence.Sum,
  "-": Precedence.Sum,
  "/": Precedence.Product,
  "*": Precedence.Product,
};

export function integer(): Parser<Integer> {
  return bind(many(digit()), (v) => result(new Integer(Number(v.join("")))));
}

export function operator(): Parser<Operator> {
  return either(
    charP("+"),
    either(charP("-"), either(charP("*"), charP("/")))
  ) as Parser<Operator>;
}

export function infixExpression(lhs: Expression): Parser<InfixExpression> {
  return bind(operator(), (op) =>
    bind(expression(precedences[op]), (rhs) =>
      result(new InfixExpression(op, lhs, rhs))
    )
  );
}

export function expression(curr: Precedence): Parser<Expression> {
  return either(
    bind(integer(), (lhs) => {
      return (input: string): [Expression, string][] => {
        const op = operator();
        const out = op(input);
        if (out.length === 0) {
          return [];
        }
        if (curr < precedences[out[0][0]]) {
          return infixExpression(lhs)(input);
        }

        return [[lhs, input]];
      };
    }),
    integer()
  );
}
