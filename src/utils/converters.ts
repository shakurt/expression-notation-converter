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
  stepIndex: number,
  operatorStack?: string[]
): StackState {
  return {
    snapshot: [...stack],
    operatorStack: operatorStack ? [...operatorStack] : undefined,
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
      steps.push(
        createStep(output, `add ${token} to output`, stepIndex++, operatorStack)
      );
      continue;
    }

    if (token === "(") {
      operatorStack.push(token);
      steps.push(
        createStep(
          output,
          `push ( to operator stack`,
          stepIndex++,
          operatorStack
        )
      );
      continue;
    }

    if (token === ")") {
      // First, show that we're processing the closing parenthesis
      steps.push(
        createStep(
          output,
          `process ) - pop until matching (`,
          stepIndex++,
          operatorStack
        )
      );

      while (operatorStack.length && getTopOperator() !== "(") {
        const operator = operatorStack.pop()!;
        output.push(operator);
        steps.push(
          createStep(
            output,
            `move ${operator} to output`,
            stepIndex++,
            operatorStack
          )
        );
      }
      operatorStack.pop(); // Remove '('
      steps.push(
        createStep(
          output,
          `remove matching ( from operator stack`,
          stepIndex++,
          operatorStack
        )
      );
      continue;
    }

    // Handle operator
    while (
      operatorStack.length &&
      getTopOperator() !== "(" &&
      (PRECEDENCE[getTopOperator()] > PRECEDENCE[token] ||
        (PRECEDENCE[getTopOperator()] === PRECEDENCE[token] &&
          !RIGHT_ASSOCIATIVE[token]))
    ) {
      const operator = operatorStack.pop()!;
      output.push(operator);
      steps.push(
        createStep(
          output,
          `move ${operator} to output`,
          stepIndex++,
          operatorStack
        )
      );
    }

    operatorStack.push(token);
    steps.push(
      createStep(
        output,
        `push ${token} to operator stack`,
        stepIndex++,
        operatorStack
      )
    );
  }

  // Pop remaining operators (skip parentheses)
  while (operatorStack.length) {
    const operator = operatorStack.pop()!;
    if (BINARY_OPERATORS.includes(operator)) {
      output.push(operator);
      steps.push(
        createStep(
          output,
          `move ${operator} to output`,
          stepIndex++,
          operatorStack
        )
      );
    }
  }

  return { result: output.join(" "), steps };
}

export function infixToPrefix(input: string): ConversionResult {
  // Algorithm: Reverse tokens, swap parentheses, modify associativity, convert to postfix, reverse result
  const tokens = tokenize(input).reverse();
  const output: string[] = [];
  const operatorStack: string[] = [];
  const steps: StackState[] = [];
  let stepIndex = 0;

  const getTopOperator = () => operatorStack[operatorStack.length - 1];

  for (const token of tokens) {
    if (isOperand(token)) {
      output.push(token);
      steps.push(
        createStep(output, `add ${token} to output`, stepIndex++, operatorStack)
      );
      continue;
    }

    if (token === ")") {
      operatorStack.push(token);
      steps.push(
        createStep(
          output,
          `push ) to operator stack`,
          stepIndex++,
          operatorStack
        )
      );
      continue;
    }

    if (token === "(") {
      // First, show that we're processing the opening parenthesis
      steps.push(
        createStep(
          output,
          `process ( - pop until matching )`,
          stepIndex++,
          operatorStack
        )
      );

      while (operatorStack.length && getTopOperator() !== ")") {
        const operator = operatorStack.pop()!;
        if (BINARY_OPERATORS.includes(operator)) {
          output.push(operator);
          steps.push(
            createStep(
              output,
              `move ${operator} to output`,
              stepIndex++,
              operatorStack
            )
          );
        }
      }
      operatorStack.pop(); // Remove ')'
      steps.push(
        createStep(
          output,
          `remove matching ) from operator stack`,
          stepIndex++,
          operatorStack
        )
      );
      continue;
    }

    // Handle operator - note reversed comparison for prefix
    if (BINARY_OPERATORS.includes(token)) {
      while (
        operatorStack.length &&
        operatorStack[operatorStack.length - 1] !== ")" &&
        BINARY_OPERATORS.includes(operatorStack[operatorStack.length - 1]) &&
        PRECEDENCE[operatorStack[operatorStack.length - 1]] > PRECEDENCE[token]
      ) {
        const operator = operatorStack.pop()!;
        output.push(operator);
        steps.push(
          createStep(
            output,
            `move ${operator} to output`,
            stepIndex++,
            operatorStack
          )
        );
      }

      operatorStack.push(token);
      steps.push(
        createStep(
          output,
          `push ${token} to operator stack`,
          stepIndex++,
          operatorStack
        )
      );
    }
  }

  // Pop remaining operators (skip parentheses)
  while (operatorStack.length) {
    const operator = operatorStack.pop()!;
    if (BINARY_OPERATORS.includes(operator)) {
      output.push(operator);
      steps.push(
        createStep(
          output,
          `move ${operator} to output`,
          stepIndex++,
          operatorStack
        )
      );
    }
  }

  // Filter out any parentheses that might have slipped through
  const cleanOutput = output.filter(
    (token) => isOperand(token) || BINARY_OPERATORS.includes(token)
  );
  const prefixResult = cleanOutput.reverse().join(" ");
  return { result: prefixResult, steps };
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
