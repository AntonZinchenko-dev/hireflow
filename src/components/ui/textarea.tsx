import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-lg border border-[rgba(0,0,0,0.09)] bg-[#f0efec] px-3 py-2 text-sm text-[#1a1a1a] transition-colors outline-none placeholder:text-[#6b6b6b] focus-visible:border-[#cc2229] focus-visible:ring-3 focus-visible:ring-[rgba(204,34,41,0.25)] disabled:cursor-not-allowed disabled:bg-[#eeede9] disabled:opacity-50 aria-invalid:border-[#cc2229] aria-invalid:ring-3 aria-invalid:ring-[rgba(204,34,41,0.2)] md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
