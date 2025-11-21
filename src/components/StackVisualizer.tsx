import React from "react";

import { motion, AnimatePresence } from "framer-motion";

import type { StackState } from "@/types";

type Props = {
  states: StackState[];
  currentStep?: number;
};

export const StackVisualizer: React.FC<Props> = ({
  states,
  currentStep = states.length - 1,
}) => {
  const state = states.length
    ? states[currentStep] || states[states.length - 1]
    : { snapshot: [], action: "no steps", stepIndex: 0 };

  return (
    <div className="w-full">
      <div className="mb-2 text-sm text-gray-600">
        Step: {state.stepIndex} — {state.action}
      </div>
      <div className="flex gap-4">
        <div className="w-48 rounded-md border bg-gray-50 p-2">
          <div className="mb-2 text-xs text-gray-500">Stack (bottom → top)</div>
          <div className="flex flex-col-reverse gap-2">
            <AnimatePresence>
              {state.snapshot.map((item, idx) => (
                <motion.div
                  key={`${item}-${idx}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16 }}
                  className="rounded border bg-white p-2 text-sm"
                >
                  {item}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-2 text-xs text-gray-500">
            Stack trace (all steps)
          </div>
          <div className="max-h-40 overflow-auto rounded bg-gray-50 p-2 text-sm">
            {states.map((s) => (
              <div key={s.stepIndex} className="mb-1">
                <div className="text-xs text-gray-400">#{s.stepIndex}</div>
                <div className="">{s.action}</div>
              </div>
            ))}
            {states.length === 0 && (
              <div className="text-gray-400">No steps to show</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
