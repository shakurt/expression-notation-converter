import React, { useState } from "react";

import type { StackState } from "@/types";

import { Collapse } from "./Collapse";
import { ConversionSteps } from "./ConversionSteps";
import { StackVisualizer } from "./StackVisualizer";

type Props = {
  title: string;
  result?: string;
  steps: StackState[];
};

export const NotationCard: React.FC<Props> = ({ title, result, steps }) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    steps.length ? steps.length - 1 : 0
  );

  // reset currentStep when steps change
  React.useEffect(() => {
    setCurrentStep(steps.length ? steps.length - 1 : 0);
  }, [steps]);

  return (
    <div className="mb-4">
      <Collapse
        title={
          <div className="flex w-full items-center justify-between">
            <span className="font-semibold">{title}</span>
            <span className="font-mono text-xs text-gray-500">
              {result ?? "—"}
            </span>
          </div>
        }
        open={open}
        onToggle={() => setOpen((v) => !v)}
      >
        <div className="space-y-4">
          <div className="text-sm">
            Result: <span className="font-mono">{result ?? "-"}</span>
          </div>
          <StackVisualizer states={steps} currentStep={currentStep} />
          <ConversionSteps
            steps={steps}
            onSelectStep={(i) => setCurrentStep(i)}
          />
        </div>
      </Collapse>
    </div>
  );
};
