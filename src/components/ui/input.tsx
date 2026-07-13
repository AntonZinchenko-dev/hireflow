import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-[rgba(0,0,0,0.09)] bg-[#f0efec] px-3 py-2 text-sm text-[#1a1a1a] transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#1a1a1a] placeholder:text-[#6b6b6b] focus-visible:border-[#cc2229] focus-visible:ring-3 focus-visible:ring-[rgba(204,34,41,0.25)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-[#eeede9] disabled:opacity-50 aria-invalid:border-[#cc2229] aria-invalid:ring-3 aria-invalid:ring-[rgba(204,34,41,0.2)] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
