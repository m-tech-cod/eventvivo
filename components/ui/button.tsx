import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const Button = ({ 
  className, 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}: ButtonProps) => {
  const variants = {
    default: 'bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90',
    outline: 'border border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A]/10',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'hover:bg-gray-100 text-gray-700'
  }
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3 py-1.5 text-sm',
    lg: 'h-11 px-8 py-2.5 text-lg'
  }
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }