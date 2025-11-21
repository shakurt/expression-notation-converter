import { motion, AnimatePresence } from "framer-motion";

import { DownArrow, UpArrow } from "@/components/icons/ArrowsIcon";
type CollapseProps = {
  title: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
};

const ANIMATION_DURATION = 0.2;

const Collapse: React.FC<CollapseProps> = ({
  title,
  open = false,
  onToggle,
  children,
}) => {
  const buttonLabel = open ? "Collapse" : "Expand";

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        {title}
        <button
          type="button"
          className="bg-secondary flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-sm text-black"
          onClick={onToggle}
        >
          {buttonLabel}
          {buttonLabel === "Collapse" ? <UpArrow /> : <DownArrow />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: ANIMATION_DURATION }}
            className="px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Collapse;
