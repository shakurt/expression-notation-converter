// جداکنندهٔ توکن‌ها — پشتیبانی از مواردی با و بدون فاصله
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let cur = "";
  const pushCur = () => {
    if (cur !== "") {
      tokens.push(cur);
      cur = "";
    }
  };
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === " ") {
      pushCur();
      continue;
    }
    if (ch === "(" || ch === ")") {
      pushCur();
      tokens.push(ch);
      continue;
    }
    if ("+-*/^".includes(ch)) {
      pushCur();
      tokens.push(ch);
      continue;
    }
    cur += ch;
  }
  pushCur();
  return tokens;
}
