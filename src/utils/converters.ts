import { PRECEDENCE, RIGHT_ASSOCIATIVE, BINARY_OPERATORS } from "@/constants";
import type { ConversionResult } from "@/types";
import { tokenize } from "@/utils/tokenize";

/* تبدیل‌ها با استفاده از پشته و خروجی مراحل برای نمایش.
   - infixToPostfix: شانتینگ-یارد با مراحل opStack/output
   - infixToPrefix: معکوس‌سازی ترفند شناخته‌شده
   - postfixToInfix & prefixToInfix: بازسازیشان با پشته (ترجیحاً برای نمایش) */

function isOperand(tok: string) {
  return /^\d+(\.\d+)?$/.test(tok) || /^[A-Za-z]+$/.test(tok);
}

export function infixToPostfix(input: string): ConversionResult {
  const tokens = tokenize(input);
  const output: string[] = [];
  const opStack: string[] = [];
  const steps = [];
  let step = 0;

  for (const tok of tokens) {
    if (isOperand(tok)) {
      output.push(tok);
      steps.push({
        snapshot: [...opStack],
        action: `emit ${tok} -> output: ${output.join(" ")}`,
        stepIndex: step++,
      });
      continue;
    }
    if (tok === "(") {
      opStack.push(tok);
      steps.push({
        snapshot: [...opStack],
        action: "push (",
        stepIndex: step++,
      });
      continue;
    }
    if (tok === ")") {
      while (opStack.length && opStack[opStack.length - 1] !== "(") {
        const op = opStack.pop()!;
        output.push(op);
        steps.push({
          snapshot: [...opStack],
          action: `pop ${op} -> output: ${output.join(" ")}`,
          stepIndex: step++,
        });
      }
      opStack.pop(); // pop '('
      steps.push({
        snapshot: [...opStack],
        action: "pop (",
        stepIndex: step++,
      });
      continue;
    }
    // operator
    while (
      opStack.length &&
      opStack[opStack.length - 1] !== "(" &&
      (PRECEDENCE[opStack[opStack.length - 1]] > PRECEDENCE[tok] ||
        (PRECEDENCE[opStack[opStack.length - 1]] === PRECEDENCE[tok] &&
          !RIGHT_ASSOCIATIVE[tok]))
    ) {
      const op = opStack.pop()!;
      output.push(op);
      steps.push({
        snapshot: [...opStack],
        action: `pop ${op} -> output: ${output.join(" ")}`,
        stepIndex: step++,
      });
    }
    opStack.push(tok);
    steps.push({
      snapshot: [...opStack],
      action: `push ${tok}`,
      stepIndex: step++,
    });
  }

  while (opStack.length) {
    const op = opStack.pop()!;
    output.push(op);
    steps.push({
      snapshot: [...opStack],
      action: `pop ${op} -> output: ${output.join(" ")}`,
      stepIndex: step++,
    });
  }

  return { result: output.join(" "), steps };
}

export function infixToPrefix(input: string): ConversionResult {
  // reverse tokens, swap parens, infix->postfix, reverse output
  const tokens = tokenize(input)
    .reverse()
    .map((tok) => (tok === "(" ? ")" : tok === ")" ? "(" : tok));
  const reversed = tokens.join(" ");
  const postfix = infixToPostfix(reversed);
  if (postfix.error) return { error: postfix.error, steps: postfix.steps };
  const prefix = postfix.result
    ? postfix.result.split(" ").reverse().join(" ")
    : undefined;
  return { result: prefix, steps: postfix.steps };
}

export function postfixToInfix(input: string): ConversionResult {
  const tokens = tokenize(input);
  const stack: string[] = [];
  const steps = [];
  let step = 0;

  for (const tok of tokens) {
    if (isOperand(tok)) {
      stack.push(tok);
      steps.push({
        snapshot: [...stack],
        action: `push ${tok}`,
        stepIndex: step++,
      });
      continue;
    }
    if (BINARY_OPERATORS.includes(tok)) {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined)
        return { error: `Operator ${tok} has insufficient operands`, steps };
      const expr = `( ${a} ${tok} ${b} )`;
      stack.push(expr);
      steps.push({
        snapshot: [...stack],
        action: `pop ${b}; pop ${a}; push ${expr}`,
        stepIndex: step++,
      });
      continue;
    }
    return { error: `Unknown token ${tok}`, steps };
  }

  return { result: stack.join(" "), steps };
}

export function prefixToInfix(input: string): ConversionResult {
  const tokens = tokenize(input).reverse();
  const stack: string[] = [];
  const steps = [];
  let step = 0;

  for (const tok of tokens) {
    if (isOperand(tok)) {
      stack.push(tok);
      steps.push({
        snapshot: [...stack],
        action: `push ${tok}`,
        stepIndex: step++,
      });
      continue;
    }
    if (BINARY_OPERATORS.includes(tok)) {
      const a = stack.pop();
      const b = stack.pop();
      if (a === undefined || b === undefined)
        return { error: `Operator ${tok} has insufficient operands`, steps };
      const expr = `( ${a} ${tok} ${b} )`;
      stack.push(expr);
      steps.push({
        snapshot: [...stack],
        action: `pop ${a}; pop ${b}; push ${expr}`,
        stepIndex: step++,
      });
      continue;
    }
    return { error: `Unknown token ${tok}`, steps };
  }

  return { result: stack.join(" "), steps };
}
