import logoSrc from "@/assets/logo-camila-clean.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
  xl: "h-24",
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