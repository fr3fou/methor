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

function integer(): Parser<Integer> {
  return bind(many(digit()), (v) => result(new Integer(Number(v.join("")))));
}

function terminal(): Parser<Expression> {
  return either(
    bind(charP("("), (_) =>
      bind(sum(), (exp) => bind(charP(")"), (_) => result(exp)))
    ),
    integer()
  );
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

function EOF(): Parser<boolean> {
  return (input) => (input === "" ? [[true, input]] : []);
}

export function evalExp(e: Expression): number {
  if (e instanceof Integer) {
    return e.value;
  }

  if (e instanceof InfixExpression) {
    switch (e.operator) {
      case "+":
        return evalExp(e.lhs) + evalExp(e.rhs);
      case "-":
        return evalExp(e.lhs) - evalExp(e.rhs);
      case "/":
        return evalExp(e.lhs) / evalExp(e.rhs);
      case "*":
        return evalExp(e.lhs) * evalExp(e.rhs);
    }
  }

  return 0;
}
