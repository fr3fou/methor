import {
  bind,
  charP,
  digit,
  either,
  many,
  Parser,
  result,
  whitespace,
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

enum Precedence {
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

export function integerParser(): Parser<Integer> {
  return bind(many(digit()), (v) => result(new Integer(Number(v.join("")))));
}

export function operatorParser(): Parser<Operator> {
  return either(
    charP("+"),
    either(charP("-"), either(charP("*"), charP("/")))
  ) as Parser<Operator>;
}

export function infixParser(prec: Precedence): Parser<InfixExpression> {
  return bind(expressionParser(), (lhs) =>
    bind(whitespace(), (_) =>
      bind(operatorParser(), (op) =>
        bind(whitespace(), (_) =>
          bind(expressionParser(), (rhs) =>
            result(new InfixExpression(op, lhs, rhs))
          )
        )
      )
    )
  );
}

export function expressionParser(): Parser<Expression> {
  return either(integerParser(), infixParser(Precedence.Lowest));
}
