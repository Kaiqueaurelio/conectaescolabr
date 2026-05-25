import logoSrc from "@/assets/logo-camila.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-9",
  md: "h-11",
  lg: "h-20",
  xl: "h-28",
};

export default function Logo({ className, size = "md" }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="Associação Camila — Em defesa e valorização da vida"
      className={cn(sizeMap[size], "w-auto object-contain", className)}
    />
  );
}