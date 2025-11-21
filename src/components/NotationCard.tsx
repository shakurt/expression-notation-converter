import { useState, useEffect } from "react";

import Collapse from "@/components/Collapse";
import ConversionSteps from "@/components/ConversionSteps";
import StackVisualizer from "@/components/StackVisualizer";
import type { StackState } from "@/types";

type NotationCardProps = {
  title: string;
  result?: string;
  steps: StackState[];
};

const NotationCard: React.FC<NotationCardProps> = ({
  title,
  result,
  steps,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(
    steps.length > 0 ? steps.length - 1 : 0
  );

  // Reset currentStep when steps change
  useEffect(() => {
    setCurrentStep(steps.length > 0 ? steps.length - 1 : 0);
  }, [steps]);

  return (
    <div className="mb-4" aria-label={`${title} notation card`}>
      <Collapse
        title={
          <div
            className="flex w-full flex-col font-medium"
            aria-label="Title Container"
          >
            <h2 className="font-bold">{title}:</h2>
          </div>
        }
        result={result}
        open={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
      >
        <div className="space-y-4">
          <StackVisualizer states={steps} currentStep={currentStep} />
          <ConversionSteps steps={steps} onSelectStep={setCurrentStep} />
        </div>
      </Collapse>
    </div>
  );
};

export default NotationCard;
