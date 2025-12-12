import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        className
      )}
      style={{ backgroundColor: 'rgba(38, 40, 55, 0.8)' }}
      {...props}
    />
  )
}

export { Skeleton }
