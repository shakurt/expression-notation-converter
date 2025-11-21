import type { StackState } from "@/types";

type ConversionStepsProps = {
  steps: StackState[];
  onSelectStep?: (stepIndex: number) => void;
};

const ConversionSteps: React.FC<ConversionStepsProps> = ({
  steps,
  onSelectStep,
}) => {
  const hasSteps = steps.length > 0;

  return (
    <section
      className="mt-3"
      aria-label="Conversion Steps
"
    >
      <div aria-label="Title Content" className="mb-2 flex items-center gap-1">
        <h3 className="text-sm font-semibold text-white">Conversion Steps</h3>
        <span className="text-xs">(Steps are clickable!)</span>
      </div>
      <div className="max-h-[189px] space-y-2 overflow-auto">
        {hasSteps ? (
          steps.map((step) => (
            <button
              key={step.stepIndex}
              type="button"
              onClick={() => onSelectStep?.(step.stepIndex)}
              className="flex w-full cursor-pointer flex-col gap-1 rounded border bg-white p-2 text-left transition-colors hover:bg-gray-50"
            >
              <span className="text-xs text-gray-700">
                Step #{step.stepIndex + 1}
              </span>
              <span className="text-sm text-black">{step.action}</span>
            </button>
          ))
        ) : (
          <p className="py-4 text-center text-gray-400">No steps to display</p>
        )}
      </div>
    </section>
  );
};

export default ConversionSteps;
