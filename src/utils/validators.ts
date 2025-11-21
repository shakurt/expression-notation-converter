import { BINARY_OPERATORS } from "@/constants";
import type { ValidationResult, StackState } from "@/types";

import { tokenize } from "./tokenize";

/*
  ولیدیشن دقیق برای postfix / prefix / infix
  همهٔ ولیدیشن‌ها شبیه‌سازی با پشته انجام می‌دهند و stackTrace برای نمایش مراحل تولید می‌کنند.
*/

function isOperand(tok: string) {
  // قبول می‌کنیم: اعداد (مثل 12, 3.14) یا شناسه‌های حروفی (A, var)
  return /^\d+(\.\d+)?$/.test(tok) || /^[A-Za-z]+$/.test(tok);
}

// ================= Postfix =================
export function validatePostfix(input: string): ValidationResult {
  const tokens = tokenize(input);
  const stackTrace: StackState[] = [];
  const stack: string[] = [];
  let step = 0;

  for (const tok of tokens) {
    if (isOperand(tok)) {
      stack.push(tok);
      stackTrace.push({
        snapshot: [...stack],
        action: `push ${tok}`,
        stepIndex: step++,
      });
      continue;
    }
    if (BINARY_OPERATORS.includes(tok)) {
      if (stack.length < 2) {
        return {
          valid: false,
          error: `Operator '${tok}' needs 2 operands but stack has ${stack.length}`,
          stackTrace,
        };
      }
      const b = stack.pop()!;
      const a = stack.pop()!;
      stackTrace.push({
        snapshot: [...stack],
        action: `pop ${b}; pop ${a} (apply ${tok})`,
        stepIndex: step++,
      });
      // push placeholder
      stack.push("(res)");
      stackTrace.push({
        snapshot: [...stack],
        action: `push (res)`,
        stepIndex: step++,
      });
      continue;
    }
    return { valid: false, error: `Unknown token '${tok}'`, stackTrace };
  }

  if (stack.length !== 1) {
    return {
      valid: false,
      error: `Postfix must finish with exactly 1 item in stack but has ${stack.length}`,
      stackTrace,
    };
  }
  return { valid: true, stackTrace };
}

// ================= Prefix =================
export function validatePrefix(input: string): ValidationResult {
  // خواندن از راست به چپ برای prefix
  const tokens = tokenize(input).reverse();
  const stackTrace: StackState[] = [];
  const stack: string[] = [];
  let step = 0;

  for (const tok of tokens) {
    if (isOperand(tok)) {
      stack.push(tok);
      stackTrace.push({
        snapshot: [...stack],
        action: `push ${tok}`,
        stepIndex: step++,
      });
      continue;
    }
    if (BINARY_OPERATORS.includes(tok)) {
      if (stack.length < 2) {
        return {
          valid: false,
          error: `Operator '${tok}' needs 2 operands but stack has ${stack.length}`,
          stackTrace,
        };
      }
      const b = stack.pop()!;
      const a = stack.pop()!;
      stackTrace.push({
        snapshot: [...stack],
        action: `pop ${b}; pop ${a} (apply ${tok})`,
        stepIndex: step++,
      });
      stack.push("(res)");
      stackTrace.push({
        snapshot: [...stack],
        action: `push (res)`,
        stepIndex: step++,
      });
      continue;
    }
    return { valid: false, error: `Unknown token '${tok}'`, stackTrace };
  }

  if (stack.length !== 1) {
    return {
      valid: false,
      error: `Prefix must finish with exactly 1 item in stack but has ${stack.length}`,
      stackTrace,
    };
  }
  return { valid: true, stackTrace };
}

// ================= Infix =================
export function validateInfix(input: string): ValidationResult {
  const tokens = tokenize(input);
  const stackTrace: StackState[] = [];
  const parenStack: string[] = [];

  let prev: string | null = null;
  let step = 0;

  // قاعده‌های اولیه: پرانتزها بالا/پایین باشند، ترتیب عملوند/عملگر منطقی باشد
  for (const tok of tokens) {
    if (tok === "(") {
      parenStack.push(tok);
      prev = "(";
      continue;
    }
    if (tok === ")") {
      if (parenStack.length === 0)
        return { valid: false, error: "Unmatched )", stackTrace };
      parenStack.pop();
      prev = ")";
      continue;
    }
    if (isOperand(tok)) {
      if (prev && (isOperand(prev) || prev === ")")) {
        return {
          valid: false,
          error: `Missing operator between operands near '${tok}'`,
          stackTrace,
        };
      }
      prev = tok;
      continue;
    }
    if (BINARY_OPERATORS.includes(tok)) {
      if (!prev || prev === "(" || BINARY_OPERATORS.includes(prev)) {
        // ممکن است unary باشه (+/-)
        if (tok === "+" || tok === "-") {
          prev = "u"; // mark unary seen
          continue;
        }
        return {
          valid: false,
          error: `Operator '${tok}' in invalid position`,
          stackTrace,
        };
      }
      prev = tok;
      continue;
    }
    return { valid: false, error: `Unknown token '${tok}'`, stackTrace };
  }

  if (parenStack.length > 0)
    return { valid: false, error: "Unmatched (", stackTrace };
  if (!prev || BINARY_OPERATORS.includes(prev))
    return {
      valid: false,
      error: "Expression cannot end with operator",
      stackTrace,
    };

  // شبیه‌سازی شانتینگ-یارد (شامل بررسی underflow اپراتور بر روی خروجی)
  const opStack: string[] = [];
  const outTrace: StackState[] = [];
  let outCount = 0;

  const precedence: Record<string, number> = {
    "^": 4,
    "*": 3,
    "/": 3,
    "+": 2,
    "-": 2,
  };

  for (const tok of tokens) {
    if (isOperand(tok)) {
      outCount++;
      outTrace.push({
        snapshot: [`output=${outCount}`],
        action: `emit ${tok}`,
        stepIndex: step++,
      });
      continue;
    }
    if (tok === "(") {
      opStack.push(tok);
      outTrace.push({
        snapshot: [...opStack],
        action: "push (",
        stepIndex: step++,
      });
      continue;
    }
    if (tok === ")") {
      while (opStack.length && opStack[opStack.length - 1] !== "(") {
        const op = opStack.pop()!;
        if (outCount < 2)
          return {
            valid: false,
            error: `Operator '${op}' has insufficient operands`,
            stackTrace: outTrace,
          };
        outCount--;
        outTrace.push({
          snapshot: [`output=${outCount}`],
          action: `apply ${op}`,
          stepIndex: step++,
        });
      }
      if (!opStack.length)
        return {
          valid: false,
          error: "Mismatched parentheses",
          stackTrace: outTrace,
        };
      opStack.pop();
      outTrace.push({
        snapshot: [...opStack],
        action: "pop (",
        stepIndex: step++,
      });
      continue;
    }
    if (BINARY_OPERATORS.includes(tok)) {
      while (
        opStack.length &&
        opStack[opStack.length - 1] !== "(" &&
        (precedence[opStack[opStack.length - 1]] > precedence[tok] ||
          (precedence[opStack[opStack.length - 1]] === precedence[tok] &&
            tok !== "^"))
      ) {
        const op = opStack.pop()!;
        if (outCount < 2)
          return {
            valid: false,
            error: `Operator '${op}' has insufficient operands`,
            stackTrace: outTrace,
          };
        outCount--;
        outTrace.push({
          snapshot: [`output=${outCount}`],
          action: `apply ${op}`,
          stepIndex: step++,
        });
      }
      opStack.push(tok);
      outTrace.push({
        snapshot: [...opStack],
        action: `push ${tok}`,
        stepIndex: step++,
      });
      continue;
    }
  }

  while (opStack.length) {
    const op = opStack.pop()!;
    if (op === "(" || op === ")")
      return {
        valid: false,
        error: "Mismatched parentheses",
        stackTrace: outTrace,
      };
    if (outCount < 2)
      return {
        valid: false,
        error: `Operator '${op}' has insufficient operands`,
        stackTrace: outTrace,
      };
    outCount--;
    outTrace.push({
      snapshot: [`output=${outCount}`],
      action: `apply ${op}`,
      stepIndex: step++,
    });
  }

  if (outCount !== 1)
    return {
      valid: false,
      error: `Final output stack size ${outCount} (expected 1)`,
      stackTrace: outTrace,
    };

  return { valid: true, stackTrace: outTrace };
}
