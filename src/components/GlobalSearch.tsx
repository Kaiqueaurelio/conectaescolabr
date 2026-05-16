import { useState, useEffect, useRef } from "react";
import { Search, User, FileText, Calendar, AlertCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  type: "user" | "document" | "event" | "alert";
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Simular busca em dados reais
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    const query_lower = searchQuery.toLowerCase();

    // Dados de exemplo (em produção, viriam do Supabase)
    const mockResults: SearchResult[] = [
      {
        id: "1",
        type: "user",
        title: "João Silva",
        description: "Aluno - Turma A",
        icon: <User className="w-4 h-4" />,
        href: "/admin/users/1",
        color: "text-blue-500",
      },
      {
        id: "2",
        type: "user",
        title: "Maria Santos",
        description: "Responsável",
        icon: <User className="w-4 h-4" />,
        href: "/admin/users/2",
        color: "text-green-500",
      },
      {
        id: "3",
        type: "document",
        title: "Ficha de Cadastro - João Silva",
        description: "Documento de registro",
        icon: <FileText className="w-4 h-4" />,
        href: "/admin/scanning",
        color: "text-orange-500",
      },
      {
        id: "4",
        type: "event",
        title: "Reunião de Pais",
        description: "Próxima semana",
        icon: <Calendar className="w-4 h-4" />,
        href: "/admin/calendar",
        color: "text-purple-500",
      },
      {
        id: "5",
        type: "alert",
        title: "Frequência Baixa - João Silva",
        description: "5 faltas consecutivas",
        icon: <AlertCircle className="w-4 h-4" />,
        href: "/admin/attendance",
        color: "text-red-500",
      },
    ];

    const filtered = mockResults.filter(
      (result) =>
        result.title.toLowerCase().includes(query_lower) ||
        result.description.toLowerCase().includes(query_lower)
    );

    setResults(filtered);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    performSearch(query);
  }, [query]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navegação com teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        navigate(results[selectedIndex].href);
        setIsOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleResultClick = (href: string) => {
    navigate(href);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar usuários, documentos, eventos..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-2 bg-muted border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown de Resultados */}
      {isOpen && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-soft-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result.href)}
                  className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3 ${
                    index === selectedIndex ? "bg-muted" : ""
                  }`}
                >
                  <div className={`mt-0.5 ${result.color}`}>{result.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {result.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {result.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">
              Nenhum resultado encontrado para "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
