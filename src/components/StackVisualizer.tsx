import { motion, AnimatePresence } from "framer-motion";

import type { StackState } from "@/types";

type StackVisualizerProps = {
  states: StackState[];
  currentStep?: number;
};

const EMPTY_STATE: StackState = {
  snapshot: [],
  action: "No steps available",
  stepIndex: 0,
};

const ANIMATION_DURATION = 0.16;

const StackVisualizer: React.FC<StackVisualizerProps> = ({
  states,
  currentStep = states.length - 1,
}) => {
  const getCurrentState = (): StackState => {
    if (states.length === 0) return EMPTY_STATE;
    return states[currentStep] ?? states[states.length - 1];
  };

  const currentState = getCurrentState();
  const hasStates = states.length > 0;

  return (
    <section className="w-full" aria-label="Stack Visualizer">
      <div className="mb-2 flex flex-col gap-1" aria-label="Title Container">
        <h3 className="text-sm font-semibold text-white">Stack Visualizer</h3>
        <span className="text-xs">
          Step: {currentState.stepIndex + 1} — {currentState.action}
        </span>
      </div>

      <div className="flex gap-4">
        <div className="bg-secondary w-48 rounded-md border p-2">
          <div className="mb-2 text-xs text-gray-700">Stack (bottom → top)</div>
          <div className="flex min-h-[100px] flex-col-reverse gap-2">
            <AnimatePresence>
              {currentState.snapshot.map((item, index) => (
                <motion.div
                  key={`${item}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: ANIMATION_DURATION }}
                  className="bg-card rounded p-2 text-sm font-medium text-white shadow-sm"
                >
                  {item}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1" aria-label="Stack Trace">
          <h4 className="mb-2 text-xs text-white">Stack progression</h4>
          <div className="bg-secondary max-h-40 overflow-auto rounded p-2 text-sm">
            {hasStates ? (
              states.map((state) => (
                <div
                  key={state.stepIndex}
                  className="mb-1 flex flex-col gap-1 border-b pb-1 last:border-b-0"
                >
                  <span className="text-xs text-gray-700">
                    Step #{state.stepIndex + 1}
                  </span>
                  <div className="font-mono text-sm text-gray-800">
                    {state.snapshot.length > 0 ? (
                      <span>[{state.snapshot.join(", ")}]</span>
                    ) : (
                      <span className="text-gray-500 italic">empty</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-gray-400">No steps to show</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StackVisualizer;
