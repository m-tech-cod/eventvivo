import * as React from "react"
import { cn } from "@/lib/utils"

export function DropdownMenu({ children, ...props }: { children: React.ReactNode }) {
  return (
    <div className="relative inline-block text-left" {...props}>
      {children}
    </div>
  )
}

export function DropdownMenuTrigger({ children, ...props }: { children: React.ReactNode }) {
  return (
    <button
      className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({ children, ...props }: { children: React.ReactNode; align?: 'start' | 'center' | 'end' }) {
  return (
    <div
      className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
      {...props}
    >
      <div className="py-1">{children}</div>
    </div>
  )
}

export function DropdownMenuItem({ children, onClick, className, ...props }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string 
}) {
  return (
    <button
      className={cn(
        "block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-left",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuLabel({ children, className, ...props }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 py-2 text-sm font-semibold text-gray-900", className)} {...props}>
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className, ...props }: { className?: string }) {
  return (
    <div className={cn("my-1 h-px bg-gray-200", className)} {...props} />
  )
}