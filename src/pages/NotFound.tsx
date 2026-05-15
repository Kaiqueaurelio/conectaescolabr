import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>
        <h1 className="mb-2 text-5xl font-bold tracking-tight">404</h1>
        <p className="mb-2 text-xl font-semibold text-foreground">Página não encontrada</p>
        <p className="mb-6 text-muted-foreground">
          Desculpe, a página que você está procurando não existe ou foi movida. Verifique a URL e tente novamente.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <Button asChild className="gradient-primary text-primary-foreground">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Voltar para a página inicial
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/login">
              Acessar minha conta
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
