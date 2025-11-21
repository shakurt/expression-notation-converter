/** Available notation types for mathematical expressions */
export type Notation = "infix" | "postfix" | "prefix";

/** Represents a single token in an expression */
export type Token = string;

/** Represents the state of the stack at a specific step during conversion/validation */
export type StackState = {
  /** Snapshot of stack elements (from bottom to top for display) */
  snapshot: string[];
  /** Description of the operation (e.g., push X, pop X, emit...) */
  action?: string;
  /** Step number in the sequence */
  stepIndex: number;
};

/** Result of validating an expression */
export type ValidationResult = {
  /** Whether the expression is valid */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Stack trace showing validation steps for visualization */
  stackTrace?: StackState[];
};

/** Result of converting an expression from one notation to another */
export type ConversionResult = {
  /** The converted expression string (e.g., postfix notation) */
  result?: string;
  /** Stack states during conversion for step-by-step visualization */
  steps: StackState[];
  /** Error message if conversion failed */
  error?: string;
};
