import {
  bind,
  charP,
  digit,
  either,
  many,
  Parser,
  result,
  sepBy,
  stringP,
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

class FunctionInvocationExpression implements Expression {
  constructor(readonly name: Fn, readonly args: Expression[]) {}
  expressionNode(): void {}
}

class Constant implements Expression {
  constructor(readonly name: Const) {}
  expressionNode(): void {}
}

class Integer implements Expression {
  constructor(readonly value: number) {}
  expressionNode(): void {}
}

type Operator = "+" | "-" | "*" | "/";
type Fn = keyof typeof fns;
type Const = keyof typeof consts;

const fns: Record<string, (...nums: number[]) => number> = {
  sin: (x: number) => Math.sin(x),
  cos: (x: number) => Math.cos(x),
  abs: (x: number) => Math.abs(x),
  pow: (x: number, y: number) => Math.pow(x, y),
};

const consts: { [key in string]: number } = {
  PI: Math.PI,
  TAU: Math.PI * 2,
};

function integer(): Parser<Integer> {
  return bind(
    either(
      bind(charP("-"), (m) => bind(many(digit()), (d) => result([m, ...d]))),
      many(digit())
    ),
    (v) => result(new Integer(Number(v.join(""))))
  );
}

function fn(): Parser<FunctionInvocationExpression> {
  return bind(
    either(...Object.keys(fns).map((fn) => stringP(fn))) as Parser<Fn>,
    (name) =>
      bind(whitespace(), (_) =>
        bind(charP("("), (_) =>
          bind(
            sepBy(
              bind(whitespace(), (_) => bind(charP(","), (_) => whitespace())),
              sum()
            ),
            (exp) =>
              bind(charP(")"), (_) =>
                result(new FunctionInvocationExpression(name, exp))
              )
          )
        )
      )
  );
}
function constant(): Parser<Constant> {
  return bind(either(...Object.keys(consts).map((cn) => stringP(cn))), (name) =>
    result(new Constant(name))
  );
}

function terminal(): Parser<Expression> {
  return bind(whitespace(), (_) =>
    bind(
      either(
        bind(charP("("), (_) =>
          bind(sum(), (exp) => bind(charP(")"), (_) => result(exp)))
        ),
        fn(),
        constant(),
        integer()
      ),
      (term) => bind(whitespace(), (_) => result(term))
    )
  );
}

function product(): Parser<Expression> {
  return bind(
    bind(terminal(), (lhs) =>
      many(
        bind(either(charP("*"), charP("/")) as Parser<Operator>, (op) =>
          bind(product(), (rhs) => result(new InfixExpression(op, lhs, rhs)))
        )
      )
    ),
    ([first, ...rest]) =>
      result(
        rest.reduce(
          (acc, val) => new InfixExpression(val.operator, acc, val),
          first
        )
      )
  );
}

function sum(): Parser<Expression> {
  return either(
    bind(product(), (lhs) =>
      bind(either(charP("+"), charP("-")) as Parser<Operator>, (op) =>
        bind(sum(), (rhs) => result(new InfixExpression(op, lhs, rhs)))
      )
    ),
    product()
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

  if (e instanceof FunctionInvocationExpression) {
    const args = e.args.map((v) => evalExp(v));
    const fn = fns[e.name];
    if (args.length < fn.length) {
      throw new Error(
        `not enough args passed to ${e.name}, expected ${fn.length}, got ${args.length}`
      );
    }
    return fns[e.name](...args);
  }

  if (e instanceof Constant) {
    return consts[e.name];
  }

  return 0;
}
