export const BINARY_OPERATORS = ["+", "-", "*", "/", "^"];
export const UNARY_OPERATORS = ["u+", "u-"]; // internal tokens if needed

export const ALL_OPERATORS = [...BINARY_OPERATORS, ...UNARY_OPERATORS];

export const PRECEDENCE: Record<string, number> = {
  "u+": 5,
  "u-": 5,
  "^": 4,
  "*": 3,
  "/": 3,
  "+": 2,
  "-": 2,
};

export const RIGHT_ASSOCIATIVE: Record<string, boolean> = {
  "^": true,
  "u+": true,
  "u-": true,
};
