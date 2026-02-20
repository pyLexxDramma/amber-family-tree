import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getDemoMemberPhotoUrl,
  getDemoFeedPhotoUrl,
  getDemoTreeHeroUrl,
  getDemoPublicationMediaUrl,
} from "./demo-photos";

describe("demo-photos", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, origin: "https://example.com" },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  it("getDemoMemberPhotoUrl returns full URL with origin", () => {
    const url = getDemoMemberPhotoUrl("m1");
    expect(url).toContain("/demo/avatars/m1.jpg");
    expect(url).toContain("?v=1");
    expect(url).toMatch(/^https:\/\/example\.com\//);
  });

  it("getDemoFeedPhotoUrl returns feed URL", () => {
    expect(getDemoFeedPhotoUrl(1)).toContain("/demo/feed/1.jpg?v=1");
  });

  it("getDemoTreeHeroUrl returns tree hero URL", () => {
    expect(getDemoTreeHeroUrl()).toContain("/demo/tree-hero.jpg?v=1");
  });

  it("getDemoPublicationMediaUrl maps angelo and vid seeds", () => {
    expect(getDemoPublicationMediaUrl("angelo5")).toContain("/demo/feed/5.jpg");
    expect(getDemoPublicationMediaUrl("vid2")).toContain("/demo/feed/32.jpg");
  });
});
