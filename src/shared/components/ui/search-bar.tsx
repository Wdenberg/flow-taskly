import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Pesquisar..." }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 rounded-xl bg-card pl-9 pr-9"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Limpar pesquisa"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 size-8 -translate-y-1/2"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
