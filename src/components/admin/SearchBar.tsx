import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { ReactNode } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  total?: number;
  filtered?: number;
  onClear?: () => void;
  filters?: ReactNode;
}

export default function SearchBar({ value, onChange, placeholder, total, filtered, onClear, filters }: Props) {
  const showCount = total !== undefined && filtered !== undefined;
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Buscar..."}
            className="pl-9 h-10"
          />
        </div>
        {filters}
      </div>
      {showCount && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span>{filtered} de {total} {filtered === 1 ? "resultado" : "resultados"}</span>
          {onClear && (value || (filtered !== total)) && (
            <Button variant="ghost" size="sm" className="h-6 text-[11px]" onClick={onClear}>
              <X className="h-3 w-3 mr-1" /> Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}