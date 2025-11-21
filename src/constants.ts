/** Binary operators supported in expressions */
export const BINARY_OPERATORS = ["+", "-", "*", "/", "^"];

/** Unary operators (internal tokens for special handling) */
export const UNARY_OPERATORS = ["u+", "u-"];

/** All supported operators combined */
export const ALL_OPERATORS = [...BINARY_OPERATORS, ...UNARY_OPERATORS];

/**
 * Operator precedence levels (higher number = higher precedence)
 * - Level 5: Unary operators (u+, u-)
 * - Level 4: Exponentiation (^)
 * - Level 3: Multiplication and Division (*, /)
 * - Level 2: Addition and Subtraction (+, -)
 */
export const PRECEDENCE: Record<string, number> = {
  "u+": 5,
  "u-": 5,
  "^": 4,
  "*": 3,
  "/": 3,
  "+": 2,
  "-": 2,
};

/**
 * Right-associative operators (evaluated from right to left)
 * - Exponentiation (^): 2^3^4 = 2^(3^4)
 * - Unary operators: Process from right to left
 */
export const RIGHT_ASSOCIATIVE: Record<string, boolean> = {
  "^": true,
  "u+": true,
  "u-": true,
};
