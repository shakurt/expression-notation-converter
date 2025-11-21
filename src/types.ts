export type Notation = "infix" | "postfix" | "prefix";

export type Token = string;

export type StackState = {
  snapshot: string[]; // عناصر پشته (از پایین به بالا برای نمایش)
  action?: string; // توضیح عملیات (push X / pop X / emit ...)
  stepIndex: number; // شماره قدم
};

export type ValidationResult = {
  valid: boolean;
  error?: string;
  stackTrace?: StackState[]; // برای نمایش جزئیات ولیدیشن
};

export type ConversionResult = {
  result?: string; // رشته نهایی (مثلاً postfix)
  steps: StackState[]; // مراحل پشته (برای نمایش)
  error?: string;
};
