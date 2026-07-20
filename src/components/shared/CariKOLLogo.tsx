import { cn } from "@/lib/utils"

interface Props {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeMap = {
  xs: "text-base",
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-5xl",
}

export function CariKOLLogo({ size = "md", className }: Props) {
  return (
    <span className={cn("font-extrabold tracking-tight", sizeMap[size], className)}>
      <span className="text-[#1B1B2E]">Cari</span>
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: "linear-gradient(90deg, #7C3AED, #A855F7)" }}
      >
        KOL
      </span>
      <span className="text-[#E8547A]">.</span>
    </span>
  )
}
