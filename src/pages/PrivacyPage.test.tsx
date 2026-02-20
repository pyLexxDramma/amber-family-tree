import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PrivacyPage from "./PrivacyPage";

function wrap(ui: React.ReactElement) {
  return (
    <LanguageProvider>
      <MemoryRouter initialEntries={["/classic/privacy"]}>
        {ui}
      </MemoryRouter>
    </LanguageProvider>
  );
}

describe("PrivacyPage", () => {
  it("renders title and back button", () => {
    render(wrap(<PrivacyPage />));
    expect(screen.getByText("Политика конфиденциальности")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /назад/i })).toBeInTheDocument();
  });
});
