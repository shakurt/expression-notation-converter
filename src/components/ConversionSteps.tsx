import React from "react";

import type { StackState } from "@/types";

type Props = {
  steps: StackState[];
  onSelectStep?: (i: number) => void;
};

export const ConversionSteps: React.FC<Props> = ({ steps, onSelectStep }) => {
  return (
    <div className="mt-3">
      <div className="mb-2 text-sm text-gray-600">Conversion Steps</div>
      <div className="max-h-56 space-y-2 overflow-auto">
        {steps.map((s) => (
          <button
            key={s.stepIndex}
            onClick={() => onSelectStep && onSelectStep(s.stepIndex)}
            className="w-full rounded border bg-white p-2 text-left hover:bg-gray-50"
          >
            <div className="text-xs text-gray-400">#{s.stepIndex}</div>
            <div className="text-sm">{s.action}</div>
          </button>
        ))}
        {steps.length === 0 && <div className="text-gray-400">No steps</div>}
      </div>
    </div>
  );
};
