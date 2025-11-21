import React, { useState } from "react";

import type { Notation } from "@/types";
import {
  infixToPostfix,
  infixToPrefix,
  postfixToInfix,
  prefixToInfix,
} from "@/utils/converters";
import {
  validateInfix,
  validatePostfix,
  validatePrefix,
} from "@/utils/validators";

import { NotationCard } from "./NotationCard";

export const ExpressionInput: React.FC = () => {
  const [notation, setNotation] = useState<Notation>("infix");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [infix, setInfix] = useState<{ result?: string; steps: any[] }>({
    result: undefined,
    steps: [],
  });
  const [prefix, setPrefix] = useState<{ result?: string; steps: any[] }>({
    result: undefined,
    steps: [],
  });
  const [postfix, setPostfix] = useState<{ result?: string; steps: any[] }>({
    result: undefined,
    steps: [],
  });

  const handleConvert = () => {
    setError(null);
    setInfix({ result: undefined, steps: [] });
    setPrefix({ result: undefined, steps: [] });
    setPostfix({ result: undefined, steps: [] });

    if (!input.trim()) {
      setError("Input is empty");
      return;
    }

    if (notation === "infix") {
      const v = validateInfix(input);
      if (!v.valid) {
        setError(v.error || "Invalid infix");
        return;
      }
      const p = infixToPostfix(input);
      const pre = infixToPrefix(input);
      setPostfix({ result: p.result, steps: p.steps });
      setPrefix({ result: pre.result, steps: pre.steps });
      setInfix({ result: input, steps: v.stackTrace || [] });
      return;
    }

    if (notation === "postfix") {
      const v = validatePostfix(input);
      if (!v.valid) {
        setError(v.error || "Invalid postfix");
        return;
      }
      const inf = postfixToInfix(input);
      setPostfix({ result: input, steps: v.stackTrace || [] });
      setInfix({ result: inf.result, steps: inf.steps || [] });
      if (inf.result) {
        const pre = infixToPrefix(inf.result);
        setPrefix({ result: pre.result, steps: pre.steps || [] });
      }
      return;
    }

    if (notation === "prefix") {
      const v = validatePrefix(input);
      if (!v.valid) {
        setError(v.error || "Invalid prefix");
        return;
      }
      const inf = prefixToInfix(input);
      setPrefix({ result: input, steps: v.stackTrace || [] });
      setInfix({ result: inf.result, steps: inf.steps || [] });
      if (inf.result) {
        const post = infixToPostfix(inf.result);
        setPostfix({ result: post.result, steps: post.steps || [] });
      }
      return;
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 flex gap-2">
        <select
          value={notation}
          onChange={(e) => setNotation(e.target.value as Notation)}
          className="rounded border p-2"
          aria-label="Select notation"
        >
          <option value="infix">Infix</option>
          <option value="postfix">Postfix</option>
          <option value="prefix">Prefix</option>
        </select>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded border p-2"
          placeholder="مثال: (A + B) * C  — یا  A B + C *  — یا  * + A B C"
          aria-label="Expression input"
        />

        <button
          onClick={handleConvert}
          className="bg-primary rounded p-2 text-white"
        >
          Convert
        </button>
      </div>

      {error && <div className="mb-3 text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <NotationCard title="Infix" result={infix.result} steps={infix.steps} />
        <NotationCard
          title="Prefix"
          result={prefix.result}
          steps={prefix.steps}
        />
        <NotationCard
          title="Postfix"
          result={postfix.result}
          steps={postfix.steps}
        />
      </div>
    </div>
  );
};
