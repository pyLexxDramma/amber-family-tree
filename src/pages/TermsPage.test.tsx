import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import TermsPage from "./TermsPage";

function wrap(ui: React.ReactElement) {
  return (
    <LanguageProvider>
      <MemoryRouter initialEntries={["/classic/terms"]}>
        {ui}
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe("TermsPage", () => {
  it("renders title and back button", () => {
    render(wrap(<TermsPage />));
    expect(screen.getByText("Условия использования")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /назад/i })).toBeInTheDocument();
  });
});
