import { useState } from "react";

import type { Notation, ConversionResult } from "@/types";
import {
  infixToPostfix,
  infixToPrefix,
  postfixToInfix,
  postfixToPrefix,
  prefixToInfix,
  prefixToPostfix,
} from "@/utils/converters";
import {
  validateInfix,
  validatePostfix,
  validatePrefix,
} from "@/utils/validators";

import NotationCard from "./NotationCard";

const EMPTY_RESULT: ConversionResult = { result: undefined, steps: [] };

export const ExpressionInput: React.FC = () => {
  const [notationType, setNotationType] = useState<Notation>("infix");
  const [input, setInput] = useState("(a + b) * c");
  const [error, setError] = useState<string | null>(null);
  const [showContent, setShowContent] = useState(false);

  const [infix, setInfix] = useState<ConversionResult>(EMPTY_RESULT);
  const [prefix, setPrefix] = useState<ConversionResult>(EMPTY_RESULT);
  const [postfix, setPostfix] = useState<ConversionResult>(EMPTY_RESULT);

  const resetResults = () => {
    setError(null);
    setInfix(EMPTY_RESULT);
    setPrefix(EMPTY_RESULT);
    setPostfix(EMPTY_RESULT);
    setShowContent(false);
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();

    resetResults();
    setShowContent(false);

    if (!input.trim()) {
      setError("Input is empty");
      return;
    }

    // INFIX BLOCK
    if (notationType === "infix") {
      const validation = validateInfix(input);
      if (!validation.valid) {
        setError(validation.error || "Invalid infix");
        return;
      }

      const postfixResult = infixToPostfix(input);
      const prefixResult = infixToPrefix(input);

      setInfix({ result: input, steps: validation.stackTrace || [] });
      setPostfix(postfixResult);
      setPrefix(prefixResult);
      setShowContent(true);
      return;
    }

    if (notationType === "postfix") {
      const validation = validatePostfix(input);
      if (!validation.valid) {
        setError(validation.error || "Invalid postfix");
        return;
      }

      const infixResult = postfixToInfix(input);
      const prefixResult = postfixToPrefix(input);

      setPostfix({ result: input, steps: validation.stackTrace || [] });
      setInfix(infixResult);
      setPrefix(prefixResult);
      setShowContent(true);
      return;
    }

    if (notationType === "prefix") {
      const validation = validatePrefix(input);
      if (!validation.valid) {
        setError(validation.error || "Invalid prefix");
        return;
      }

      const infixResult = prefixToInfix(input);
      const postfixResult = prefixToPostfix(input);

      setPrefix({ result: input, steps: validation.stackTrace || [] });
      setInfix(infixResult);
      setPostfix(postfixResult);
      setShowContent(true);
    }
  };

  return (
    <section className="mx-auto max-w-5xl p-4">
      <form
        className={`flex gap-2 ${!error && "mb-3"}`}
        aria-label="Input Control"
        onSubmit={handleConvert}
      >
        <select
          value={notationType}
          onChange={(e) => {
            setNotationType(e.target.value as Notation);
            resetResults();
            setInput("");
          }}
          className="rounded border p-2"
          aria-label="Select notation"
        >
          <option value="infix" className="text-black">
            Infix
          </option>
          <option value="postfix" className="text-black">
            Postfix
          </option>
          <option value="prefix" className="text-black">
            Prefix
          </option>
        </select>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded border p-2"
          placeholder="(A + B) * C |OR| A B + C * |OR| * + A B C"
          aria-label="Expression input"
        />

        <button
          type="submit"
          className="bg-primary hover:bg-primary/80 cursor-pointer rounded p-2 font-semibold text-white transition-colors"
        >
          Convert
        </button>
      </form>
      {error && <div className="my-3 text-sm text-red-500">{error}</div>}

      {showContent && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {notationType !== "infix" && (
            <NotationCard
              title="Infix"
              result={infix.result}
              steps={infix.steps}
            />
          )}

          {notationType !== "prefix" && (
            <NotationCard
              title="Prefix"
              result={prefix.result}
              steps={prefix.steps}
            />
          )}

          {notationType !== "postfix" && (
            <NotationCard
              title="Postfix"
              result={postfix.result}
              steps={postfix.steps}
            />
          )}
        </div>
      )}
    </section>
  );
};
