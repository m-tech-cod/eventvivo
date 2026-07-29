import * as React from "react"
import { cn } from "@/lib/utils"

export function Form({ className, children, ...props }: React.HTMLAttributes<HTMLFormElement>) {
  return (
    <form className={cn("space-y-4", className)} {...props}>
      {children}
    </form>
  )
}

export function FormField({ children, ...props }: { children: React.ReactNode }) {
  return <div {...props}>{children}</div>
}

export function FormItem({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  )
}

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
}

export function FormControl({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  )
}

export function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  if (!children) return null
  
  return (
    <p
      className={cn("text-sm font-medium text-red-500", className)}
      {...props}
    >
      {children}
    </p>
  )
}