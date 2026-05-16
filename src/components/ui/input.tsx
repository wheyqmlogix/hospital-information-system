import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-sm border border-slate-300 bg-slate-50/50 px-3 py-1 text-[11px] font-bold uppercase tracking-tight transition-all placeholder:text-slate-300 focus-visible:outline-none focus-visible:border-[#0f172a] focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 text-[#0f172a]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
