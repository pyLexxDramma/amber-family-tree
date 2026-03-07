import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <AppLayout>
      <div className="prototype-screen min-h-screen bg-[var(--proto-bg)] flex items-center justify-center p-6">
        <div className="rounded-xl bg-[var(--proto-card)] border border-[var(--proto-border)] text-center p-10 max-w-sm">
          <h1 className="font-serif mb-2 text-4xl text-[var(--proto-text)]">404</h1>
          <p className="text-[15px] font-medium text-[var(--proto-text-muted)] mb-6">Страница не найдена</p>
          <Link to="/" className="inline-block min-h-[48px] px-6 rounded-2xl border-2 border-[var(--proto-active)] font-semibold text-[var(--proto-text)] hover:bg-[var(--proto-active)]/10 transition-all py-3">
            На главную
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
