import { HelpCircle } from "lucide-react";
import { useBeginnerMode } from "../../hooks/useBeginnerMode";

type Props = {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
};

export default function HelpTip({ content, position = "top" }: Props) {
  const { isBeginner } = useBeginnerMode();

  if (!isBeginner) return null;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <span className="relative inline-block group ml-1 align-middle select-none">
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 cursor-help" />
      <span
        className={`absolute z-50 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 origin-center bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-100 text-[11px] leading-relaxed font-medium rounded-xl px-3 py-2 shadow-lg border border-slate-800 dark:border-slate-700 w-52 pointer-events-none ${positionClasses[position]}`}
      >
        {content}
      </span>
    </span>
  );
}

