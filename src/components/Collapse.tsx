import React from "react";

import { motion, AnimatePresence } from "framer-motion";

type CollapseProps = {
  title: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
};

export const Collapse: React.FC<CollapseProps> = ({
  title,
  open = false,
  onToggle,
  children,
}) => {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="font-medium">{title}</div>
        <div className="text-sm text-gray-500">
          {open ? "Collapse" : "Expand"}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
