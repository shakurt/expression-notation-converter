import { PRECEDENCE, RIGHT_ASSOCIATIVE, BINARY_OPERATORS } from "@/constants";
import type { ConversionResult, StackState } from "@/types";
import { tokenize } from "@/utils/tokenize";

function isOperand(token: string): boolean {
  // Check if token is a number (e.g., 12, 3.14) or variable (e.g., A, var)
  return /^\d+(\.\d+)?$/.test(token) || /^[A-Za-z]+$/.test(token);
}

function createStep(
  stack: string[],
  action: string,
  stepIndex: number
): StackState {
  return {
    snapshot: [...stack],
    action,
    stepIndex,
  };
}

export function infixToPostfix(input: string): ConversionResult {
  const tokens = tokenize(input);
  const output: string[] = [];
  const operatorStack: string[] = [];
  const steps: StackState[] = [];
  let stepIndex = 0;

  const getTopOperator = () => operatorStack[operatorStack.length - 1];

  for (const token of tokens) {
    if (isOperand(token)) {
      output.push(token);
      steps.push(createStep(output, `add ${token} to output`, stepIndex++));
      continue;
    }

    if (token === "(") {
      operatorStack.push(token);
      steps.push(
        createStep(
          [...output, `[op: ${operatorStack.join(", ")}]`],
          `push ( to operator stack`,
          stepIndex++
        )
      );
      continue;
    }

    if (token === ")") {
      while (operatorStack.length && getTopOperator() !== "(") {
        const operator = operatorStack.pop()!;
        output.push(operator);
        steps.push(
          createStep(output, `move ${operator} to output`, stepIndex++)
        );
      }
      operatorStack.pop(); // Remove '('
      const stackDisplay =
        operatorStack.length > 0 ? `[op: ${operatorStack.join(", ")}]` : "";
      steps.push(
        createStep(
          [...output, stackDisplay].filter((s) => s),
          `remove ( from operator stack`,
          stepIndex++
        )
      );
      continue;
    }

    // Handle operator
    const topOperator = getTopOperator();
    while (
      operatorStack.length &&
      topOperator !== "(" &&
      (PRECEDENCE[topOperator] > PRECEDENCE[token] ||
        (PRECEDENCE[topOperator] === PRECEDENCE[token] &&
          !RIGHT_ASSOCIATIVE[token]))
    ) {
      const operator = operatorStack.pop()!;
      output.push(operator);
      steps.push(createStep(output, `move ${operator} to output`, stepIndex++));
    }

    operatorStack.push(token);
    steps.push(
      createStep(
        [...output, `[op: ${operatorStack.join(", ")}]`],
        `push ${token} to operator stack`,
        stepIndex++
      )
    );
  }

  // Pop remaining operators
  while (operatorStack.length) {
    const operator = operatorStack.pop()!;
    output.push(operator);
    steps.push(createStep(output, `move ${operator} to output`, stepIndex++));
  }

  return { result: output.join(" "), steps };
}

export function infixToPrefix(input: string): ConversionResult {
  // Algorithm: Reverse tokens, swap parentheses, convert to postfix, reverse result
  const swapParenthesis = (token: string): string => {
    if (token === "(") return ")";
    if (token === ")") return "(";
    return token;
  };

  const reversedTokens = tokenize(input).reverse().map(swapParenthesis);
  const reversedInput = reversedTokens.join(" ");

  const postfixResult = infixToPostfix(reversedInput);

  if (postfixResult.error) {
    return { error: postfixResult.error, steps: postfixResult.steps };
  }

  const prefixResult = postfixResult.result
    ? postfixResult.result.split(" ").reverse().join(" ")
    : undefined;

  return { result: prefixResult, steps: postfixResult.steps };
}

export function postfixToInfix(input: string): ConversionResult {
  const tokens = tokenize(input);
  const stack: string[] = [];
  const steps: StackState[] = [];
  let stepIndex = 0;

  for (const token of tokens) {
    if (isOperand(token)) {
      stack.push(token);
      steps.push(createStep(stack, `push ${token}`, stepIndex++));
      continue;
    }

    if (BINARY_OPERATORS.includes(token)) {
      if (stack.length < 2) {
        return { error: `Operator ${token} requires 2 operands`, steps };
      }

      const operand2 = stack.pop()!;
      steps.push(createStep(stack, `pop ${operand2}`, stepIndex++));

      const operand1 = stack.pop()!;
      steps.push(createStep(stack, `pop ${operand1}`, stepIndex++));

      // Only add parentheses if operands are complex expressions
      const needsParens1 = operand1.includes(" ");
      const needsParens2 = operand2.includes(" ");

      const expr1 = needsParens1 ? `( ${operand1} )` : operand1;
      const expr2 = needsParens2 ? `( ${operand2} )` : operand2;
      const expression = `${expr1} ${token} ${expr2}`;

      stack.push(expression);
      steps.push(createStep(stack, `push ${expression}`, stepIndex++));
      continue;
    }

    return { error: `Unknown token: ${token}`, steps };
  }

  return { result: stack.join(" "), steps };
}

export function prefixToInfix(input: string): ConversionResult {
  const tokens = tokenize(input).reverse();
  const stack: string[] = [];
  const steps: StackState[] = [];
  let stepIndex = 0;

  for (const token of tokens) {
    if (isOperand(token)) {
      stack.push(token);
      steps.push(createStep(stack, `push ${token}`, stepIndex++));
      continue;
    }

    if (BINARY_OPERATORS.includes(token)) {
      if (stack.length < 2) {
        return { error: `Operator ${token} requires 2 operands`, steps };
      }

      const operand1 = stack.pop()!;
      steps.push(createStep(stack, `pop ${operand1}`, stepIndex++));

      const operand2 = stack.pop()!;
      steps.push(createStep(stack, `pop ${operand2}`, stepIndex++));

      // Only add parentheses if operands are complex expressions
      const needsParens1 = operand1.includes(" ");
      const needsParens2 = operand2.includes(" ");

      const expr1 = needsParens1 ? `( ${operand1} )` : operand1;
      const expr2 = needsParens2 ? `( ${operand2} )` : operand2;
      const expression = `${expr1} ${token} ${expr2}`;

      stack.push(expression);
      steps.push(createStep(stack, `push ${expression}`, stepIndex++));
      continue;
    }

    return { error: `Unknown token: ${token}`, steps };
  }

  return { result: stack.join(" "), steps };
}

export function prefixToPostfix(input: string): ConversionResult {
  const tokens = tokenize(input).reverse();
  const stack: string[] = [];
  const steps: StackState[] = [];
  let stepIndex = 0;

  for (const token of tokens) {
    if (isOperand(token)) {
      stack.push(token);
      steps.push(createStep(stack, `push ${token}`, stepIndex++));
      continue;
    }

    if (BINARY_OPERATORS.includes(token)) {
      if (stack.length < 2) {
        return { error: `Operator ${token} requires 2 operands`, steps };
      }

      const operand1 = stack.pop()!;
      steps.push(createStep(stack, `pop ${operand1}`, stepIndex++));

      const operand2 = stack.pop()!;
      steps.push(createStep(stack, `pop ${operand2}`, stepIndex++));

      const postfixExpr = `${operand1} ${operand2} ${token}`;
      stack.push(postfixExpr);
      steps.push(createStep(stack, `push ${postfixExpr}`, stepIndex++));
      continue;
    }

    return { error: `Unknown token: ${token}`, steps };
  }

  return { result: stack.join(" "), steps };
}

export function postfixToPrefix(input: string): ConversionResult {
  const tokens = tokenize(input);
  const stack: string[] = [];
  const steps: StackState[] = [];
  let stepIndex = 0;

  for (const token of tokens) {
    if (isOperand(token)) {
      stack.push(token);
      steps.push(createStep(stack, `push ${token}`, stepIndex++));
      continue;
    }

    if (BINARY_OPERATORS.includes(token)) {
      if (stack.length < 2) {
        return { error: `Operator ${token} requires 2 operands`, steps };
      }

      const operand2 = stack.pop()!;
      steps.push(createStep(stack, `pop ${operand2}`, stepIndex++));

      const operand1 = stack.pop()!;
      steps.push(createStep(stack, `pop ${operand1}`, stepIndex++));

      const prefixExpr = `${token} ${operand1} ${operand2}`;
      stack.push(prefixExpr);
      steps.push(createStep(stack, `push ${prefixExpr}`, stepIndex++));
      continue;
    }

    return { error: `Unknown token: ${token}`, steps };
  }

  return { result: stack.join(" "), steps };
}
