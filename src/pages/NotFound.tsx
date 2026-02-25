import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="content-card text-center p-10 max-w-sm page-enter">
        <h1 className="hero-title font-serif mb-2 text-4xl text-foreground">404</h1>
        <p className="text-[15px] font-medium text-muted-foreground mb-6">Страница не найдена</p>
        <a href="/" className="inline-block content-card min-h-[48px] px-6 rounded-2xl border-2 font-semibold text-foreground hover:border-primary/40 hover:shadow-md transition-all py-3">
          На главную
        </a>
      </div>
    </div>
  );
};

export default NotFound;
