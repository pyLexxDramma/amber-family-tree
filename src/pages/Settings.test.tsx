import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PrivacyVisibilityProvider } from "@/contexts/PrivacyVisibilityContext";
import Settings from "./Settings";

function wrap(ui: React.ReactElement) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="angelo-theme">
      <LanguageProvider>
        <PrivacyVisibilityProvider>
          <MemoryRouter initialEntries={["/classic/settings"]}>
            {ui}
          </MemoryRouter>
        </PrivacyVisibilityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

describe("Settings", () => {
  it("renders settings title and sections", () => {
    render(wrap(<Settings />));
    expect(screen.getByText("Настройки")).toBeInTheDocument();
    expect(screen.getByText("Условия использования")).toBeInTheDocument();
    expect(screen.getByText("Политика конфиденциальности")).toBeInTheDocument();
  });

  it("terms and privacy are buttons that navigate", () => {
    render(wrap(<Settings />));
    const terms = screen.getByText("Условия использования").closest("button");
    const privacy = screen.getByText("Политика конфиденциальности").closest("button");
    expect(terms).toBeInTheDocument();
    expect(privacy).toBeInTheDocument();
  });

  it("has language and privacy rows", () => {
    render(wrap(<Settings />));
    expect(screen.getByText("Язык")).toBeInTheDocument();
    expect(screen.getByText("Приватность")).toBeInTheDocument();
  });
});
