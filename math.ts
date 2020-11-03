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

function terminal(): Parser<Integer> {
  return integer();
}

function product(): Parser<Expression> {
  return either(
    bind(terminal(), (lhs) =>
      bind(charP("*") as Parser<Operator>, (op) =>
        bind(product(), (rhs) => result(new InfixExpression(op, lhs, rhs)))
      )
    ),
    either(
      bind(terminal(), (lhs) =>
        bind(charP("/") as Parser<Operator>, (op) =>
          bind(product(), (rhs) => result(new InfixExpression(op, lhs, rhs)))
        )
      ),
      terminal()
    )
  );
}

function sum(): Parser<Expression> {
  return either(
    bind(product(), (lhs) =>
      bind(charP("+") as Parser<Operator>, (op) =>
        bind(sum(), (rhs) => result(new InfixExpression(op, lhs, rhs)))
      )
    ),
    either(
      bind(product(), (lhs) =>
        bind(charP("-") as Parser<Operator>, (op) =>
          bind(sum(), (rhs) => result(new InfixExpression(op, lhs, rhs)))
        )
      ),
      product()
    )
  );
}

export function expression(): Parser<Expression> {
  return bind(sum(), (exp) => bind(EOF(), (_) => result(exp)));
}

export function EOF(): Parser<boolean> {
  return (input) => (input === "" ? [[true, input]] : []);
}
