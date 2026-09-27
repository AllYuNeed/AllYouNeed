import { forwardRef } from "react";
import { cn } from "@/lib/cn";
import { inputClasses } from "./Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(inputClasses, "h-auto min-h-28 py-3", className)} {...props} />;
});
