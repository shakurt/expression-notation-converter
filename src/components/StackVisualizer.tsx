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

  const hasOperatorStack = currentState.operatorStack !== undefined;

  return (
    <section className="w-full" aria-label="Stack Visualizer">
      <div className="mb-2 flex flex-col gap-1" aria-label="Title Container">
        <h3 className="text-sm font-semibold text-white">Stack Visualizer</h3>
        <span className="text-xs">
          Step: {currentState.stepIndex + 1} — {currentState.action}
        </span>
      </div>

      <div className="flex gap-2">
        {/* Output Stack */}
        <div className="bg-secondary w-48 rounded-md border p-2">
          <span className="mb-2 block text-center text-xs font-medium text-nowrap text-gray-700">
            {hasOperatorStack ? "Output Stack" : "Stack"}
          </span>
          <div className="flex min-h-[100px] flex-col-reverse gap-2">
            <AnimatePresence>
              {currentState.snapshot.map((item, index) => (
                <motion.div
                  key={`output-${item}-${index}`}
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

        {/* Operator Stack - only shown for infix conversions */}
        {hasOperatorStack && (
          <div className="bg-secondary w-48 rounded-md border p-2">
            <span className="mb-2 block text-center text-xs font-medium text-nowrap text-gray-700">
              Operator Stack
            </span>
            <div className="flex min-h-[100px] flex-col-reverse gap-2">
              <AnimatePresence>
                {currentState.operatorStack!.map((item, index) => (
                  <motion.div
                    key={`operator-${item}-${index}`}
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
        )}

        {/* Stack Progression */}
        <div
          className="bg-secondary max-h-[400px] min-h-[100px] w-64 overflow-auto rounded-md border p-2"
          aria-label="Stack Progression"
        >
          <span className="mb-2 block text-center text-xs font-medium text-nowrap text-gray-700">
            Progression
          </span>
          <div className="flex flex-col gap-1">
            {hasStates ? (
              states.map((state) => (
                <div
                  key={state.stepIndex}
                  className="bg-card rounded border-b border-gray-700 p-1 pb-1 last:border-b-0"
                >
                  <span className="text-primary block text-center text-xs font-medium">
                    Step #{state.stepIndex + 1}
                  </span>
                  <div className="font-mono text-xs text-white">
                    {state.snapshot.length > 0 ? (
                      <div className="flex flex-col items-start">
                        <span>Output:</span>[{state.snapshot.join(", ")}]
                      </div>
                    ) : (
                      <div className="flex flex-col items-start">
                        <span>Output:</span>
                        <span className="text-gray-400 italic">empty</span>
                      </div>
                    )}
                    {state.operatorStack !== undefined && (
                      <>
                        {state.operatorStack.length > 0 ? (
                          <div className="flex flex-col items-start">
                            <span>Operators:</span>[
                            {state.operatorStack.join(", ")}]
                          </div>
                        ) : (
                          <div className="flex flex-col items-start">
                            <span>Operators:</span>
                            <span className="text-gray-400 italic">empty</span>
                          </div>
                        )}
                      </>
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
